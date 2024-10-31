// modules/api/types/event.ts

export * from './event/message'
export * from './event/notice'
export * from './event/request'
export * from './event/meta'

export interface GroupEvent {
  group_id: number;
}

import { MessageEvent, NoticeEvent, RequestEvent, MetaEvent } from './event';
export type Event = MessageEvent | NoticeEvent | RequestEvent | MetaEvent
