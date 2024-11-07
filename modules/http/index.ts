// modules/http/index.ts

import { ICore } from '../../core/types';
import { Event, IHTTP } from './types';
import * as http from 'http';
import { IData } from '../data/types'


export function init(core: ICore): IHTTP {
  let server: http.Server | null = null;

  return {
    config: {
      listen: 5701,
      post: 5700,
    },

    load: async function () {
      await core.load("data");
      const data = core.get<IData>("data");
      this.config = await data.get("http", () => this.config);

      server = http.createServer((req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const event = JSON.parse(body) as Event;
              // 触发 http 事件
              // core.emit("http", this, event);
              core.emit(event.post_type, this, event);
            } catch (error) {
              console.error('Error parsing event:', error);
            }
            res.writeHead(204);
            res.end('Event received');
          });
        } else {
          res.writeHead(405);
          res.end('Method Not Allowed');
        }
      });

      server.listen(this.config.listen, () => {
        console.log(`HTTP server listening on port ${this.config.listen}`);
      });

      console.log('Module "http" loaded');
    },

    unload: async function () {
      // 卸载配置
      core.get<IData>("data").save("http", true);

      if (server) {
        server.close();
        console.log('HTTP server shut down');
      }
      console.log('Module "http" unloaded');
    },

    call: async function (apiName: string, data:{ [key: string]: any } = {}): Promise<any> {
      const options = {
        hostname: 'localhost',
        port: this.config.post,
        path: `/${apiName}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };
      const postData = JSON.stringify(data);
      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            const res = JSON.parse(data)
            if (res.retcode === 0) {
              resolve(res.data);
            } else {
              reject(res.wording)
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });
    },
  };
};
