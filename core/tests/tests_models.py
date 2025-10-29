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
        print("Asset representation test passed")
        self.assertEqual(str(self.historic), "NewBitcoin")
        print("historic representation test passed")
        self.assertEqual(str(self.current), "NewBitcoin")
        print("Asset current price test passed")



class WalletTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="walletuser", password="password")
        self.asset = Asset.objects.create(name="NewEthereum", type="crypto", symbol="NETH", price=Decimal("2000"))
        self.wallet = Wallet.objects.create(user=self.user, name="My Wallet")
        self.wallet_asset = WalletAsset.objects.create(wallet=self.wallet, asset=self.asset, quantity=Decimal("2"), purchase_price=Decimal("1800"), purchase_date=date.today())
        self.shared_wallet = SharedWallet.objects.create(wallet=self.wallet, shared_with=self.user)

    def test_wallet_assets(self):
        self.assertIn(self.asset, self.wallet.assets.all())
        self.assertEqual(str(self.wallet), "My Wallet")
        print("Create wallet test passed")
        self.assertEqual(self.wallet.walletasset_set.first().quantity, Decimal("2"))
        print("Wallet and WalletAsset test passed")


class FriendTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")
        self.friend_list1 = FriendList.objects.create(user=self.user1)
        self.friend_list2 = FriendList.objects.create(user=self.user2)
        self.request = FriendRequest.objects.create(sender=self.user1, receiver=self.user2)

    def test_add_remove_friend(self):
        self.friend_list1.add_friend(self.user2)
        self.assertIn(self.user2, self.friend_list1.friends.all())
        print("friend add test passed")
        self.friend_list1.remove_friend(self.user2)
        self.assertNotIn(self.user2, self.friend_list1.friends.all())
        print("friend remove test passed")

    def test_unfriend(self):
        self.friend_list1.add_friend(self.user2)
        self.friend_list1.unfriend(self.user2)
        self.assertNotIn(self.user2, self.friend_list1.friends.all())
        self.assertNotIn(self.user1, self.friend_list2.friends.all())
        print("unfriend test passed")

    def test_friend_request_accept_decline_cancel(self):
        self.request.accept()
        self.assertFalse(self.request.is_active)
        self.assertIn(self.user1, self.friend_list2.friends.all())
        print("FriendRequest accept test passed")

        fr2 = FriendRequest.objects.create(sender=self.user2, receiver=self.user1)
        fr2.decline()
        self.assertFalse(fr2.is_active)
        print("FriendRequest decline test passed")

        fr3 = FriendRequest.objects.create(sender=self.user1, receiver=self.user2)
        fr3.cancel()
        self.assertFalse(fr3.is_active)
        print("FriendRequest cancel test passed")

