// core/moduleLoader.ts

import fs from 'fs';
import path from 'path';
import { ICore, IModule } from './types';
import { exit } from 'process';

export class ModuleLoader {
  private modulesPath: string;
  private loadedModules: Map<string, IModule> = new Map();

  constructor(modulesPath: string) {
    this.modulesPath = modulesPath;
    const cleanup = () => {
      this.unloadAllModules().catch(err => {
        console.error('Error unloading modules:', err);
      });
    };
    // 处理程序以确保在退出时卸载所有模块
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      this.unloadAllModules()
      .catch(err => {
        console.error('Error unloading modules:', err);
      })
      .finally(() => {
        exit(1);
      });
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

  async unloadAllModules(): Promise<void> {
    await Promise.all(Array.from(this.loadedModules.keys())
                            .map(k => this.unloadModule(k)));
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
