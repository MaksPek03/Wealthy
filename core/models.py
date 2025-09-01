from django.db import models
from django.contrib.auth.models import User 
from django.conf import settings
from django.utils import timezone

# basic model of an asset (name, type, symbol and the price)
class Asset(models.Model):
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 50)
    symbol = models.CharField(max_length = 10)
    price = models.DecimalField(max_digits = 10, decimal_places = 2)
    def __str__(self):
        return self.name  
    
# this models also save the date of recorded the price
class HistoricAsset(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_recorded = models.DateTimeField()  

# thre is show the newest price
class CurrentAsset(models.Model):
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 50)
    symbol = models.CharField(max_length = 10)
    current_price = models.DecimalField(max_digits = 10, decimal_places = 2)

# wallet is connected to the user, it has its own name and list of assets
class Wallet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length = 50)
    assets = models.ManyToManyField(Asset, through = 'WalletAsset')

# wallet asset is the table between the wallet and assets, with mean it 
# shows how many given assets the user bought for a given wallet, with the price and date
class WalletAsset(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete= models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateField()
    def __str__(self):
        return f"{self.asset.name} - {self.quantity} bought: {self.purchase_date} price: {self.purchase_price}"

# connection with the table user, and also friends as people who accept the invitation
class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank = True, related_name='friends')

    def __str__(self):
        return self.user.username
    # it adds the user to the friend list, if there is not there already
    def add_friend(self, account):
        if not account in self.friends.all():
            self.friends.add(account)
            self.save()

    # it removes the user from the friend list
    def remove_friend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)
            self.save()
    # it removes the friends in both accounts
    def unfriend(self, removee):
        remover_friends_list = self # person executing the friendship
        remover_friends_list.remove_friend(removee) # remove friend from remover friend list

        # remove friend from remove friend list
        friends_list = FriendList.objects.get(user=removee)
        friends_list.remove_friend(self.user)
    # it checks whethre the given person is on the list
    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False
    
# invitation to the friends
class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name = 'receiver')
    # it check whether someone accept/decline/cance
    is_active = models.BooleanField(blank=True, null=False, default=True)
    # when the invitation was send
    timestamp = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.sender.username
    
    # after accept, the user will be added to the list, and the invitaion will be deacitvate
    def accept(self):
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False
                self.save()

    # after the declination only the invitation will be deactivate
    def decline(self):
        self.is_active = False
        self.save()

    # cancelling is not the same as declining, 
    # cancelling is when the sender wants to cancel the request before it is accepted or declined
    def cancel(self):     
        self.is_active = False
        self.save() 

# every user can set the goal, with the name, description 
# and the target to aim, it shows also the deadline and the created of a goal
# the idead is to show how in percentages is near to obtain it
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
    
 # price alerts will be informing user, when the specific asset will obtain the price
 # it can be below or above some price   
class PriceAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    target_price = models.DecimalField(max_digits=12, decimal_places=2)
    above = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        direction = "above" if self.above else "below"
        return f"{self.asset.symbol} {direction} {self.target_price}"
    
# it shows the wallets that is shared with some person, from the friend list
class SharedWallet(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete = models.CASCADE)
    shared_with = models.ForeignKey(User, on_delete = models.CASCADE)
    shared_on = models.DateTimeField(auto_now_add = True)
    
    class Meta:
        unique_together = ('wallet', 'shared_with')

# a group that user can join
class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
# membership in a group    
class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)  
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'group')

    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({self.balance}$)"

# transactions in a group
class GroupTransaction(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE)
    description = models.CharField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def apply(self):
        self.membership.balance += self.amount
        self.membership.save()

# user can try to join the group, by this model
class JoinRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="join_requests")
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    # to not send the same join approve
    class Meta:
        unique_together = ('user', 'group')


class GroupAssetPurchase(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE) 
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)  
    quantity = models.DecimalField(max_digits=12, decimal_places=2) 
    price_at_purchase = models.DecimalField(max_digits=12, decimal_places=2)  
    created_at = models.DateTimeField(auto_now_add=True)

    def total_cost(self):
        return self.quantity * self.price_at_purchase

    def __str__(self):
        return f"{self.membership.user.username} bought {self.quantity} {self.asset.symbol} in {self.membership.group.name}"

