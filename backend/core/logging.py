"""
Structured Logging Configuration
"""
import logging
import sys
from pythonjsonlogger import jsonlogger
from .config import settings

def setup_logging():
    """Configure structured JSON logging for production"""
    logger = logging.getLogger()
    
    # Remove default handlers
    for handler in logger.handlers:
        logger.removeHandler(handler)
    
    handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENVIRONMENT == "production":
        # JSON formatting for production
        formatter = jsonlogger.JsonFormatter(
            fmt='%(asctime)s %(levelname)s %(name)s %(message)s'
        )
        logger.setLevel(logging.INFO)
    else:
        # Standard formatting for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        logger.setLevel(logging.DEBUG)
        
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger
