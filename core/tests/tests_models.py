from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from core.models import (
    Asset, HistoricAsset, CurrentAsset, Wallet, WalletAsset,
    FriendList, FriendRequest, UserGoal, PriceAlert,
    SharedWallet, Group, Membership, GroupTransaction,
    JoinRequest, GroupAssetPurchase, AssetTrend
)

class AssetTestCase(TestCase):
    def setUp(self):
        self.asset = Asset.objects.create(name="NewBitcoin", type="crypto", symbol="NBTC", price=Decimal("100000"))
        self.historic = HistoricAsset.objects.create(
            name="NewBitcoin", type="crypto", symbol="NBTC", price=Decimal("90000"), date_recorded=timezone.now()
        )
        self.current = CurrentAsset.objects.create(name="NewBitcoin", type="crypto", symbol="BTC", current_price=Decimal("35000"))

    def test_asset_str(self):
        self.assertEqual(str(self.asset), "NewBitcoin")
        print("Asset string representation test passed")