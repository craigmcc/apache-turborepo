"""
Logging configuration utilities.

Provides consistent logging setup with both console and rotating file handlers
across all distributors.
"""

import json
import logging
import logging.handlers
import sys
from pathlib import Path


def setup_logging(config_path: str, logger_name: str = __name__) -> logging.Logger:
    """
    Set up logging with both console and rotating file handlers.
    
    Loads logging configuration from the config file and creates:
    - Console handler writing to stdout
    - Rotating file handler with daily rotation and retention
    
    Args:
        config_path: Path to configuration file
        logger_name: Name for the logger instance (typically __name__)
        
    Returns:
        Configured logger instance
    """
    # Load config to get logging settings
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    log_config = config.get('logging', {})
    log_dir = Path(log_config.get('log_dir', './logs'))
    log_file = log_config.get('log_file', 'distributor.log')
    retention_days = log_config.get('retention_days', 30)
    log_level = log_config.get('log_level', 'INFO')
    
    # Create log directory
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / log_file
    
    # Configure root logger
    logger = logging.getLogger(logger_name)
    logger.setLevel(getattr(logging, log_level))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Rotating file handler (daily rotation at midnight)
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path,
        when='midnight',
        interval=1,
        backupCount=retention_days,
        encoding='utf-8'
    )
    file_handler.setLevel(getattr(logging, log_level))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    logger.info(f"Logging configured: console + file ({log_path})")
    logger.info(f"Log retention: {retention_days} days")
    
    return logger
