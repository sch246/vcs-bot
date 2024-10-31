// modules/data/index.ts

import { ICore } from '../../core/types';
import { IData } from './types';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../data');
const dataMap: Map<string, any> = new Map()
const queueMap: Map<string, Array<() => Promise<void>>> = new Map()


export function init(core: ICore): IData {
  fs.ensureDirSync(DATA_DIR);
  return {
    dir: DATA_DIR,
    load: async function() {
      console.log('Module "data" loaded');
    },
    unload: async function() {
      await Promise.all(Array.from(dataMap.keys())
                              .map(k => this.save(k)))
      dataMap.clear()
      queueMap.clear();  // 清理队列
      console.log('Module "data" unloaded');
    },
    get: async function<T = any>(key: string, genDefault: () => T = Object): Promise<T> {
      if (dataMap.has(key)) {
        return dataMap.get(key)
      }

      const filePath = path.join(DATA_DIR, `${key}.yaml`);

      // 尝试读取文件
      if (await fs.pathExists(filePath)) {
        // 读取错误就抛出异常吧
        const yamlText = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(yamlText) as any
        dataMap.set(key, data)
        return data;
      } else {
        // 如果文件不存在，创建一个新的对象
        const data = genDefault();
        dataMap.set(key, data)
        return data;
      }
    },
    reset: function(key: string) {
      dataMap.delete(key)
    },
    save: async function(key: string, del: boolean=false) {
      const filePath = path.join(DATA_DIR, `${key}.yaml`);
      try {
        const yamlText = yaml.dump(dataMap.get(key));
        if (del) {
          dataMap.delete(key);
        }
        await fs.outputFile(filePath, yamlText);
      } catch (error) {
        console.error(`Error saving file ${filePath}:`, error);
      }
    },


    // 保证顺序
    modify: function<T = any>(key: string, genDefault: () => T, modifier: (data: T) => void) {
      if (!queueMap.has(key)) {
        queueMap.set(key, []);
      }

      const queue = queueMap.get(key)!;
      queue.push(async () => {
        modifier(await this.get(key, genDefault))
      });

      if (queue.length === 1) {
        // 如果这是队列中的第一个任务，立即开始处理
        processQueue(key)
      }
    },
  };
};

async function processQueue(key: string) {
  while (queueMap.has(key) && queueMap.get(key)!.length > 0) {
    const modifier = queueMap.get(key)!.shift()!;
    await modifier();
  }
}