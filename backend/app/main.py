import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.exceptions import AppError, app_error_handler
from app.database import init_db
from app.routers import health, strategies, portfolio, history, stocks, prices, compare

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Stock Portfolio Engine",
        description="Suggests a performance-weighted stock portfolio based on investment strategy.",
        version="2.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_exception_handler(AppError, app_error_handler)
    
    for r in [health, strategies, portfolio, history, stocks, prices, compare]:
        app.include_router(r.router)

    @app.on_event("startup")
    def on_startup():
        logger.info("Initializing SQLite database...")
        init_db()
        logger.info("Database ready.")
        
    return app

app = create_app()
