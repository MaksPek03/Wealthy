from django import forms
from .models import Wallet, WalletAsset
from .models import PriceAlert, UserGoal

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


class PriceAlertForm(forms.ModelForm):
    class Meta:
        model = PriceAlert
        fields = ['target_price', 'above']
        widgets = {
            'target_price': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'above': forms.CheckboxInput(attrs={'class': 'form-check-input'}),

        }



class UserGoalForm(forms.ModelForm):
    class Meta:
        model = UserGoal
        fields = ['name', 'description', 'target_amount', 'current_amount', 'deadline']
