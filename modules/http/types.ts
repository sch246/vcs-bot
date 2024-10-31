// modules/http/types.ts

import { IModule } from '../../core/types';

export interface IHTTP extends IModule {
  config: {
    listen: number,
    post: number,
  };
  call: (apiName: string, data: { [key: string]: any }) => Promise<any>;
}
