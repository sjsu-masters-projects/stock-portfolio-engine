from fastapi import Request
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class InvestmentError(AppError): pass
class StrategyNotFoundError(AppError): pass
class MarketDataError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=502)

async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )
