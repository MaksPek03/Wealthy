import requests
from django.core.management.base import BaseCommand
from core.models import Asset, CurrentAsset


class Command(BaseCommand):
    KUCOIN_URL = "https://api.kucoin.com/api/v1/market/allTickers"
    FINNHUB_API_KEY = 'd0kbnhhr01qn937jroigd0kbnhhr01qn937jroj0'
    FINNHUB_URL = "https://finnhub.io/api/v1/quote"
    EXCHANGE_RATE_URL = "https://api.exchangerate.host/latest"

    FINNHUB_SYMBOL_MAP = {
        'tesla': 'TSLA',
        'apple': 'AAPL',
        'microsoft': 'MSFT',
        'google': 'GOOGL',
        'amazon': 'AMZN',
        'fb': 'META',
        'meta': 'META',
        'sp500': 'SPY',
        'nasdaq': 'QQQ',
        'dow_jones': 'DIA',
        'gold': 'GLD',
        'silver': 'SLV',
        'oil': 'USO',
        'platinum': 'PPLT',
    }

    KUCOIN_SYMBOL_MAP = {
        'ripple': 'XRP',
        'dogecoin': 'DOGE',
        'polkadot': 'DOT',
        'cardano': 'ADA',
    }

    def handle(self, *args, **kwargs):
        assets = Asset.objects.all()
        session = requests.Session()
        kucoin_data = self.get_kucoin_data(session)

        for asset in assets:
            try:
                price = None
                if asset.type == "CryptoCurrency":
                    price = self.get_crypto_price(asset, kucoin_data)
                elif asset.type == "FiatCurrency":
                    price = self.get_forex_price(session, asset.symbol.upper(), "USD")
                else:
                    price = self.get_finnhub_price(asset, session)

                if price is not None and price > 0:
                    self.update_asset(asset, price)
                    self.stdout.write(self.style.SUCCESS(f"Updated {asset.name} ({asset.symbol}): {price}"))
                else:
                    self.stdout.write(self.style.WARNING(f"No price found for {asset.name} ({asset.symbol})"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error updating {asset.name} ({asset.symbol}): {e}"))

    def get_kucoin_data(self, session):
        try:
            response = session.get(self.KUCOIN_URL, timeout=5)
            response.raise_for_status()
            data = response.json()
            return {item["symbol"]: float(item["last"]) for item in data["data"]["ticker"]}
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch KuCoin data: {e}"))
            return {}

    def get_crypto_price(self, asset, kucoin_data):
        symbol_key = self.KUCOIN_SYMBOL_MAP.get(asset.symbol.lower(), asset.symbol.upper())
        symbol = f"{symbol_key}-USDT"
        price = kucoin_data.get(symbol)
        if not price:
            self.stdout.write(self.style.WARNING(f"Crypto price not found for symbol: {symbol}"))
        return price

    def get_forex_price(self, session, base, quote="USD"):
        base = base.upper()
        quote = quote.upper()

        if base == quote:
            return 1.0

        try:
            url = f"https://api.frankfurter.app/latest"
            params = {
                'from': base,
                'to': quote,
            }
            response = session.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()

            rate = data.get('rates', {}).get(quote)
            if rate is None:
                self.stdout.write(self.style.WARNING(f"No forex rate found for {base}/{quote}"))
                return None
            return rate
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch forex rate {base}/{quote}: {e}"))
            return None



    def get_finnhub_price(self, asset, session):
        try:
            key = asset.symbol.lower()
            mapped_symbol = self.FINNHUB_SYMBOL_MAP.get(key, asset.symbol.upper())
            params = {'symbol': mapped_symbol, 'token': self.FINNHUB_API_KEY}
            response = session.get(self.FINNHUB_URL, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            return data.get('c')  # 'c' = current price
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch Finnhub price for {asset.symbol}: {e}"))
            return None

    def update_asset(self, asset, price):
        CurrentAsset.objects.update_or_create(
            name=asset.name,
            defaults={
                'symbol': asset.symbol,
                'type': asset.type,
                'current_price': price,
            }
        )
