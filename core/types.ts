// core/types.ts

export interface IModule {
  load: () => Promise<void>;
  unload: () => Promise<void>;
  [key: string]: any;
}

export interface ICore {
  get<T extends IModule>(moduleName: string): T;
  getModules(): Map<string, IModule>;
  load: (moduleName: string) => Promise<void>;
  unload: (moduleName: string) => Promise<void>;
  emit: (eventName: string, ...args: any[]) => void;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListeners: (eventName: string) => void;
}
