export interface BaseEvent {
  time: number;
  self_id: number;
  post_type: string;
}

export interface PrivateSender {
  user_id?: number;
  nickname?: string;
  sex?: "male" | "female" | "unknown";
  age?: number;
}

export interface GroupSender {
  user_id?: number;
  nickname?: string;
  sex?: "male" | "female" | "unknown";
  age?: number;

  card?: string;
  area?: string;
  level?: string;
  role?: "owner" | "admin" | "member";
  title?: string;
}

/**
 * 消息发送者，出现在事件中，不保证属性可用
 */
export type Sender = PrivateSender | GroupSender

/**
 * bot 状态
 */
export interface Status {
  online: boolean;
  good: boolean;
  stat?: object; // 好像有这个，不知道干什么用的
  [key: string]: any;
}


export interface honerOne {
  user_id: number,
  nickname: string,
  avatar: string,
  description: string
}