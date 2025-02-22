"""
消息数据模型，定义统一的消息格式和结构

设计目标：
1. 统一不同平台的消息格式
2. 提供类型安全的消息处理
3. 支持灵活的消息扩展

主要组件：
1. MessageNode: 消息节点基类
2. Sender: 发送者信息模型
3. MessageEvent: 消息事件模型

特点：
- 使用继承体系支持不同类型消息
- 采用TypeVar确保类型安全
- 支持属性访问和序列化
"""

from typing import Any, Literal

from .event import Event
from .utils import AttrDict


type Message = str | list[MessageNode]

class MessageNode(AttrDict):
    pass

class TextNode(MessageNode):
    def __init__(self, text: str):
        super().__init__()
        self.text = text

class Sender(AttrDict):
    def __init__(
            self,
            *,
            user_id: int | None = None,
            nickname: str | None = None,
            sex: str | None = None,
            age: int | None = None,
    ):
        super().__init__()
        self.user_id = user_id
        self.nickname = nickname
        self.sex = sex
        self.age = age

class GroupSender(Sender):
    def __init__(
            self,
            *,
            user_id: int | None = None,
            nickname: str | None = None,
            sex: str | None = None,
            age: int | None = None,
            card: str | None = None,
            area: str | None = None,
            level: str | None = None,
            role: str | None = None,
            title: str | None = None,
    ):
        super().__init__(
            user_id = user_id,
            nickname = nickname,
            sex = sex,
            age = age,
        )
        self.card = card
        self.area = area
        self.level = level
        self.role = role
        self.title = title


class Anonymous(AttrDict):
    def __init__(
            self,
            *,
            id: int,
            name: str,
            flag: str,
    ):
        super().__init__()
        self.id = id
        self.name = name
        self.flag = flag


class MessageEvent(Event):
    def __init__(
            self,
            *,
            time: int,
            self_id: int,
            post_type: Literal['message'] = 'message',
            message_type: Literal['private', 'group'],
            sub_type: Literal['friend', 'group', 'other', 'normal', 'anonymous', 'notice'],
            message_id: int,
            user_id: int,
            message: Message,
            raw_message: str,
            font: int,
            sender: dict = {},
            group_id: int | None = None,
            anonymous: dict | None = None,
    ):
        super().__init__()
        self.time = time
        self.self_id = self_id
        self.post_type = post_type
        self.message_type = message_type
        self.sub_type = sub_type
        self.message_id = message_id
        self.user_id = user_id
        self.message = message
        self.raw_message = raw_message
        self.font = font
        self.sender = Sender(**sender) # Sender 可以是空的
        self.group_id = group_id
        self.anonymous = Anonymous(**anonymous) if anonymous is not None else None


class PrivateMessageEvent(MessageEvent):
    def __init__(
            self,
            *,
            time: int,
            self_id: int,
            post_type: Literal['message'] = 'message',
            message_type: Literal['private'],
            sub_type: Literal['friend', 'group', 'other'],
            message_id: int,
            user_id: int,
            message: Message,
            raw_message: str,
            font: int,
            sender: dict = {},
        ):
        super().__init__(
                time=time,
                self_id=self_id,
                post_type=post_type,
                message_type=message_type,
                sub_type=sub_type,
                message_id=message_id,
                user_id=user_id,
                message=message,
                raw_message=raw_message,
                font=font,
                sender=sender,
        )

class GroupMessageEvent(MessageEvent):
    def __init__(
            self,
            *,
            time: int,
            self_id: int,
            post_type: Literal['message'] = 'message',
            message_type: Literal['group'],
            sub_type: Literal['normal', 'anonymous', 'notice'],
            message_id: int,
            user_id: int,
            message: Message,
            raw_message: str,
            font: int,
            sender: dict = {},
            group_id: int,
            anonymous: dict | None = None,
        ):
        super().__init__(
                time=time,
                self_id=self_id,
                post_type=post_type,
                message_type=message_type,
                sub_type=sub_type,
                message_id=message_id,
                user_id=user_id,
                message=message,
                raw_message=raw_message,
                font=font,
                sender=sender,
                group_id=group_id,
                anonymous=anonymous,
        )

if __name__=='__main__':
    msg = PrivateMessageEvent(time=1, self_id=1, post_type='1', message_type='1',sub_type='1', message_id=1, message='1', raw_message='1', font=1, sender=Sender(), user_id=1)
    print(msg)
