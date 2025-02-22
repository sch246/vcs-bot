"""
平台适配器系统，提供统一的消息收发接口

设计目标：
1. 屏蔽不同平台的差异
2. 提供高性能的消息处理
3. 支持可靠的资源管理

核心功能：
- 继承Adapter作为适配器，全局一个，管理适配器的生命周期和格式转换
- 继承AdapterContext作为随着消息传递的上下文，每次消息事件都新生成一个，负责提供自定义api和自定义属性

实现特点：
- 使用抽象基类定义接口
- 采用异步架构提高性能
- 支持优雅启动和关闭
"""

from abc import abstractmethod
from typing import Callable, Any, Type
from contextlib import suppress
from asyncio import Future, wait_for, sleep, gather, create_task, Queue
import logging
logger = logging.getLogger(__name__)

from .event import Event, Context, on, emit, Order, remove_handler
from .message import Message, MessageEvent
from .predicate import true_func





class SendMessageEvent(Event):
    """基础消息发送事件类"""
    def __init__(self, message: Message):
        super().__init__()
        self.message = message

class SendPrivateMessageEvent(SendMessageEvent):
    """私聊消息发送事件类"""
    def __init__(self, message: Message, user_id: int = None):
        super().__init__()
        self.message = message
        self.user_id = user_id

class SendGroupMessageEvent(SendMessageEvent):
    """群聊消息发送事件类"""
    def __init__(self, message: Message, group_id: int = None):
        super().__init__()
        self.message = message
        self.group_id = group_id

class AdapterContext(Context):
    '''
    适配器上下文基类，提供统一的消息发送和接收接口
    新的平台适配器应继承这个类
    以此为基底来添加 api
    '''
    def __init__(self, event: Event):
        super().__init__(event)

    async def send(
            self,
            message: Message,
            message_type: str = None,
            user_id: int = None,
            group_id: int = None,
            **kws, # 允许传递额外参数用于初始化新的 context
        ):
        """
        统一的消息发送接口
        根据消息类型和目标ID创建相应的发送事件并触发

        Args:
            message: 要发送的消息
            message_type: 消息类型 ('private' 或 'group')
            user_id: 目标用户ID (私聊时使用)
            group_id: 目标群组ID (群聊时使用)
            **kws: 额外的上下文初始化参数
        """
        if message_type is None:
            if isinstance(self.event, MessageEvent):
                message_type = self.event.message_type
            elif not group_id is None:
                message_type = 'group'
            elif not user_id is None:
                message_type = 'private'
            else:
                raise ValueError()

        if message_type == 'private':
            if user_id is None:
                user_id = self.event.user_id
            # 让发送消息的事件使用一样类型的 context
            context = self.__class__(
                SendPrivateMessageEvent(message, user_id),
                **kws,
            )
            return await emit(context)
        else:
            if group_id is None:
                group_id = self.event.group_id
            # 让发送消息的事件使用一样类型的 context
            context = self.__class__(
                SendGroupMessageEvent(message, group_id),
                **kws,
            )
            return await emit(context)

    async def recv(self, filter: Callable[[MessageEvent], bool] = true_func, timeout=30):
        """
        等待并接收下一条满足过滤条件的消息

        Args:
            filter: 消息过滤函数
            timeout: 超时时间(秒)

        Returns:
            满足条件的消息事件

        Raises:
            TimeoutError: 在指定时间内未收到满足条件的消息
        """
        future = Future()

        @on(MessageEvent).order(Order.BLOCK).filter(filter).once()
        async def func(event: MessageEvent):
            future.set_result(event)
            event.stop_propagation()

        try:
            return await wait_for(future, timeout=timeout)
        except Exception as e:
            # 包括 Timeout 时需要移除侦听器
            remove_handler(MessageEvent, func)
            raise e









class Adapter:
    """
    通用适配器基类，提供消息队列和并发处理功能
    """
    def __init__(self, max_concurrent=100, queue_size: int = 1000):
        """
        初始化适配器

        Args:
            max_concurrent: 最大并发处理任务数
            queue_size: 消息队列大小
        """
        self.running = False
        self.max_concurrent = max_concurrent
        self.message_queue: Queue[AdapterContext[Event]] = Queue(maxsize=queue_size)
        self.active_tasks = set()

        (on(SendMessageEvent)
            .filter(lambda context:
                    isinstance(context, self.get_context_type()))
        (self.send))

    async def start(self):
        """启动适配器，开始接收和处理消息"""
        self.running = True
        # 启动消息分发器
        create_task(self._dispatcher())

        while self.running:
            try:
                context = await self.recv()
                # 将新消息放入队列
                await self.message_queue.put(context)
            except Exception as e:
                logger.error(f"Error receiving message: {e}")
                await sleep(1)

    async def _dispatcher(self):
        """
        消息分发器
        负责从队列获取消息并创建新的处理任务，同时管理并发数量
        """
        while self.running:
            try:
                # 当活跃任务数量达到上限时等待
                while len(self.active_tasks) >= self.max_concurrent:
                    # 清理已完成的任务
                    done_tasks = {task for task in self.active_tasks if task.done()}
                    for task in done_tasks:
                        self.active_tasks.remove(task)
                        # 获取任务的异常信息(如果有)
                        with suppress(Exception):
                            await task
                    if len(self.active_tasks) >= self.max_concurrent:
                        await sleep(0.1)

                context = await self.message_queue.get()
                # 创建新的处理任务
                task = create_task(self._handle_recv(context))
                self.active_tasks.add(task)
                self.message_queue.task_done()

            except Exception as e:
                logger.error(f"Error in dispatcher: {e}")
                await sleep(1)

    async def stop(self):
        """优雅地停止适配器，确保所有消息都被处理完成"""
        self.running = False
        #TODO 需要能够主动断开连接，否则self.recv会卡住
        # 等待所有消息处理完成
        await self.message_queue.join()
        # 等待所有活跃任务完成
        if self.active_tasks:
            await gather(*self.active_tasks, return_exceptions=True)

    async def _handle_recv(self, context: AdapterContext[Event]):
        """
        处理接收到的事件
        创建对应的上下文并触发事件，处理返回值
        """
        try:
            result = await emit(context)

            if result is not None:
                event = context.event
                # 如果返回值非 None, 尽最大能力发送出去
                if isinstance(event, MessageEvent):
                    context.send(result)
                elif hasattr(event, 'group_id'):
                    context.send(result, group_id=event.group_id)
                elif hasattr(event, 'user_id'):
                    context.send(result, user_id=event.user_id)
        except Exception as e:
            logger.error(f"Error handling message: {e}")


    @abstractmethod
    @staticmethod
    def get_context_type() -> Type[AdapterContext]:
        '''获取自身的 context 类型，应返回继承自 AdapterContext 的类'''
        pass

    @abstractmethod
    async def recv(self) -> AdapterContext[Event]:
        """从平台接收消息并转换为上下文对象"""
        pass

    @abstractmethod
    async def send(self, event: Event):
        """将事件对象转换并发送到平台"""
        pass

    @abstractmethod
    def from_platform_event(self, platform_event: Any) -> Event:
        """将平台特定的事件格式转换为内部Event对象"""
        pass

    @abstractmethod
    def to_platform_event(self, event: Event) -> Any:
        """将内部Event对象转换为平台特定的事件格式"""
        pass
