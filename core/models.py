from django.db import models
from django.contrib.auth.models import User 
from django.conf import settings
from django.utils import timezone

class Asset(models.Model):
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 50)
    symbol = models.CharField(max_length = 10)
    price = models.DecimalField(max_digits = 10, decimal_places = 2)
    def __str__(self):
        return self.name  

class HistoricAsset(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_recorded = models.DateTimeField()  

class CurrentAsset(models.Model):
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 50)
    symbol = models.CharField(max_length = 10)
    current_price = models.DecimalField(max_digits = 10, decimal_places = 2)

class Wallet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length = 50)
    assets = models.ManyToManyField(Asset, through = 'WalletAsset')

class WalletAsset(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete= models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateField()
    def __str__(self):
        return f"{self.asset.name} - {self.quantity} bought: {self.purchase_date} price: {self.purchase_price}"

class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank = True, related_name='friends')

    def __str__(self):
        return self.user.username
    def add_friend(self, account):
        if not account in self.friends.all():
            self.friends.add(account)
            self.save()

    def remove_friend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)
            self.save()

    def unfriend(self, removee):
        remover_friends_list = self # person executing the friendship
        remover_friends_list.remove_friend(removee) # remove friend from remover friend list

        # remove friend from removee friend list
        friends_list = FriendList.objects.get(user=removee)
        friends_list.remove_friend(self.user)

    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False
    

class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name = 'receiver')
    is_active = models.BooleanField(blank=True, null=False, default=True)

    timestamp = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.sender.username
    
    def accept(self):
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False
                self.save()

    def decline(self):
        self.is_active = False
        self.save()

    # cancelling is not the same as declining, 
    # cancelling is when the sender wants to cancel the request before it is accepted or declined
    def cancel(self):     
        self.is_active = False
        self.save() 

class UserGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def progress_percentage(self):
        if self.target_amount > 0:
            return min(100, (self.current_amount / self.target_amount) * 100)
        return 0

    def __str__(self):
        return f"{self.name} ({self.user.username})"
    
class PriceAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    target_price = models.DecimalField(max_digits=12, decimal_places=2)
    above = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        direction = "above" if self.above else "below"
        return f"{self.asset.symbol} {direction} {self.target_price}"