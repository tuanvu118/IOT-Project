from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "message": exc.detail,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status_code": 500,
            "message": "Lỗi hệ thống nội bộ.",
        },
    )
