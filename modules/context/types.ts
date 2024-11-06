// modules/context/types.ts

import { ICore, IModule, IEventHandler } from '../../core/types';

export interface IContext extends IModule {

}


export interface Area extends IEventHandler {
  type: string;
  id: number;
  name: string;
  recv(): Promise<any>;
  send(message: any): Promise<void>;
}

export interface Context {
  core: ICore;
  area: Area;
  event: any; // 具体事件类型
}

// TODO 用context封装http(群聊/私聊/bot事件),cli等
// Area指能触发事件并且传入context的对象
// context会包括area本身，并且能进行不同的操作