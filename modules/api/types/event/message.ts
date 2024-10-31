import { ArrayMessage } from '../message'
import { BaseEvent, PrivateSender, GroupSender } from '../base';


export interface PrivateMessageEvent extends BaseEvent {
  post_type: "message";
  message_type: "private";
  sub_type: "friend" | "group" | "other";
  message_id: number;
  user_id: number;
  message: ArrayMessage;
  raw_message: string;
  font: number;
  sender: PrivateSender;
}

export interface GroupMessageEvent extends BaseEvent {
  post_type: "message";
  message_type: "group";
  sub_type: "normal" | "anonymous" | "notice";
  message_id: number;
  user_id: number;
  group_id: number;
  anonymous: {
    id: number;
    name:string;
    flag: string;
  };
  message: ArrayMessage;
  raw_message: string;
  font: number;
  sender: GroupSender;
}

export type MessageEvent = PrivateMessageEvent | GroupMessageEvent;