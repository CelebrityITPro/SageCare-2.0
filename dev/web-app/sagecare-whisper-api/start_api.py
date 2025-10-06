#!/usr/bin/env python3
"""
Startup script for the Whisper API
"""
import uvicorn
import logging

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting Whisper API server...")
    uvicorn.run(
        "whisper_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 