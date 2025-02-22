"""
条件匹配系统，提供灵活的对象匹配和过滤功能

设计目标：
1. 支持复杂的匹配规则
2. 提供声明式的匹配语法
3. 确保高效的匹配性能

主要功能：
1. 基础匹配：值相等、类型匹配等
2. 结构匹配：支持字典、列表、集合等
3. 逻辑组合：And、Or、Not等操作
4. 特殊语义：Optional、Undefined等

实现特点：
- 递归处理复杂数据结构
- 支持自定义匹配函数
- 优化匹配性能
"""

from typing import Any, Iterable
import traceback


class Undefined:
    def __call__(self, arg):
        return False
    def __bool__(self):
        return False
    def __repr__(self):
        return "undefined"
    def __str__(self):
        return "undefined"

class _Optional:
    def __init__(self, matcher):
        self.filter = match(matcher)
    def __call__(self, arg):
        return self.filter(arg)

undefined = Undefined()
_check_object = object()

true_func = lambda _: True
false_func = lambda _: False


def match(matcher: Any = _check_object, **kws):
    """
    创建一个匹配函数
    当设置为 undefined 时，表示在对象和字典中不能有对应键，在列表和元组中出现会报错
    当设置了 Undefined 时，在列表和元组中出现表示不能有满足条件的值

    Args:
        matcher: 匹配器，可以是以下类型:
            - _check_object: 默认值，使用kws匹配对象
            - undefined: 跳过匹配
            - dict: 递归匹配字典
            - list: 匹配列表中任意元素
            - tuple: 按位置递归匹配
            - callable: 直接使用该函数
            - type: 类型匹配
            - other: 值相等匹配
        **kws: 属性匹配参数

    Returns:
        callable: 返回一个接受单个参数的匹配函数
    """
    if matcher is undefined:
        return undefined
    elif matcher is _check_object:
        funcs = []
        for k, v in kws.items():
            v = match(v)
            if v is undefined:
                funcs.append(lambda arg, k=k: not hasattr(arg, k))
            elif isinstance(v, _Optional):
                funcs.append(lambda arg, k=k, v=v: not hasattr(arg, k) or v(arg[k]))
            else:
                funcs.append(lambda arg, k=k, v=v: hasattr(arg, k) and v(getattr(arg, k)))
        return lambda arg: all(func(arg) for func in funcs)
    elif isinstance(matcher, dict):
        funcs = [lambda arg: isinstance(arg, dict)]
        for k, v in matcher.items():
            v = match(v)
            if v is undefined:
                funcs.append(lambda arg, k=k: not k in arg)
            elif isinstance(v, _Optional):
                funcs.append(lambda arg, k=k, v=v: not k in arg or v(arg[k]))
            else:
                funcs.append(lambda arg, k=k, v=v: k in arg and v(arg[k]))
        return lambda arg: all(func(arg) for func in funcs)
    elif isinstance(matcher, set):
        # 判断是否所有条件都存在一一对应的元素来满足
        matcher = [m for m in map(match, matcher)
                if not isinstance(m, Undefined|_Optional)]
        max_i = len(matcher)
        def _filter(arg):
            if not isinstance(arg, (set, tuple, list)):
                return False
            elements = list(arg)
            if len(elements) < max_i:
                return False

            # 提前检查：统计每个条件可能匹配的元素数量
            possible_matches = [0] * len(matcher)
            element_matches = [[] for _ in range(len(elements))]

            # 预处理：构建可能的匹配关系
            for i, element in enumerate(elements):
                for j, cond in enumerate(matcher):
                    if cond(element):
                        possible_matches[j] += 1
                        element_matches[i].append(j)

            # 提前剪枝：检查是否有条件完全无法匹配
            if any(count == 0 for count in possible_matches):
                return False

            # 优化：从匹配选择最少的条件开始处理
            conditions = list(range(len(matcher)))
            conditions.sort(key=lambda x: possible_matches[x])

            used = [False] * len(elements)
            def backtrack(index):
                if index == len(conditions):
                    return True

                cond_index = conditions[index]
                # 只遍历可能匹配这个条件的元素
                for i in range(len(elements)):
                    if not used[i] and cond_index in element_matches[i]:
                        used[i] = True
                        if backtrack(index + 1):
                            return True
                        used[i] = False
                return False

            return backtrack(0)
        return _filter
    elif isinstance(matcher, list):
        # 判断是否存在n个元素满足条件（有序）
        matcher = [m for m in map(match, matcher)
                   if not isinstance(m, Undefined|_Optional)]
        max_i = len(matcher)
        def _filter(arg):
            if not isinstance(arg, tuple|list):
                return False
            if len(arg) < max_i:
                return False
            i = 0
            for v in arg:
                if i >= max_i:
                    return True
                if matcher[i](v):
                    i += 1
            return i == max_i
        return _filter
    elif isinstance(matcher, tuple):
        # 严格判断前 n 位
        matcher = [m for m in map(match, matcher)
                   if not isinstance(m, Undefined|_Optional)]
        max_i = len(matcher)
        def _filter(arg):
            if not isinstance(arg, tuple|list):
                return False
            if len(arg) < max_i:
                return False
            for i in range(max_i):
                if not matcher[i](arg[i]):
                    return False
            return True
        return _filter
    elif isinstance(matcher, type):
        return lambda arg: isinstance(arg, matcher)
    elif callable(matcher):
        return matcher
    else:
        return lambda arg: arg == matcher


def And(*matchers: Any):
    '''
    与
    匹配一个对象
    '''
    matchers = list(match(matcher) for matcher in matchers)
    if undefined in matchers:
        if all(matcher is undefined for matcher in matchers):
            # 若全是 undefined
            return undefined
        else:
            # 若 undefined 与其它条件同时存在，判定为 false
            return false_func
    return lambda arg: all(matcher(arg) for matcher in matchers)

def Or(*matchers: Any):
    '''
    或
    匹配一个对象
    '''
    matchers = list(match(matcher) for matcher in matchers)
    if undefined in matchers:
        if all(matcher is undefined for matcher in matchers):
            # 若全是 undefined
            return undefined
        else:
            # undefined 是假值，不影响 any 的判定，不需要特地移除
            return _Optional(lambda arg: any(matcher(arg) for matcher in matchers))
    return lambda arg: any(matcher(arg) for matcher in matchers)

def Not(matcher: Any):
    '''
    非
    匹配一个对象
    '''
    matcher = match(matcher)
    if matcher is undefined:
        # 不是未定义，那么接收任意值都没问题，等价于 Any
        return true_func
    return lambda arg: not matcher(arg)

def ForAll(matcher: Any):
    '''
    全称量词：集合所有元素必须满足条件
    匹配一个可迭代对象
    '''
    m = match(matcher)
    def _filter(arg):
        if not isinstance(arg, Iterable):
            return False
        return all(m(v) for v in arg)
    return _filter

def Exist(matcher: Any):
    '''
    存在量词：集合至少有一个元素满足条件
    匹配一个可迭代对象
    '''
    m = match(matcher)
    def _filter(arg):
        if not isinstance(arg, Iterable):
            return False
        return any(m(v) for v in arg)
    return _filter

if __name__=='__main__':
    def is_msg(msg):
        return 'message' in msg
    def match_user(user_id):
        return lambda e: e['user_id'] == user_id
    class Person:
        def __init__(self, name, age):
            self.name = name
            self.age = age

    # 测试And
    assert And(is_msg, match_user(233))({'message':'awa', 'user_id':233})

    assert And(is_msg, match_user(233))({'message':'awa', 'user_id':233})
    assert not And(is_msg, match_user(233))({'message':'awa', 'user_id':234})  # 应失败

    # 测试Or
    or_matcher = Or(match_user(233), match_user(345))
    assert or_matcher({'user_id': 233})
    assert or_matcher({'user_id': 345})
    assert not or_matcher({'user_id': 100})

    # 测试Not
    not_minor = Not(match(age=lambda x: x < 18))
    assert not_minor(Person("Tom", 20))
    assert not not_minor(Person("Tom", 15))

    # 测试字典匹配
    dict_matcher = match({"name": "Bob", "age": lambda x: x >=30})
    assert dict_matcher({"name": "Bob", "age": 35})
    assert not dict_matcher({"name": "Bob", "age": 25})
    assert not dict_matcher({"name": "Bob"})  # 缺少age键

    # 测试列表匹配
    list_matcher = match([3, 4, 5])
    assert list_matcher([1,2,3,4,5])
    assert not list_matcher([1,2,6])

    # 测试空列表匹配
    assert match([])([])  # 空列表匹配空列表
    assert match([])([1])  # 非空列表匹配空列表

    # 测试元组匹配
    tuple_matcher = match( (str, int) )
    assert tuple_matcher( ("abc", 10) )
    assert tuple_matcher( ["def", 20] )  # 列表同样支持
    assert not tuple_matcher( ("abc", "10") )

    # 测试属性匹配
    assert match(name="Alice", age=lambda x: x >= 18)(Person("Alice", 20))
    assert not match(name="Alice", age=20)(Person("Alice", 21))  # 年龄不匹配

    # 测试嵌套结构匹配
    nested_matcher = match({
        "user": {
            "name": "Alice",
            "address": {
                "city": "Shanghai",
                "zipcode": int
            }
        }
    })
    test_data = {
        "user": {
            "name": "Alice",
            "address": {
                "city": "Shanghai",
                "zipcode": 200000
            }
        }
    }
    assert nested_matcher(test_data)

    # 测试嵌套结构匹配
    nested_matcher = match({
        "user": {
            "name": "Alice",
            "address": {
                "city": "Shanghai",
                "zipcode": Or(int, undefined)  # 允许邮编不存在或为整数
            }
        }
    })
    test_data = {
        "user": {
            "name": "Alice",
            "address": {
                "city": "Shanghai",
                "zipcode": 200000
            }
        }
    }
    assert nested_matcher(test_data)
    test_data["user"]["address"].pop("zipcode")
    assert nested_matcher(test_data)  # zipcode不存在时也匹配

    # 测试组合器嵌套
    complex_matcher = And(
        Or(match(name="Alice"), match(name="Bob")),
        match(age=And(lambda x: x >=18, lambda x: x <=30))
    )
    assert complex_matcher(Person("Alice", 25))
    assert complex_matcher(Person("Bob", 18))
    assert not complex_matcher(Person("Alice", 31))
    assert not complex_matcher(Person("Charlie", 25))

    # 测试类型匹配
    type_matcher = match(int)
    assert type_matcher(42)
    assert not type_matcher("42")

    # 测试undefined处理
    # 属性不存在测试
    assert match(name=undefined)(Person("Alice", 20)) is False  # name存在
    assert match(height=undefined)(Person("Bob", 25))  # height不存在

    # 字典键不存在测试
    assert match({"missing_key": undefined})({})  # 键不存在时匹配
    assert not match({"missing_key": undefined})({"missing_key": "exists"})

    # 特殊And/Or处理
    assert And(undefined, undefined) is undefined
    assert And(undefined, match_user(233)) is false_func
    assert Or(undefined) is undefined

    # 测试值相等匹配
    assert match(42)(42)
    assert not match(42)("42")

    # 测试callable直接使用
    assert match(lambda x: x%2 == 0)(4)
    assert not match(lambda x: x%2 == 0)(5)

    # 测试空匹配（当matcher为空时）
    assert match()(object())  # 无属性要求时总是匹配成功

    # 测试集合匹配
    set_matcher = match(ForAll(And(int, lambda x: x > 0)))
    assert set_matcher({1, 2, 3})       # 同时满足类型和条件
    assert not set_matcher({1, "2",3})  # 包含非整数元素
    assert not set_matcher({-1, 2})     # 包含不满足条件的值

    # 测试列表有序匹配
    ordered_list_matcher = match([int, str])
    assert ordered_list_matcher([1, "a", 3.14])  # 前两位满足
    assert ordered_list_matcher([1, "a"])        # 刚好匹配
    assert not ordered_list_matcher(["a", 1])    # 顺序错误
    assert not ordered_list_matcher([1])         # 长度不足

    # 测试元组严格匹配
    tuple_strict_matcher = match( (int, str, float) )
    assert tuple_strict_matcher( (1, "a", 3.14) )
    assert not tuple_strict_matcher( (1, "a") )     # 长度不足
    assert not tuple_strict_matcher( ("1", 2, 3.0)) # 类型顺序错误

    # 测试_Optional逻辑
    optional_matcher = Or(undefined, match(name="Bob"))
    # 测试对象属性
    assert optional_matcher(Person("Bob", 30))     # 满足第二个条件
    assert not optional_matcher(Person("Alice", 25))   # name存在但不符合，undefined 应该返回 False
    # 测试字典键
    dict_optional = match({"age": Or(undefined, int)})
    assert dict_optional({"name": "Tom"})          # age键不存在
    assert dict_optional({"age": 25})              # age存在且符合类型
    assert not dict_optional({"age": "25"})        # age存在但类型错误

    # 测试Undefined在列表/元组中的处理
    try:
        bad_matcher = match([undefined])
        bad_matcher([1,2,3])  # 应该触发错误
        assert False, "Expected error when using undefined in list"
    except:
        pass

    # 测试Not与undefined的交互
    not_undefined = Not(undefined)
    assert not_undefined(Person("Any", 0))  # Not(undefined)应该总是返回True

    # 测试And的特殊情况
    assert And(undefined, undefined) is undefined
    assert And(undefined, match(name="Alice")) is false_func
    assert And(match(name="Alice"), undefined) is false_func

    # 测试空集合匹配
    assert match(set())(set())        # 空集合匹配空集合
    assert match(set())({1})      # 非空集合匹配空集合模式

    # 测试混合数据结构
    complex_data_matcher = match({
        "users": (
            {"name": str, "age": And(int, lambda x: x >= 18)},
            {"name": "Admin", "role": str}
        ),
        "tags": {"python", "coding"}
    })
    test_data = {
        "users": [
            {"name": "Alice", "age": 25},
            {"name": "Admin", "role": "manager"}
        ],
        "tags": {"python", "coding", "test"}
    }
    assert complex_data_matcher(test_data)

    # 测试部分匹配失败的情况
    test_data["users"][0]["age"] = 17  # 年龄不满足
    assert not complex_data_matcher(test_data)

    # 测试列表长度严格匹配
    exact_length_matcher = match([int, int])
    assert exact_length_matcher([1, 2])
    assert not exact_length_matcher([1])     # 长度不足
    assert exact_length_matcher([1,2,3]) # 长度超出但满足前两位，这是期望的行为

    # 测试集合元素数量
    set_count_matcher = match({int, int, str})
    assert set_count_matcher({1, 2, "a"})
    assert set_count_matcher({1, "a"})  # 元素数量不足,,但是这是预料中的行为，问题是我想要的是所有条件都存在元素满足，还是每个条件都对应互斥的元素来满足

    # 存在测试
    a = Exist('awa')
    assert a(['awa', 'bwb'])

    a = Exist({'foo':'awa'})
    assert a([{'foo':'awa'}, 'bwb'])

    m = And(*map(Exist, [
        {
            'foo': True,
        },
        {
            'bar': True,
        },
        {
            'awa': True,
        }
    ]))
    assert m([
        {
            'foo': True,
            'bar': True,
        },
        {
            'awa': True
        },
    ])

    print("所有测试通过！")