// modules/log/index.ts

import * as fs from 'fs-extra';
import * as path from 'path';
import { ICore } from '../../core/types';
import { ILog } from './types';
import { IData } from '../data/types'
import { Event, MessageEvent, NoticeEvent, RequestEvent, MetaEvent } from '../api/types'

export function init(core: ICore): ILog {
  return {
    load: async function() {
      await core.load("data")

      core.on('message', (event: MessageEvent) => {
        const area = "group_id" in event ?
          `group-${event.group_id}` :
          `user-${event.user_id}`;

          this.log(area, event);
      });

      core.on('notice', (event: NoticeEvent) => {
        const area = "group_id" in event ?
          `group-${event.group_id}` :
          `user-${event.user_id}`;

        this.log(area, event);
      });

      core.on('request', (event: RequestEvent) => {
        const area = "group_id" in event ?
          `group-${event.group_id}` :
          `user-${event.user_id}`;

        this.log(area, event);
      });

      core.on('meta_event', (event: MetaEvent) => {
        this.log('bot', event);
      });

      console.log('Module "log" loaded');
    },

    unload: async function() {
      console.log('Module "log" unloaded');
    },

    log: function(area: string, message: Event) {
      const date = new Date();
      const path = `log/${area}/${
        date.getFullYear()
      }-${
        String(date.getMonth() + 1).padStart(2, '0')
      }/${
        String(date.getDate()).padStart(2, '0')
      }`;

      const data = core.get<IData>("data")
      data.modify(path, Array, data => {
        data.push(message)
      })
    },



    query: async function(
      areaReg: RegExp = /^.+$/,
      start: string = "0000-00/00",
      end: string = "9999-99/99",
      evtFilter: (message: Event) => boolean = () => true,
    ): Promise<Event[]> {
      const data = core.get<IData>("data");
      let result: Event[] = [];

      const [startMonth] = start.split("/");
      const [endMonth] = end.split("/");

      const logPath = path.join(data.dir, "log")
      for (const area of await fs.readdir(logPath)) {
        const areaPath = path.join(logPath, area);
        const stat = await fs.stat(areaPath);

        if (!stat.isDirectory() || !areaReg.test(area)) {
          continue;
        }

        for (const month of await fs.readdir(areaPath)) {
          const monthPath = path.join(areaPath, month);
          const stat = await fs.stat(monthPath);

          if (!stat.isDirectory() || !(startMonth <= month) || !(month <= endMonth)) {
            continue;
          }

          for (const dayFile of await fs.readdir(monthPath)) {
            const dayPath = path.join(monthPath, dayFile);
            const stat = await fs.stat(dayPath);

            if (stat.isDirectory() || !dayFile.endsWith(".yaml")) {
              continue;
            }
            const [day] = dayFile.split('.');
            const currentDate = `${month}/${day}`;
            if (!(start <= currentDate) || !(currentDate <= end)) {
              continue;
            }

            const dayLogs = await data.get(`log/${area}/${month}/${day}`, Array) as Event[]
            result.push(...dayLogs.filter(evtFilter));
          }
        }
      }
      return result;
    },

  };
};
