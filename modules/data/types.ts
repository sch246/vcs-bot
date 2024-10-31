// modules/data/types.ts

import { IModule } from '../../core/types';

export interface IData extends IModule {
  dir: string;
  get: <T = any>(key: string, genDefault?: () => T) => Promise<T>;
  reset: (key: string) => void;
  save: (key: string, del?: boolean) => Promise<void>;
  modify: <T = any>(key: string, genDefault: () => T, modifier: (data: T) => void) => void;
}

