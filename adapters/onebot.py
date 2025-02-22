from abc import ABC, abstractmethod
from typing import Callable, Type
from asyncio import Future, wait_for, sleep
import logging
logger = logging.getLogger(__name__)


async def start():
    logger.info('启动啦！')
    await sleep(1)

def unload():
    logger.info('卸载啦！')


