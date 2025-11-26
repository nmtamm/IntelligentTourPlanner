from fastapi import APIRouter, Query
from decimal import Decimal
from ..services.exchangerate_service import convertVNDtoUSD, convertUSDtoVND

router = APIRouter(prefix="/api/exchangerate", tags=["exchangerate"])


@router.get("/")
def convert_currency(
    amount: float = Query(...), source: str = Query(...), target: str = Query(...)
):
    try:
        decimal_amount = Decimal(str(amount))
        if source == "vnd" and target == "usd":
            result = convertVNDtoUSD(decimal_amount)
        elif source == "usd" and target == "vnd":
            result = convertUSDtoVND(decimal_amount)
        else:
            return {"error": "Unsupported currency pair"}
        return {"amount": float(result), "source": source, "target": target}
    except Exception as e:
        return {"error": str(e)}
