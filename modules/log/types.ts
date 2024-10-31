// modules/log/types.ts

import { IModule } from '../../core/types';
import { Event } from '../api/types';

export interface ILog extends IModule {
  log: (area: string, message: any) => void;
  query: (
    areaReg?: RegExp,
    start?: string,
    end?: string,
    evtFilter?: (message: Event) => boolean
  ) => Promise<Event[]>;
}
