import requests, json
from decimal import Decimal

_EXCHANGE_API_URLS = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies", 
    "https://latest.currency-api.pages.dev/v1/currencies"
]

# Source currency and to currency are currency code strings: e.g. "usd", "gbp", ...
# Read here: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json
# WARNING! Pass a decimal.Decimal in, not a float!
def _convert(amount: Decimal, source_currency, to_currency):
    for url in _EXCHANGE_API_URLS:
        r = requests.get(url + f"/{source_currency}.min.json")
        if r.status_code != 200: continue
        
        return amount * json.loads(r.text, parse_float=Decimal)[source_currency][to_currency]

    raise RuntimeError("Unable to connect to the exchange rate API.")

def convertVNDtoUSD(amount):
    return _convert(amount, "vnd", "usd")

def convertUSDtoVND(amount):
    return _convert(amount, "usd", "vnd")

