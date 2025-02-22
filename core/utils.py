"""
工具类模块，提供通用的数据结构和算法支持

设计目标：
1. 提供高效的排序和合并操作
2. 实现便捷的字典访问方式
3. 确保类型安全

主要功能：
1. sorted_append: 保持有序列表的插入操作
2. sorted_merge: 多个有序列表的高效合并
3. AttrDict: 支持属性访问的字典类

实现特点：
- 使用泛型保证类型安全
- 优化算法性能
- 支持深拷贝和序列化
"""

from typing import TypeVar, Callable, Any, List
from heapq import heappush, heappop

T = TypeVar('T')

# list工具
def sorted_append(lst: list[T], obj: T, key: Callable[[T], Any] = lambda x: x):
    '''
    将新元素插入到相同 key 片段的末尾

    Args:
        lst: 待插入列表
        obj: 待插入元素
        key: 排序键函数，默认为恒等函数

    Returns:
        None
    '''
    v = key(obj)
    j = 0
    for i in range(len(lst)):
        if v >= key(lst[i]):
            j += 1
        else:
            break
    lst.insert(j, obj)

def sorted_merge(*lists: List[T], key: Callable[[T], Any] = lambda x: x) -> List[T]:
    '''
    使用优先队列合并任意个有序列表，保持排序特性

    Args:
        *lists: 任意个有序列表
        key: 排序键函数，默认为恒等函数

    Returns:
        合并后的有序列表
    '''
    result = []
    heap = []
    # 为每个列表创建一个迭代器
    iterators = [iter(lst) for lst in lists if lst]

    # 初始化优先队列，将每个列表的第一个元素入队
    for i, iterator in enumerate(iterators):
        try:
            item = next(iterator)
            # 将(键值, 索引, 元素)入队，索引用于在键值相同时保持稳定性
            heappush(heap, (key(item), i, item))
        except StopIteration:
            pass

    # 不断从优先队列中取出最小元素
    while heap:
        _, i, item = heappop(heap)
        result.append(item)
        try:
            next_item = next(iterators[i])
            heappush(heap, (key(next_item), i, next_item))
        except StopIteration:
            pass

    return result

import copy

class AttrDict(dict):
    """
    一个支持通过属性访问的字典类

    特性:
    - 支持通过字典方式访问 (d['key'])
    - 支持通过属性方式访问 (d.key)
    - 支持嵌套字典的属性访问
    - 保护内置属性不被覆盖
    - 支持与普通字典/JSON互相转换

    示例:
        >>> d = AttrDict({'a': 1, 'b': {'c': 2}})
        >>> d.a  # 返回 1
        >>> d.b.c  # 返回 2
        >>> d['a']  # 返回 1
        >>> d.update({'x': 3})  # 正常工作
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        # 递归转换嵌套的字典
        for key, value in self.items():
            if isinstance(value, dict) and not isinstance(value, AttrDict):
                self[key] = AttrDict(value)

    def __getattr__(self, key: str) -> Any:
        """通过属性访问字典键"""
        try:
            return self[key]
        except KeyError:
            raise AttributeError(f"'AttrDict' object has no attribute '{key}'")

    def __setattr__(self, key: str, value: Any) -> None:
        """通过属性设置字典键"""
        # 保护内置属性
        if key.startswith('__'):
            super().__setattr__(key, value)
        else:
            # 转换在 setitem 进行
            self[key] = value

    def __setitem__(self, key: str, value: Any) -> None:
        '''设置字典键时进行转换'''
        if isinstance(value, dict) and not isinstance(value, AttrDict):
            value = AttrDict(value)
        super().__setitem__(key, value)

    def __delattr__(self, key: str) -> None:
        """通过属性删除字典键"""
        try:
            del self[key]
        except KeyError:
            raise AttributeError(f"'AttrDict' object has no attribute '{key}'")

    def __repr__(self) -> str:
        """返回对象的字符串表示"""
        return f"{self.__class__.__name__}({super().__repr__()})"

    def __copy__(self):
        """支持浅拷贝"""
        return AttrDict(super().copy())

    def __deepcopy__(self, memo):
        """支持深拷贝"""
        return AttrDict(copy.deepcopy(dict(self), memo))

# 测试代码
if __name__ == "__main__":
    # 基本用法测试
    config = AttrDict({
        'name': 'test',
        'database': {
            'host': 'localhost',
            'port': 5432
        },
        'options': {
            'debug': True,
            'cache': {
                'enabled': True,
                'timeout': 300
            }
        }
    })




if __name__=='__main__':
    lst = []
    sorted_append(lst, 1)
    print(lst)
    sorted_append(lst, 1)
    print(lst)
    sorted_append(lst, 1)
    print(lst)
    sorted_append(lst, 2)
    print(lst)
    sorted_append(lst, 1)
    print(lst)


    # 测试初始化和基本功能
    print("测试 1: 初始化和基本功能")
    d = AttrDict({'a': 1, 'b': {'c': 2}})
    print(f"d.a = {d.a}")
    print(f"d['a'] = {d['a']}")
    print(f"d.b.c = {d.b.c}")
    print(f"isinstance(d.b, AttrDict) = {isinstance(d.b, AttrDict)}")
    print(f"repr(d) = {repr(d)}")

    # 测试属性设置和删除
    print("\n测试 2: 属性设置和删除")
    d.x = 3
    print(f"设置 d.x = 3, 结果: d.x = {d.x}")
    d['y'] = 4
    print(f"设置 d['y'] = 4, 结果: d.y = {d.y}")
    del d.x
    try:
        print(d.x)
    except AttributeError as e:
        print(f"删除 d.x 后访问: {e}")

    # 测试嵌套字典
    print("\n测试 3: 嵌套字典")
    d.nested = {'a': {'b': {'c': 1}}}
    print(f"d.nested.a.b.c = {d.nested.a.b.c}")
    print(f"isinstance(d.nested, AttrDict) = {isinstance(d.nested, AttrDict)}")
    print(f"isinstance(d.nested.a, AttrDict) = {isinstance(d.nested.a, AttrDict)}")

    # 测试与普通字典的互操作
    print("\n测试 4: 与普通字典的互操作")
    normal_dict = dict(d)
    print(f"转换为普通字典: {normal_dict}")
    print(f"普通字典访问: normal_dict['a'] = {normal_dict['a']}")

    # 测试内置属性保护
    print("\n测试 5: 内置属性保护")
    d.__custom__ = "test"
    print(f"设置内置属性 d.__custom__ = {d.__custom__}")
    print(f"__custom__ 不在字典中: '__custom__' in d = {'__custom__' in d}")

    # 测试异常处理
    print("\n测试 6: 异常处理")
    try:
        print(d.nonexistent)
    except AttributeError as e:
        print(f"访问不存在的属性: {e}")

    # 测试方法调用
    print("\n测试 7: 方法调用")
    print(f"d.keys() = {d.keys()}")
    print(f"d.get('a') = {d.get('a')}")
    d.update({'z': 26})
    print(f"更新后 d.z = {d.z}")

    # 测试深层嵌套和更新
    print("\n测试 8: 深层嵌套和更新")
    d.deep = {'level1': {'level2': {'level3': 'value'}}}
    print(f"深层嵌套访问: d.deep.level1.level2.level3 = {d.deep.level1.level2.level3}")
    d.deep.level1.level2.level3 = 'new_value'
    print(f"更新后: d.deep.level1.level2.level3 = {d.deep.level1.level2.level3}")

    # 输出最终的 AttrDict
    print("\n最终的 AttrDict:")
    print(d)