import { BaseEvent, Status } from '../base'


export interface LifecycleEvent extends BaseEvent {
  post_type: "meta_event";
  meta_event_type: "lifecycle";
  sub_type: "enable" | "disable" | "connect";
}

export interface HeartbeatEvent extends BaseEvent {
  post_type: "meta_event";
  meta_event_type: "heartbeat";
  status: Status;
  interval: number;
}

export type MetaEvent = LifecycleEvent | HeartbeatEvent
