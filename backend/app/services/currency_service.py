"""Currency conversion rates (USD base)."""

RATES = {"USD": 1.0, "EUR": 0.92, "GBP": 0.79, "JPY": 149.5, "INR": 83.4}


class CurrencyService:
    @staticmethod
    def convert(amount_usd: float, currency: str) -> float:
        return round(amount_usd * RATES.get(currency, 1.0), 2)

    @staticmethod
    def supported_currencies() -> list[str]:
        return list(RATES.keys())


currency_service = CurrencyService()
