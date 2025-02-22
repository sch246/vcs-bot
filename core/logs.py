"""
日志系统，提供统一的日志记录和管理功能

设计目标：
1. 提供统一的日志接口
2. 支持文件和控制台输出
3. 实现日志文件轮转

特点：
1. 使用RotatingFileHandler控制日志文件大小
2. 支持多个日志处理器
3. 统一的日志格式

配置：
- 日志级别：INFO
- 文件大小：1MB
- 备份数量：5个
"""

import logging
from logging.handlers import RotatingFileHandler
import os
import sys

# 设置日志目录
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# 设置日志文件名格式
log_file = os.path.join(log_dir, 'latest.log')

# 创建 RotatingFileHandler 用于文件输出
file_handler = RotatingFileHandler(log_file, maxBytes=1*1024*1024, backupCount=5, encoding='utf-8')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

# 创建 StreamHandler 用于控制台输出
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

# 配置日志
logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])
