// modules/data/index.ts

import { ICore } from '../../core/types';
import { IData } from './types';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { IQueue } from '../queue/types';

const DATA_DIR = path.resolve(__dirname, '../../data');
const dataMap: Map<string, any> = new Map();
const dirtyMap: Map<string, boolean> = new Map();



export function init(core: ICore): IData {
  fs.ensureDirSync(DATA_DIR);
  return {
    dir: DATA_DIR,

    load: async function() {
      await core.load('queue');
      console.log('Module "data" loaded');
    },

    unload: async function() {
      await Promise.allSettled(Array.from(dataMap.keys())
                          .map(k => this.save(k)));
      dataMap.clear();
      dirtyMap.clear();
      console.log('Module "data" unloaded');
    },

    get: async function<T = any>(key: string, genDefault: () => T = Object): Promise<T> {
      if (dataMap.has(key)) {
        return dataMap.get(key);
      }

      const filePath = path.join(DATA_DIR, `${key}.yaml`);

      // 尝试读取文件
      if (await fs.pathExists(filePath)) {
        // 读取错误就抛出异常吧
        const yamlText = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(yamlText) as any
        dataMap.set(key, data);
        console.log(`data read from "${key}.yaml"`);
        return data;
      } else {
        // 如果文件不存在，创建一个新的对象
        const data = genDefault();
        dataMap.set(key, data);
        return data;
      }
    },

    reset: function(key: string) {
      dataMap.delete(key);
      dirtyMap.set(key, false);
    },

    setDirty: function(key: string, dirty = true) {
      dirtyMap.set(key, dirty);
    },

    save: async function(key: string, del: boolean=false) {
      const queue = core.get<IQueue>('queue');
      await queue.by('data/'+key, async () => {
        if (!dataMap.has(key) || !dirtyMap.get(key)) {
          return
        }
        const filePath = path.join(DATA_DIR, `${key}.yaml`);
        const data = dataMap.get(key);
        try {
          const yamlText = yaml.dump(data);

          await fs.outputFile(filePath, yamlText);
          console.log(`data "${key}.yaml" saved`);

          dirtyMap.set(key, false)

          if (del) {
            dataMap.delete(key);
          }
        } catch (error) {
          console.error(`Error saving file ${filePath}:`, error);
          dataMap.set(key, data);
          dirtyMap.set(key, true);
        }
      });
    },

    // 保证顺序
    modify: function<T = any>(key: string, genDefault: () => T, modifier: (data: T) => void) {
      const queue = core.get<IQueue>('queue');
      queue.by('data/'+key, async () => {
        modifier(await this.get(key, genDefault));
        this.setDirty(key);
      })
    },
  };
};
