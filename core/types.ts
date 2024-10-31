// core/types.ts

export interface IModule {
  load: () => Promise<void>;
  unload: () => Promise<void>;
  [key: string]: any;
}

export interface ICore {
  get: <T extends IModule>(moduleName: string) => T;
  getModules: () => Map<string, IModule>;
  load: (moduleName: string) => Promise<void>;
  unload: (moduleName: string) => Promise<void>;
  unloadAll: () => Promise<void>;
  exit: (exitCode: number, timeout?: number) => Promise<void>;

  emit: (eventName: string, ...args: any[]) => void;
  on: (eventName: string, listener: (...args: any[]) => void) => void;
  off: (eventName: string, listener: (...args: any[]) => void) => void;
  once: (eventName: string, listener: (...args: any[]) => void) => void;
  before: (eventName: string, listener: (...args: any[]) => void) => void;
  onceBefore: (eventName: string, listener: (...args: any[]) => void) => void;
  addListener: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListeners: (eventName: string) => void;
  eventNames: () => (string | symbol)[];
}
