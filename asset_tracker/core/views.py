from django.shortcuts import render,  redirect,  get_object_or_404
from .models import Wallet, CurrentAsset, WalletAsset
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import WalletForm

def home(request):
    return render(request, 'core/home.html')

def register(request):
    form = UserCreationForm(request.POST or None)
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created')
            return redirect('login')

    return render(request, 'registration/register.html', {'form': form})


@login_required
def profile(request):
    return render(request, 'core/profile.html')


@login_required
def price(request):
    prices = CurrentAsset.objects.all()
    return render(request, 'core/price.html', {'prices': prices})


@login_required
def trends(request):
    return render(request,'core/trends.html')

@login_required
def wallets(request):
    wallets = Wallet.objects.filter(user=request.user)
    form = WalletForm()
    return render(request, 'core/wallet_list.html', {'wallets':wallets, 'form': form})

@login_required
def add_wallet(request):
    if request.method == 'POST':
        form = WalletForm(request.POST)
        if form.is_valid():
            wallet = form.save(commit=False)
            wallet.user = request.user
            wallet.save()
            return redirect('wallet_list')
    else:
        form = WalletForm()
    return render(request, 'core/add_wallet.html', {'form':form, 'wallets': Wallet.objects.filter(user=request.user)})

@login_required
def wallet_detail(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet_assets = WalletAsset.objects.filter(wallet=wallet).select_related('asset')
    return render(request, 'core/wallet_detail.html', {'wallet': wallet, 'wallet_assets': wallet_assets})

@login_required
def remove_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet.delete()
    return redirect('wallet_list')