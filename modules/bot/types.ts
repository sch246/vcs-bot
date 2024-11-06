// modules/bot/types.ts

import { ICore, IModule } from '../../core/types';
import { Area } from '../context/types';

export interface IBot extends IModule, Area {
  config: {
    saveLog: boolean;
    qq: number;
  };
}
