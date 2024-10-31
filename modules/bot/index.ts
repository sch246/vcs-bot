// modules/bot/index.ts

import { ICore } from '../../core/types';
import { IBot } from './types';

import { IAPI, MessageEvent } from '../api/types'
import { IData } from '../data/types';

let core: ICore
let bot: IBot = {
  config: {
    saveLog: true,
    qq: 980001119,
  },
  load: async function() {
    await core.load("api")
    await core.load("data");
    // 加载配置
    const data = core.get<IData>("data");
    this.config = await data.get("bot", () => this.config);
    // 监听私聊消息事件
    core.on('message', test);
    console.log('Module "bot" loaded');
  },
  unload: async function() {
    // 卸载配置
    core.get<IData>("data").save("bot", true);
    // 卸载监听
    core.removeListener('message', test);

    console.log('Module "bot" unloaded');
  },
}

async function test(event: MessageEvent) {
  const api = core.get<IAPI>('api');
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
  } else if (event.raw_message===".qq"){
    api.send_msg(`qq是: ${bot.config.qq}`, event)
  }
}

export function init(c: ICore): IBot {
  core = c
  return bot
}
