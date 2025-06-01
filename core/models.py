from django.db import models
from django.contrib.auth.models import User 

class Asset(models.Model):
    name = models.CharField(max_length = 50)
    type = models.CharField(max_length = 50)
    symbol = models.CharField(max_length = 10)
    price = models.DecimalField(max_digits = 10, decimal_places = 2)

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
    