from fastapi import APIRouter
from app.database import strategy_repo

router = APIRouter(prefix="/api", tags=["strategies"])

@router.get("/strategies")
def list_strategies():
    return strategy_repo.all()
