// core/index.ts

import { EventEmitter } from 'events';
import { ICore, IModule } from './types';
import { ModuleLoader } from './moduleLoader';

export class Core implements ICore {
  private moduleLoader: ModuleLoader;
  private eventEmitter: EventEmitter;

  constructor(modulesPath: string) {
    this.moduleLoader = new ModuleLoader(modulesPath);
    this.eventEmitter = new EventEmitter();
  }

  get<T extends IModule>(moduleName: string): T {
    return this.moduleLoader.getModule(moduleName) as T;
  }

  getModules(): Map<string, IModule> {
    return this.moduleLoader.getModules()
  }

  async load(moduleName: string): Promise<void> {
    await this.moduleLoader.loadModule(this, moduleName);
  }

  async unload(moduleName: string): Promise<void> {
    await this.moduleLoader.unloadModule(moduleName);
  }

  async unloadAll(): Promise<void> {
    await this.moduleLoader.cleanup()
  }

  async exit(exitCode: number, timeout: number = 5000): Promise<void> {
    await this.moduleLoader.exit(exitCode, timeout)
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
