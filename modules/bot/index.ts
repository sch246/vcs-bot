// modules/bot/index.ts

import { ICore } from '../../core/types';
import { IBot } from './types';
import { IHTTP } from '../http/types'

import { IAPI, MessageEvent } from '../api/types'

export function init(core: ICore): IBot {
  return {
    load: async function() {
      await core.load("http")
      await core.load("api")
      const http = core.get<IHTTP>('http');
      const api = core.get<IAPI>('api');
      // 监听私聊消息事件
      core.on('message', async (event: MessageEvent) => {
        if (event.raw_message===".test"){
          if (event.message_type === 'private') {
            console.log(await api.send_msg('测试消息！', {
              user_id: event.user_id
            }))
          } else if (event.message_type === 'group') {
            console.log(await api.send_msg('测试消息！', {
              group_id: event.group_id
            }))
          }
        }

      });
      console.log('Module "bot" loaded');
    },
    unload: async function() {
      core.removeListeners('message')
      console.log('Module "bot" unloaded');
    },
  }
}
