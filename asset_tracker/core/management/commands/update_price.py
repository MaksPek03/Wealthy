import requests
import json
from django.core.management.base import BaseCommand
from core.models import Asset, CurrentAsset
from datetime import date
import time

class Command(BaseCommand):
    help = 'Update prices from KuCoin API and save to database'

    def handle(self, *args, **kwargs):
        url = "https://api.kucoin.com/api/v1/market/allTickers"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") == "200000":
                tickers = data.get("data", {}).get("ticker", [])
                assets = Asset.objects.all()
                for asset in assets:
                    if asset.type == "CryptoCurrency":
                        symbol = f"{asset.symbol.upper()}-USDT" 
                        ticker = next((item for item in tickers if item["symbol"] == symbol), None)
                        if ticker:
                            price = float(ticker["last"])  
                            CurrentAsset.objects.update_or_create(
                                name=asset.name,
                                defaults={
                                    'symbol': asset.symbol,
                                    'type': asset.type,
                                    'current_price': price
                                }
                            )

                            self.stdout.write(self.style.SUCCESS(f'Updated price for {asset.name}: {price}'))
                        else:
                            self.stdout.write(self.style.WARNING(f'No data found for symbol: {symbol}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Skipping non-cryptocurrency asset: {asset.name}'))
            else:
                self.stdout.write(self.style.ERROR('Error fetching data from KuCoin API'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Request failed: {e}"))
