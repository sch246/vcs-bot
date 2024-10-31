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

  async load(moduleName: string): Promise<void> {
    await this.moduleLoader.loadModule(this, moduleName);
  }

  async unload(moduleName: string): Promise<void> {
    await this.moduleLoader.unloadModule(moduleName);
  }

  getModules(): Map<string, IModule> {
    return this.moduleLoader.getModules()
  }

  get<T extends IModule>(moduleName: string): T {
    return this.moduleLoader.getModule(moduleName) as T;
  }

  emit(eventName: string, ...args: any[]): void {
    this.eventEmitter.emit(eventName, ...args);
  }

  on(eventName: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(eventName, callback);
  }

  removeListeners(eventName: string): void {
    this.eventEmitter.removeAllListeners(eventName);
  }
}
