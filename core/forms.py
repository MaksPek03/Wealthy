from django import forms
from .models import Wallet, WalletAsset
from .models import PriceAlert, UserGoal

# it only get the name, and creates new empty wallet, connected to a specific user
class WalletForm(forms.ModelForm):
    class Meta:
        model = Wallet
        fields = ['name']

# for a given wallet, user add the asset with purchase price, quntity and the date
class WalletAssetForm(forms.ModelForm):
    class Meta:
        model = WalletAsset
        fields = ['quantity', 'purchase_price', 'purchase_date']
        widgets = {
            'purchase_date': forms.DateInput(attrs={'type':'date'}),
        }

# for a speficic asset, user set the price target and whether the alert should be above or below
# target price has a bootstrap with the numeric field with the 0.01 step, and the above/below is a checkbox
class PriceAlertForm(forms.ModelForm):
    class Meta:
        model = PriceAlert
        fields = ['target_price', 'above']
        widgets = {
            'target_price': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'above': forms.CheckboxInput(attrs={'class': 'form-check-input'}),

        }


# form to set the aims for the user, with a few fields to fulfill
class UserGoalForm(forms.ModelForm):
    class Meta:
        model = UserGoal
        fields = ['name', 'description', 'target_amount', 'current_amount', 'deadline']
