import requests
import json
from django.core.management.base import BaseCommand
from core.models import Asset, CurrentAsset

class Command(BaseCommand):
    help = 'Update prices for Crypto, Stocks, Commodities, Indexes, and FiatCurrencies'

    SYMBOL_MAPPING = {
        'gold': 'XAU/USD',
        'silver': 'XAG/USD',
        'oil': 'WTICOUSD',
        'platinum': 'XPT/USD',
        'sp500': 'SPX',
        'nasdaq': 'IXIC',
        'dow_jones': 'DJI',
        'usd': 'USD',
        'eur': 'EUR/USD',
        'gbp': 'GBP/USD',
        'jpy': 'JPY/USD',
        'cad': 'CAD/USD',
    }

    TWELVE_DATA_API_KEY = '06d6c418d72d467daaaa5c7fde8c186a' 

    def handle(self, *args, **kwargs):
        kucoin_url = "https://api.kucoin.com/api/v1/market/allTickers"

        try:
            kucoin_response = requests.get(kucoin_url)
            kucoin_response.raise_for_status()
            kucoin_data = kucoin_response.json()

            if kucoin_data.get("code") == "200000":
                kucoin_tickers = kucoin_data.get("data", {}).get("ticker", [])
                assets = Asset.objects.all()

                for asset in assets:
                    asset_type = asset.type
                    asset_symbol = asset.symbol.lower()

                    if asset_type == "CryptoCurrency":
                        kucoin_symbol = f"{asset.symbol.upper()}-USDT"
                        ticker = next((item for item in kucoin_tickers if item["symbol"] == kucoin_symbol), None)

                        if ticker:
                            price = float(ticker["last"])
                            self.update_asset(asset, price)
                            self.stdout.write(self.style.SUCCESS(f'Updated Crypto {asset.name}: {price}'))
                        else:
                            self.stdout.write(self.style.WARNING(f'No data found for Crypto symbol: {kucoin_symbol}'))

                    elif asset_type in ["Stock", "Commodity", "Index", "FiatCurrency"]:
                        try:
                            twelve_symbol = self.SYMBOL_MAPPING.get(asset_symbol, asset.symbol.upper())

                            twelve_data_url = (
                                f"https://api.twelvedata.com/price?symbol={twelve_symbol}&apikey={self.TWELVE_DATA_API_KEY}"
                            )
                            response = requests.get(twelve_data_url)
                            response.raise_for_status()
                            data = response.json()

                            if "price" in data:
                                price = float(data["price"])
                                self.update_asset(asset, price)
                                self.stdout.write(self.style.SUCCESS(f'Updated {asset.type} {asset.name}: {price}'))
                            else:
                                self.stdout.write(self.style.WARNING(f'No price found for {asset.name}: {data.get("message", "Unknown error")}'))

                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"Error fetching {asset.symbol}: {e}"))

                    else:
                        self.stdout.write(self.style.WARNING(f'Unsupported asset type: {asset_type}'))

            else:
                self.stdout.write(self.style.ERROR('Failed to fetch KuCoin data'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Request failed: {e}"))

    def update_asset(self, asset, price):
        CurrentAsset.objects.update_or_create(
            name=asset.name,
            defaults={
                'symbol': asset.symbol,
                'type': asset.type,
                'current_price': price
            }
        )
