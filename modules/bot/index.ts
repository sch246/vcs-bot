// modules/bot/index.ts

import { ICore } from '../../core/types';
import { IBot } from './types';

import { IAPI } from '../api/types'
import { MessageEvent } from '../http/types'
import { IData } from '../data/types';
import { EventHandler } from '../../core/eventHandler';

class Bot extends EventHandler implements IBot {
  type: string;
  id: number;
  name: string;
  config: {
    saveLog: boolean;
    qq: number;
  };

  constructor(name:string) {
    super()
    this.type = 'bot';
    this.id = 0;
    this.name = name
    this.config = {
      saveLog: true,
      qq: 980001119,
    };
  }

  private async test(event: MessageEvent) {
    const api = core.get<IAPI>('api');
    if (event.raw_message===".test") {
      if (event.message_type === 'private') {
        console.log(await api.send_msg('测试消息！', {
          user_id: event.user_id,
        }));
      } else if (event.message_type === 'group') {
        console.log(await api.send_msg('测试消息！', {
          group_id: event.group_id,
        }));
      }
    } else if (event.raw_message===".qq") {
      api.send_msg(`qq是: ${this.config.qq}`, event)
    }
  }

  async load() {
    await core.load("api")
    await core.load("data");
    // 加载配置
    const data = core.get<IData>("data");
    this.config = await data.get("bot", () => this.config);
    // 监听私聊消息事件
    core.on('message', this.test);
    console.log('Module "bot" loaded');
  }
  async unload() {
    // 卸载配置
    core.get<IData>("data").save("bot", true);
    // 卸载监听
    core.removeListener('message', this.test);

    console.log('Module "bot" unloaded');
  }

  async recv() {

  }

  async send() {

  }
}

let core: ICore


export function init(c: ICore): IBot {
  core = c
  return new Bot("vcs")
}
