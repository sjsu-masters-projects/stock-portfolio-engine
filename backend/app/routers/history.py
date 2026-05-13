from fastapi import APIRouter
from app.database import history_repo

router = APIRouter(prefix="/api", tags=["history"])

@router.get("/history")
def get_portfolio_history():
    return {"history": history_repo.get_history()}
