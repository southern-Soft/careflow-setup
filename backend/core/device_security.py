from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from core.config import settings

api_key_header = APIKeyHeader(name="X-IOT-Token", auto_error=False)

async def verify_device_token(api_key: str = Security(api_key_header)):
    """
    Verifies the IOT device token from the 'X-IOT-Token' header.
    Use this dependency to protect device ingestion endpoints.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authentication Token (X-IOT-Token header)"
        )
    
    if api_key != settings.IOT_DEVICE_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Authentication Token"
        )
    return api_key
