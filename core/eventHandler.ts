// core/index.ts

import { EventEmitter } from 'events';

export class EventHandler {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  emit(eventName: string, ...args: any[]): void {
    this.eventEmitter.emit(eventName, ...args);
  }

  on(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(eventName, listener);
  }

  off(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(eventName, listener);
  }

  once(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.once(eventName, listener);
  }

  before(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.prependListener(eventName, listener);
  }

  onceBefore(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.prependOnceListener(eventName, listener);
  }

  // 与 on 相同
  addListener(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.addListener(eventName, listener);
  }

  // 与 off 相同
  removeListener(eventName: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(eventName, listener);
  }

  removeListeners(eventName: string): void {
    this.eventEmitter.removeAllListeners(eventName);
  }

  eventNames(): (string | symbol)[] {
    return this.eventEmitter.eventNames()
  }
}
