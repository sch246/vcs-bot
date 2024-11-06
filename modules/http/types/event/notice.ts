// modules/http/types/event/notice.ts

import { BaseEvent } from '../base'

export interface GroupUploadEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_upload";
  group_id: number;
  user_id: number;
  file: {
    id: string;
    name: string;
    size: number;
    busid: number;
    url?: string; // 实际上会有一个url，但是并没有什么用
  };
}
// 私聊传文件是没有notice的，文件会在消息段里面

export interface GroupAdminEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_admin";
  sub_type: "set" | "unset";
  group_id: number;
  user_id: number;
}

export interface GroupDecreaseEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_decrease";
  sub_type: "leave" | "kick" | "kick_me";
  group_id: number;
  operator_id: number;
  user_id: number;
}

export interface GroupIncreaseEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_increase";
  sub_type: "approve" | "invite";
  group_id: number;
  operator_id: number;
  user_id: number;
}

export interface GroupBanEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_ban";
  sub_type: "ban" | "lift_ban";
  group_id: number;
  operator_id: number;
  user_id: number;
  duration: number;
}

export interface FriendAddEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "friend_add";
  user_id: number;
}

export interface GroupRecallEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "group_recall";
  group_id: number;
  user_id: number;
  operator_id: number;
  message_id: number;
}

export interface FriendRecallEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "friend_recall";
  user_id: number;
  operator_id?: number;  // 有时好像会多一个？
  message_id: number;
}

export type RecallEvent = GroupRecallEvent | FriendRecallEvent

export interface PokeEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "notify";
  sub_type: "poke";
  group_id?: number; // 私聊poke的区别就是没有group_id
  user_id: number;
  target_id: number;
}

export interface GroupLuckyKingEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "notify";
  sub_type: "lucky_king";
  group_id: number;
  user_id: number;
  target_id: number;
}

export interface GroupHonorEvent extends BaseEvent {
  post_type: "notice";
  notice_type: "notify";
  sub_type: "honor";
  group_id: number;
  honor_type: "talkative" | "performer" | "emotion";
  user_id: number;
}

export type NoticeEvent = GroupUploadEvent | GroupAdminEvent
    | GroupDecreaseEvent | GroupIncreaseEvent | GroupBanEvent
    | FriendAddEvent | GroupRecallEvent | FriendRecallEvent
    | PokeEvent | GroupLuckyKingEvent | GroupHonorEvent
