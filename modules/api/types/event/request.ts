import { BaseEvent } from '../base'

export interface RequestFriend extends BaseEvent {
  post_type: "request";
  request_type: "friend";
  user_id: number;
  comment: string;
  flag: string;
}

export interface RequestGroup extends BaseEvent {
  post_type: "request";
  request_type: "group";
  sub_type: "add" | "invite";
  group_id: number;
  user_id: number;
  comment: string;
  flag: string;
}

export type RequestEvent = RequestFriend | RequestGroup
