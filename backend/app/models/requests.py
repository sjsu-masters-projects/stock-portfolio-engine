from typing import Literal
from pydantic import BaseModel, field_validator
from app.config import settings

StrategyKey = Literal["ethical", "growth", "index", "quality", "value"]

class PortfolioRequest(BaseModel):
    amount: float
    strategies: list[StrategyKey]

    @field_validator("amount")
    @classmethod
    def minimum_amount(cls, v: float) -> float:
        if v < settings.min_investment:
            raise ValueError(f"Minimum investment is ${settings.min_investment:,.0f}")
        return v

    @field_validator("strategies")
    @classmethod
    def validate_strategies(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("Select at least one strategy.")
        if len(v) > settings.max_strategies:
            raise ValueError(f"Select at most {settings.max_strategies} strategies.")
        return list(dict.fromkeys(v))  # dedupe preserving order

class CompareRequest(BaseModel):
    amount: float
    strategies_a: list[StrategyKey]
    strategies_b: list[StrategyKey]

    @field_validator("amount")
    @classmethod
    def minimum_amount(cls, v: float) -> float:
        if v < settings.min_investment:
            raise ValueError(f"Minimum investment is ${settings.min_investment:,.0f}")
        return v

    @field_validator("strategies_a", "strategies_b")
    @classmethod
    def validate_strategies(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("Select at least one strategy for each portfolio.")
        return list(dict.fromkeys(v))
