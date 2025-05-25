from django.shortcuts import render,  redirect,  get_object_or_404
from .models import Wallet, CurrentAsset, WalletAsset, Asset
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import WalletForm, WalletAssetForm

def home(request):
    return render(request, 'core/home.html')

def api_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON"}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Logged in successfully"})
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


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
def add_wallet_asset(request, wallet_id):
    assets = Asset.objects.all()
    return render(request, 'core/add_wallet_asset.html', {'wallet_id': wallet_id, 'assets': assets})

@login_required
def add_wallet_asset_details(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id)
    asset = get_object_or_404(Asset, id=asset_id)

    if request.method == 'POST':
        form = WalletAssetForm(request.POST)
        if form.is_valid():
            wallet_asset = form.save(commit=False)
            wallet_asset.wallet = wallet
            wallet_asset.asset = asset
            wallet_asset.save()
            return redirect('wallet_details', wallet_id=wallet.id)
    else:
        form = WalletAssetForm()

    return render(request, 'core/add_wallet_asset_details.html', {
        'form': form,
        'wallet_id': wallet_id,
        'asset_id': asset_id,
        
    })

@login_required
def remove_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet.delete()
    return redirect('wallet_list')
