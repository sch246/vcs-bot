// modules/context/index.ts

import { ICore } from '../../core/types';
import { IBot } from '../bot/types';
import { Event, IHTTP, Message } from '../http/types';
import { IContext } from './types';

let core: ICore

export function init(c: ICore): IContext {
  core = c

  return {
    load: async function () {
      console.log('Module "context" loaded');
    },

    unload: async function () {
      console.log('Module "context" unloaded');
    },

  };
};
