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
        print("Friend request accept test passed")

        fr2 = FriendRequest.objects.create(sender=self.user2, receiver=self.user1)
        fr2.decline()
        self.assertFalse(fr2.is_active)
        print("Friend request decline test passed")

        fr3 = FriendRequest.objects.create(sender=self.user1, receiver=self.user2)
        fr3.cancel()
        self.assertFalse(fr3.is_active)
        print("Friend request cancel test passed")




class UserGoalTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="goaluser", password="pass")
        self.wallet = Wallet.objects.create(user=self.user, name="Wallet1")
        self.asset = Asset.objects.create(name="BTC", type="crypto", symbol="BTC", price=Decimal("30000"))
        WalletAsset.objects.create(wallet=self.wallet, asset=self.asset, quantity=Decimal("0.5"), purchase_price=Decimal("25000"), purchase_date=date.today())
        CurrentAsset.objects.create(name="BTC", type="crypto", symbol="BTC", current_price=Decimal("35000"))
        self.goal = UserGoal.objects.create(user=self.user, name="new goal", target_amount=Decimal("20000"))

    def test_progress_percentage(self):
        perc = self.goal.progress_percentage()
        self.assertGreater(perc, 0)
        self.assertLessEqual(perc, 100)
        print("User goal progress percentage test passed")

class PriceAlertTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alertuser", password="pass")
        self.asset = Asset.objects.create(name="Ethereum", type="crypto", symbol="ETH", price=Decimal("2000"))
        self.alert = PriceAlert.objects.create(user=self.user, asset=self.asset, target_price=Decimal("2500"), above=True)

    def test_alert_str(self):
        self.assertIn("ETH", str(self.alert))
        self.assertIn("above", str(self.alert))
        print("Price alert string test passed")


class GroupTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="groupuser", password="pass")
        self.asset = Asset.objects.create(name="BTC", type="crypto", symbol="BTC", price=Decimal("30000"))
        self.current = CurrentAsset.objects.create(name="BTC", type="crypto", symbol="BTC", current_price=Decimal("35000"))
        self.group = Group.objects.create(name="Test Group", description="Group desc", created_by=self.user)
        self.membership = Membership.objects.create(user=self.user, group=self.group, balance=Decimal("100"))
        self.purchase = GroupAssetPurchase.objects.create(membership=self.membership, asset=self.asset, quantity=Decimal("0.5"), price_at_purchase=Decimal("30000"))
        self.transaction = GroupTransaction.objects.create(membership=self.membership, amount=Decimal("50"))
        self.join_request = JoinRequest.objects.create(user=self.user, group=self.group)

    def test_group_dates(self):
        self.assertIsNotNone(self.group.start_time)
        self.assertEqual(self.group.purchase_end_time, self.group.start_time + timedelta(days=self.group.purchase_days))
        self.assertEqual(self.group.summary_time, self.group.start_time + timedelta(days=self.group.summary_days))
        print("Group date calculation test passed")

    def test_is_purchase_active_and_summary_due(self):
        self.assertTrue(self.group.is_purchase_active())
        self.assertFalse(self.group.is_summary_due())
        print("Group purchase and summary period test passed")

    def test_membership_portfolio_value(self):
        total = self.membership.portfolio_value()
        self.assertGreaterEqual(total, Decimal("100"))
        print("Membership portfolio value test passed")

    def test_group_transaction_apply(self):
        self.transaction.apply()
        self.assertEqual(self.membership.balance, Decimal("150"))
        print("Group transaction apply test passed")

    def test_join_request(self):
        self.assertFalse(self.join_request.is_approved)
        print("Join request test passed")

    def test_group_asset_total_cost(self):
        self.assertEqual(self.purchase.total_cost(), Decimal("15000"))
        print(" Group asset purchase total cost test passed")


class AssetTrendTestCase(TestCase):
    def setUp(self):
        self.trend = AssetTrend.objects.create(symbol="BTC", timeframe="1D", change_pct=Decimal("5.5"))

    def test_str(self):
        self.assertIn("BTC", str(self.trend))
        self.assertIn("1D", str(self.trend))
        print("Asset trend string test passed")



