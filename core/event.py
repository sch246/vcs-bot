"""
事件系统，实现基于发布-订阅模式的事件驱动架构

设计目标：
1. 解耦组件间的通信
2. 支持灵活的事件处理流程
3. 提供优先级和控制机制

主要特性：
1. 事件继承体系：支持事件分类和层次化处理
2. 优先级机制：控制处理器执行顺序
3. 传播控制：支持事件传播的暂停和强制执行
4. 上下文管理：提供事件处理的上下文信息

实现方式：
- 使用装饰器语法提供简洁的API
- 采用弱引用避免内存泄漏
- 支持同步和异步处理器
"""

from weakref import WeakKeyDictionary
from typing import Any, Type, Callable, TypeVar, Generic, Coroutine
from inspect import iscoroutinefunction
import traceback
import logging
from asyncio import Lock

logger = logging.getLogger(__name__)

from .predicate import true_func
from .utils import sorted_append, sorted_merge, AttrDict

T = TypeVar('T')

class Context(Generic[T]):
    """
    默认事件上下文，包含事件本身和可以对事件进行的操作
    其它模块可以继承此类以提供扩展的上下文
    同时保存事件结果和控制事件传播

    属性:
        event: 原始事件对象
        result: 事件处理结果
        _stopped: 是否停止事件传播的内部标记
    """
    def __init__(self, event: T):
        self.event = event
        self.result: Any = None
        self._stopped: bool = False

    def stop_propagation(self):
        """停止事件传播，阻止后续的非强制处理器执行"""
        self._stopped = True

    def __repr__(self):
        return f'Context({self.event})'

class Event(AttrDict):
    '''
    默认事件基类，用于存储事件数据
    其它模块可以继承此类以注册更多自定义事件类型

    特点:
    父类事件处理器在所有子类事件处理器之前触发, 监听此基类相当于监听所有事件
    '''

class Order:
    '''
    事件优先级，值越小越先被处理
    高优先级可以用于预处理输入、提供延迟、敏感词过滤、截流输入等
    低优先级且force可以用于后处理结果、日志记录等
    '''
    ADMIN = 0
    BLOCK = 1
    BEFORE = 2
    NORMAL = 3
    AFTER = 4
    END = 5
    RESULT = 6

type EventHandlerFunc = Callable[[Context], Any | Coroutine[Any, Any, Any]]

class EventHandler:
    '''
    事件处理器类，用于包装和管理事件处理函数

    特性:
    1. 支持优先级排序
    2. 支持强制执行(即使事件传播被停止)
    3. 支持一次性处理器
    4. 支持条件过滤
    5. 自动注册到全局事件系统

    用法示例:
    @on(MyEvent)
    async def handle_event(ctx):
        # 处理事件
        pass

    @on(MyEvent).order(1).force().once()
    def handle_once(ctx):
        # 优先级1，强制执行，只执行一次
        pass
    '''
    func: Callable | None
    def __init__(
        self,
        event_type: Type[Event],
    ):
        self.func: EventHandlerFunc | None = None
        self.event_type = event_type
        self._order: int = Order.NORMAL
        self._force: bool = False
        self._once: bool = False
        self._filter: Callable[[Context], bool] = true_func

    def __repr__(self):
        return f'EventHandler({self.event_type.__name__})({self.func.__name__})'

    def __call__(self, func: EventHandlerFunc):
        """装饰器实现，用于注册事件处理函数"""
        if self.func is None:
            # 由于handler基于_handlers，其键值会被自动回收
            # 因此不需要额外的弱引用
            self.func = func
            # 注册到事件系统
            with _handlers_lock:
                lst = _handlers.setdefault(self.event_type, [])
                sorted_append(lst, self, lambda e: e._order)
            return func

    def order(self, order: int = 0):
        """设置处理器优先级"""
        self._order = order
        return self

    def force(self):
        """设置为强制执行（即使事件传播被停止）"""
        self._force = True
        return self

    def once(self):
        """设置为只执行一次"""
        self._once = True
        return self

    def filter(self, filter: Callable[[Context], bool]):
        """设置条件过滤函数"""
        self._filter = filter
        return self

    def remove(self):
        """从事件系统中移除此处理器"""
        with _handlers_lock:
            handlers = _handlers.get(self.event_type, [])
            if self in handlers:
                handlers.remove(self)



# 全局锁，用于保护 _handlers 的访问
_handlers_lock = Lock()
# 使用弱引用字典存储事件处理器，防止内存泄漏
_handlers: WeakKeyDictionary[Type[Event], list[EventHandler]] = WeakKeyDictionary()

def on(event_type: Type[Event]):
    """
    事件处理器装饰器工厂函数
    用于创建新的事件处理器
    """
    return EventHandler(event_type)

async def emit(val: Event | Context) -> Any:
    """
    触发事件，按优先级顺序执行所有相关的事件处理器

    处理流程:
    1. 创建事件上下文
    2. 收集事件类及其所有父类的处理器
    3. 按优先级排序(优先级小的优先 -> 父类优先 -> 先添加的优先)
    4. 依次执行处理器，支持同步和异步函数
    5. 处理执行结果和异常

    特点:
    - 支持事件继承体系
    - 父类事件处理器优先执行
    - 支持处理器返回值作为事件结果
    - 异常安全，单个处理器异常不影响其他处理器
    """
    # 创建事件上下文
    if isinstance(val, Event):
        event = val
        context = Context(event)
    elif isinstance(val, Context):
        event = val.event
        context = val
    else:
        raise TypeError()

    # 遍历事件类及其父类
    event_classes = [event.__class__]
    current_class = event.__class__
    while True:
        parent_class = current_class.__base__
        if parent_class is Event.__base__: # 直到到达Event的父类
            break
        # 父类的侦听器排在前面
        event_classes.insert(0, parent_class)
        current_class = parent_class

    # 收集所有相关handler
    with _handlers_lock:
        all_handlers = sorted_merge(*map(
                lambda cls: _handlers.get(cls, []),
                event_classes),
                key=lambda e: e._order)

    # 处理事件
    for handler in all_handlers:
        if context._stopped and not handler._force:
            continue

        try:
            if not handler._filter(context):
                continue

            if iscoroutinefunction(handler.func):
                result = await handler.func(context)
            else:
                result = handler.func(context)

            if not result is None:
                context.result = result
                context.stop_propagation()

            # 仅在条件通过，执行过后清除临时侦听器
            if handler._once:
                with _handlers_lock:
                    if handler in _handlers.get(handler.event_type, []):
                        _handlers[handler.event_type].remove(handler)
        except:
            logger.error(f"执行 {handler} 时发生了错误")
            logger.error(traceback.format_exc())
            continue

    return event.result


def get_handler(event_type: Type[Event], func: Callable):
    """
    根据事件类型和处理函数获取对应的处理器实例
    """
    with _handlers_lock:
        for handler in _handlers.get(event_type, []):
            if handler.func == func:
                return func
        return None

def remove_handler(event_type: Type[Event], func: Callable, count=0):
    """
    移除指定的事件处理器

    Args:
        event_type: 事件类
        func: 被注册的函数
        count: 移除的数量，0表示移除所有匹配的处理器
    """
    with _handlers_lock:
        handlers = _handlers.get(event_type, [])
        for i in range(len(handlers)):
            if handlers[i].func == func:
                handlers.remove(handlers[i])
                count -= 1
                if count == 0:
                    return

if __name__=='__main__':
    ...
