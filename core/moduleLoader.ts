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

  async exit(exitCode: number, timeout: number = 5000) {
    await Promise.race([
      this.cleanup().then(() => {
        console.log('bye.');
      }),
      getTimeoutPromise(timeout).then(() => {
        console.warn(`Cleanup timed out after ${timeout}ms, forcing exit...`);
        process.exit(exitCode);
      }),
    ]);
  }

  private setupCleanupHandlers() {

    process.on('beforeExit', () => this.cleanup());
    process.on('SIGINT', () => this.exit(0));
    process.on('SIGTERM', () => this.exit(0));
    process.on('uncaughtException', async (err) => {
      console.error('Uncaught exception:', err);
      await this.exit(1);
    });
  }

  async loadModule(core: ICore, moduleName: string): Promise<void> {
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

  async unloadModule(moduleName: string): Promise<void> {
    const module = this.loadedModules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} is not loaded`);
    }

    await module.unload();
    this.loadedModules.delete(moduleName);
  }

  async reloadModule(core: ICore, moduleName: string): Promise<void> {
    if (this.loadedModules.has(moduleName)) {
      await this.unloadModule(moduleName);
    }
    await this.loadModule(core, moduleName);
  }

  // 不会报错
  async cleanup(): Promise<void> {
    console.log('Starting cleanup...');
    const result = await Promise.allSettled(Array.from(this.loadedModules.keys())
                            .map(k => this.unloadModule(k)));

    const failures = result.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`Failed to unload ${failures.length} modules:`, failures);
    }
    console.log('Cleanup completed');
  }

  getModule(moduleName: string): IModule {
    const module = this.loadedModules.get(moduleName)
    if (!module) {
      throw new Error(`Module ${moduleName} is not loaded`);
    }
    return module;
  }

  getModules(): Map<string, IModule> {
    return this.loadedModules
  }
}
