// modules/api/types/message.ts

// 基础消息段接口
export interface MessageSegment {
  type: string;
  data: Record<string, any>;
}

// 纯文本
export interface TextSegment extends MessageSegment {
  type: 'text';
  data: {
    text: string;
  };
}

// QQ 表情
export interface FaceSegment extends MessageSegment {
  type: 'face';
  data: {
    id: string;
  };
}

// 图片
export interface ImageSegment extends MessageSegment {
  type: 'image';
  data: {
    file: string;
    type?: 'flash';
    url?: string;
    cache?: '0' | '1';
    proxy?: '0' | '1';
    timeout?: number;
  };
}

// 语音
export interface RecordSegment extends MessageSegment {
  type: 'record';
  data: {
    file: string;
    magic?: '0' | '1';
    url?: string;
    cache?: '0' | '1';
    proxy?: '0' | '1';
    timeout?: number;
  };
}

// 短视频
export interface VideoSegment extends MessageSegment {
  type: 'video';
  data: {
    file: string;
    url?: string;
    cache?: '0' | '1';
    proxy?: '0' | '1';
    timeout?: number;
  };
}

// @某人
export interface AtSegment extends MessageSegment {
  type: 'at';
  data: {
    qq: string | 'all';
  };
}

// 猜拳魔法表情
export interface RpsSegment extends MessageSegment {
  type: 'rps';
  data: {};
}

// 掷骰子魔法表情
export interface DiceSegment extends MessageSegment {
  type: 'dice';
  data: {};
}

// 窗口抖动（戳一戳）
export interface ShakeSegment extends MessageSegment {
  type: 'shake';
  data: {};
}

// 戳一戳
export interface PokeSegment extends MessageSegment {
  type: 'poke';
  data: {
    type: string;
    id: string;
    name?: string;
  };
}

// 匿名发消息
export interface AnonymousSegment extends MessageSegment {
  type: 'anonymous';
  data: {
    ignore?: '0' | '1';
  };
}

// 链接分享
export interface ShareSegment extends MessageSegment {
  type: 'share';
  data: {
    url: string;
    title: string;
    content?: string;
    image?: string;
  };
}

// 推荐好友/推荐群
export interface ContactSegment extends MessageSegment {
  type: 'contact';
  data: {
    type: 'qq' | 'group';
    id: string;
  };
}

// 位置
export interface LocationSegment extends MessageSegment {
  type: 'location';
  data: {
    lat: string;
    lon: string;
    title?: string;
    content?: string;
  };
}

// 音乐分享
export interface MusicSegment extends MessageSegment {
  type: 'music';
  data: {
    type: 'qq' | '163' | 'xm' | 'custom';
    id?: string;
    url?: string;
    audio?: string;
    title?: string;
    content?: string;
    image?: string;
  };
}

// 回复
export interface ReplySegment extends MessageSegment {
  type: 'reply';
  data: {
    id: string;
  };
}

// 合并转发
export interface ForwardSegment extends MessageSegment {
  type: 'forward';
  data: {
    id: string;
  };
}

// 合并转发节点
export interface NodeSegment extends MessageSegment {
  type: 'node';
  data: {
    id?: string;
    user_id?: string;
    nickname?: string;
    content?: string | MessageSegment[];
  };
}

// XML 消息
export interface XmlSegment extends MessageSegment {
  type: 'xml';
  data: {
    data: string;
  };
}

// JSON 消息
export interface JsonSegment extends MessageSegment {
  type: 'json';
  data: {
    data: string;
  };
}

// 文件
export interface FileSegment extends MessageSegment {
  type: 'file';
  data: {
    file: string;
    path: string;
    url: string;
    file_id: string;
    file_size: number;
    file_unique: string;
  };
}

// 定义消息类型，包含所有可能的消息段
export type ArrayMessage = (
  TextSegment | FaceSegment | ImageSegment | RecordSegment | VideoSegment |
  AtSegment | RpsSegment | DiceSegment | ShakeSegment | PokeSegment |
  AnonymousSegment | ShareSegment | ContactSegment | LocationSegment |
  MusicSegment | ReplySegment | ForwardSegment | NodeSegment |
  XmlSegment | JsonSegment | FileSegment
)[];

export type Message = string | ArrayMessage
