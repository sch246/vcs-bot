// modules/log/types.ts

import { IModule } from '../../core/types';
import { Event } from '../http/types';

export interface IQueue extends IModule {
  by: <T>(key: string, func: () => Promise<T>) => Promise<T>;
  length: (key: string) => number;
}
