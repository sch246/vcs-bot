import asyncio
from dataclasses import dataclass
from typing import Any, List

from core.event import Event
from core.adapter import Adapter, AdapterContext, SendMessageEvent, MessageEvent, SendGroupMessageEvent, SendPrivateMessageEvent
from core.message import Message, MessageNodeData, MessageNode

@dataclass
class TextData(MessageNodeData):
    text: str

class ConsoleMessageEvent(MessageEvent):
    """控制台消息事件"""
    def __init__(
        self,
        message: Message,
        user_id: int = 0,
        group_id: int = None
    ):
        super().__init__(
            message=message,
            user_id=user_id,
            group_id=group_id,
            message_type='group' if group_id else 'private'
        )

class ConsoleContext(AdapterContext[ConsoleMessageEvent]):
    """控制台上下文"""
    async def send(
        self,
        message: Message,
        message_type: str = None,
        **kwargs
    ):
        # 控制台默认发送到原会话环境
        return await super().send(
            message,
            message_type=message_type or self.event.message_type,
            user_id=self.event.user_id,
            group_id=self.event.group_id,
            **kwargs
        )

class ConsoleAdapter(Adapter):
    """
    控制台适配器实现
    示例功能：
    - 输入消息格式：[类型] 内容
    - 类型前缀：
      @user    -> 私聊消息
      #group   -> 群组消息
      (默认视为私聊消息)
    """
    def __init__(self):
        super().__init__(max_concurrent=10, queue_size=100)
        self.loop = asyncio.get_event_loop()
    
    @staticmethod
    def get_context_type() -> type[AdapterContext]:
        return ConsoleContext

    async def recv(self) -> Event:
        """从控制台读取输入"""
        while True:
            # 异步处理标准输入
            data = await self.loop.run_in_executor(None, input, ">> ")
            return self.from_platform_event(data.strip())

    async def send(self, event: SendMessageEvent):
        """向控制台输出消息"""
        message = self._format_message(event.message)
        
        prefix = ""
        if isinstance(event, SendGroupMessageEvent):
            prefix = f"[群组 {event.group_id}] "
        elif isinstance(event, SendPrivateMessageEvent):
            prefix = f"[用户 {event.user_id}] "
        
        print(f"Bot: {prefix}{message}")

    def _format_message(self, message: Message) -> str:
        """将消息转换为字符串"""
        if isinstance(message, str):
            return message
            
        texts = []
        for node in message:
            if node.type == 'text' and isinstance(node.data, TextData):
                texts.append(node.data.text)
            else:
                print(f"[警告] 控制台暂不支持显示 {node.type} 类型消息")
        return ''.join(texts)

    def from_platform_event(self, input_str: str) -> ConsoleMessageEvent:
        """解析控制台输入为消息事件"""
        # 消息类型解析逻辑
        user_id = 0
        group_id = None
        message = input_str

        # 解析特殊前缀
        if input_str.startswith("#"):
            parts = input_str.split(maxsplit=1)
            group_id = int(parts[0][1:]) if len(parts) > 1 else 1
            message = parts[1] if len(parts) > 1 else ""
        elif input_str.startswith("@"):
            parts = input_str.split(maxsplit=1)
            user_id = int(parts[0][1:]) if len(parts) > 1 else 1
            message = parts[1] if len(parts) > 1 else ""

        return ConsoleMessageEvent(
            message=self._parse_message(message),
            user_id=user_id,
            group_id=group_id
        )

    def _parse_message(self, text: str) -> Message:
        """将纯文本转换为消息对象"""
        return [MessageNode(type='text', data=TextData(text=text))]

    def to_platform_event(self, event: Event) -> Any:
        """事件转控制台格式（本适配器无需转换）"""
        return event

    async def start(self):
        """启动控制台交互"""
        print("--- 控制台适配器启动 ---")
        await super().start()