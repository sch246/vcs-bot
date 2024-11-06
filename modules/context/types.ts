// modules/context/types.ts

import { EventHandler } from '../../core/eventHandler';
import { ICore, IModule } from '../../core/types';

export interface IContext extends IModule {

}


export interface Area extends EventHandler {
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
