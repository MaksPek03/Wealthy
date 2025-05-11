from django import forms
from .models import Wallet, WalletAsset
class WalletForm(forms.ModelForm):
    class Meta:
        model = Wallet
        fields = ['name']

class WalletAssetForm(forms.ModelForm):
    class Meta:
        model = WalletAsset
        fields = ['quantity', 'purchase_price', 'purchase_date']
        widgets = {
            'purchase_date': forms.DateInput(attrs={'type':'date'}),
        }
