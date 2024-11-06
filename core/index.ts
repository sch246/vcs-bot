// core/index.ts

import { ICore, IModule } from './types';
import { ModuleLoader } from './moduleLoader';
import { EventHandler } from './eventHandler';

export class Core extends EventHandler implements ICore {
  private moduleLoader: ModuleLoader;

  constructor(modulesPath: string) {
    super()
    this.moduleLoader = new ModuleLoader(modulesPath);
  }

  get<T extends IModule>(moduleName: string): T {
    return this.moduleLoader.get(moduleName) as T;
  }

  list(): Map<string, IModule> {
    return this.moduleLoader.list()
  }

  async load(moduleName: string): Promise<void> {
    await this.moduleLoader.load(this, moduleName);
  }

  async unload(moduleName: string): Promise<void> {
    await this.moduleLoader.unload(moduleName);
  }

  async reload(moduleName: string): Promise<void> {
    await this.moduleLoader.reload(this, moduleName);
  }

  async unloadAll(): Promise<void> {
    await this.moduleLoader.unloadAll()
  }

  async exit(exitCode: number, timeout: number = 5000): Promise<void> {
    await this.moduleLoader.exit(exitCode, timeout)
  }
}
