from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from core.models import HistoricAsset, AssetTrend

class Command(BaseCommand):
    help = 'Update asset trends (day, week, month, year) with progress info'

    def handle(self, *args, **options):
        now = timezone.now()
        timeframes = {
            "day": now - timedelta(days=1),
            "week": now - timedelta(days=7),
            "month": now - timedelta(days=30),
            "year": now - timedelta(days=365),
        }

        symbols = list(HistoricAsset.objects.values_list('symbol', flat=True).distinct())
        total = len(symbols) * len(timeframes)
        done = 0

        self.stdout.write(self.style.WARNING(f"Starting trend update for {len(symbols)} symbols\n"))

        for tf_label, threshold in timeframes.items():
            for symbol in symbols:
                done += 1
                progress = (done / total) * 100

                records = HistoricAsset.objects.filter(
                    symbol=symbol, date_recorded__gte=threshold
                ).order_by('date_recorded')

                if records.count() < 2:
                    continue

                first_price = records.first().price
                last_price = records.last().price
                change_pct = ((last_price - first_price) / first_price * 100) if first_price > 0 else Decimal('0')

                AssetTrend.objects.update_or_create(
                    symbol=symbol,
                    timeframe=tf_label,
                    defaults={'change_pct': round(change_pct, 2)}
                )

                if done % 10 == 0 or done == total:
                    self.stdout.write(f"[{done}/{total}] {progress:.1f}% done")

        self.stdout.write(self.style.SUCCESS('\nAsset trends updated successfully'))
