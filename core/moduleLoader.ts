// core/moduleLoader.ts

import fs from 'fs';
import path from 'path';
import { ICore, IModule } from './types';

function getTimeoutPromise(timeout: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, timeout));
}

export class ModuleLoader {
  private modulesPath: string;
  private loadedModules: Map<string, IModule> = new Map();

  constructor(modulesPath: string) {
    this.modulesPath = modulesPath;
    // 处理程序以确保在退出时卸载所有模块
    this.setupCleanupHandlers();
  }

  get<T extends IModule>(moduleName: string): T {
    const module = this.loadedModules.get(moduleName)
    if (!module) {
      throw new Error(`Module ${moduleName} is not loaded`);
    }
    return module as T;
  }

  list(): Map<string, IModule> {
    return this.loadedModules
  }

  async load(core: ICore, moduleName: string): Promise<void> {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    const indexPath = path.join(this.modulesPath, moduleName, "index.ts");
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Module ${moduleName} does not exist`);
    }

    const importPath = path.join("../", this.modulesPath, moduleName, "index")
    const { init } = await import(importPath);
    const module: IModule = init(core);

    await module.load();
    this.loadedModules.set(moduleName, module);
  }

  async unload(moduleName: string): Promise<void> {
    const module = this.loadedModules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} is not loaded`);
    }

    await module.unload();
    this.loadedModules.delete(moduleName);
  }

  async reload(core: ICore, moduleName: string): Promise<void> {
    if (this.loadedModules.has(moduleName)) {
      await this.unload(moduleName);
    }
    await this.load(core, moduleName);
  }

  private setupCleanupHandlers() {

    process.on('beforeExit', () => this.unloadAll());
    process.on('SIGINT', () => this.exit(0));
    process.on('SIGTERM', () => this.exit(0));
    process.on('uncaughtException', async (err) => {
      console.error('Uncaught exception:', err);
      await this.exit(1);
    });
  }

  // 不会报错
  async unloadAll(): Promise<void> {
    console.log('Starting cleanup...');
    const result = await Promise.allSettled(Array.from(this.loadedModules.keys())
                            .map(k => this.unload(k)));

    const failures = result.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`Failed to unload ${failures.length} modules:`, failures);
    }
    console.log('Cleanup completed');
  }

  async exit(exitCode: number, timeout: number = 5000) {
    await Promise.race([
      this.unloadAll().then(() => {
        console.log('bye.');
      }),
      getTimeoutPromise(timeout).then(() => {
        console.warn(`Cleanup timed out after ${timeout}ms, forcing exit...`);
      }),
    ]);
    process.exit(exitCode);
  }
}
