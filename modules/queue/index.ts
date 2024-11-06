// modules/queue/index.ts

import { ICore } from '../../core/types';
import { IQueue } from './types';

class Queue implements IQueue {
  private queueMap: Map<string, Array<() => Promise<any>>> = new Map()

  async load() {
    console.log('Module "queue" loaded');
  }
  async unload() {
    this.queueMap.clear();  // 清理队列
    console.log('Module "queue" unloaded');
  }

  private async processQueue(key: string) {
    while (this.queueMap.has(key) && this.queueMap.get(key)!.length > 0) {
      const promise = this.queueMap.get(key)!.shift()!;
      try {
        await promise();
      } catch (error) {
        console.error(`Error processing queue "${key}":`, error);
      }
    }
    if (this.queueMap.get(key)?.length === 0) {
      this.queueMap.delete(key);
    }
  }

  async by<T>(key: string, func: () => Promise<T>): Promise<T> {
    if (!this.queueMap.has(key)) {
      this.queueMap.set(key, []);
    }

    const queue = this.queueMap.get(key)!;

    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          resolve(await func());
        } catch (error) {
          reject(error);
        }
      });

      if (queue.length === 1) {
        // 如果这是队列中的第一个任务，立即开始处理
        this.processQueue(key)
      }
    });
  };

  length(key: string): number {
    return this.queueMap.get(key)?.length || 0;
  }
}

export function init(core: ICore): IQueue {
  return new Queue()
};
