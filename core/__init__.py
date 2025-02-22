"""
动态模块管理器

设计目标:
    - 提供一个灵活的模块加载和卸载系统
    - 支持异步模块初始化
    - 确保模块正确清理和资源释放
    - 自动发现和加载指定目录下的所有模块

实现方式:
    - 使用 importlib 进行动态模块导入
    - 通过 asyncio 实现异步模块加载
    - 利用 GC 和 atexit 确保模块正确卸载和清理
    - 通过文件系统遍历实现模块自动发现

使用示例:
    ```python
    # 创建模块管理器实例
    manager = ModuleManager()

    # 加载单个模块
    await manager.load_module("my_package.my_module")

    # 加载目录下所有模块
    tasks = manager.load_mods("modules_dir")
    await asyncio.gather(*tasks)

    # 卸载模块
    manager.unload_module("my_package.my_module")
    ```

    或者直接调用start，这会加载`adapters`和`mods`下的模块

    ```py
    asyncio.run(start())
    ```

要求被加载的模块需要实现以下接口:
    - async def start(): 异步初始化函数
    - def unload(): 同步清理函数
"""

import asyncio
import importlib
import sys
import gc
import os
import logging
from inspect import iscoroutinefunction
import traceback
import atexit

logger = logging.getLogger(__name__)

async def start():
    module_manager = ModuleManager()
    adapter_tasks = module_manager.load_mods('adapters')
    mod_tasks = module_manager.load_mods('mods')
    await asyncio.gather(*(adapter_tasks + mod_tasks))


class ModuleManager:
    def __init__(self):
        self.modules = {}

    async def load_module(self, module_path: str):
        """加载模块并调用 start 方法"""
        try:
            module = importlib.import_module(module_path)
            if not hasattr(module, 'unload'):
                logger.error(f"Module {module_path} has no 'unload' function, skip.")
                return
            elif not callable(module.unload):
                logger.error(f"Module {module_path} has 'unload', but it't not a function, skip.")
                return
            elif iscoroutinefunction(module.unload):
                logger.error(f"Module {module_path} has function 'unload', but it't an async function, skip.")
                return
            elif not(hasattr(module, 'start') and iscoroutinefunction(module.start)):
                logger.error(f"Module {module_path} has no 'reload' async function, skip.")
                return
            self.modules[module_path] = module
            atexit.register(module.unload)
            logger.info(f"Successfully loaded module: {module_path}")
            await module.start()
        except Exception as e:
            logger.error(f"Failed to load module {module_path}")
            logger.error(traceback.format_exc())

    def unload_module(self, module_path: str):
        """卸载模块（依赖GC自动清理）"""
        if module_path in self.modules:
            del self.modules[module_path]
            if module_path in sys.modules:
                del sys.modules[module_path]

            # 主动触发垃圾回收（可选）
            gc.collect()
        logger.info(f"Successfully unloaded module: {module_path}")

    def load_mods(self, dir_path: str):
        """加载一个文件夹内的所有 Python 模块"""
        tasks = []
        for file_name in os.listdir(dir_path):
            if file_name.endswith('.py') and not file_name.startswith('_'):
                module_name = file_name[:-3]  # 去掉 .py 后缀
                module_path = f"{dir_path.rstrip('/').replace('/', '.')}.{module_name}"  # 将路径转换为包路径
                task = asyncio.create_task(self.load_module(module_path))
                tasks.append(task)
        return tasks
