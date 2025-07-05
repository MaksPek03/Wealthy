from django.shortcuts import render,  redirect,  get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import Wallet, CurrentAsset, WalletAsset, Asset, HistoricAsset
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import WalletForm, WalletAssetForm
import json
import traceback
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.utils.timezone import now
from datetime import timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from .models import FriendRequest, FriendList, UserGoal
from django import forms
from .forms import PriceAlertForm
from .models import PriceAlert

def home(request):
    return render(request, 'core/home.html')

@csrf_exempt
def api_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "Logged in successfully"})
            else:
                return JsonResponse({"message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"message": "Server error"}, status=500)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)

@csrf_exempt
def api_register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return JsonResponse({"message": "Username and password required"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"message": "Username already taken"}, status=400)

            user = User.objects.create_user(username=username, password=password)
            user.save()

            return JsonResponse({"message": "User registered successfully"})
        except Exception as e:
            print("ERROR in api_register:", e)
            print(traceback.format_exc())
            return JsonResponse({"message": "Server error"}, status=500)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)

def api_price(request):
    prices = CurrentAsset.objects.all().values('name', 'symbol', 'current_price')
    return JsonResponse(list(prices), safe = False)

def api_asset_history(request, symbol):
    history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded').values('price', 'date_recorded')
    return JsonResponse(list(history), safe = False)

def api_asset_history_filter(request, symbol, day):
    if day != "max":
        day_int = int(day)
        time_threshold = now() - timedelta(days_int)
        history = HistoricAsset.objects.filter(
                symbol__iexact=symbol,
                date_recorded__gte=time_threshold
            ).order_by('-date_recorded').values('price', 'date_recorded')
    else:
        history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded').values('price', 'date_recorded')
    return JsonResponse(list(history), safe = False)

def api_asset_name(request, symbol):
    asset = Asset.objects.filter(symbol__iexact=symbol).first()
    return JsonResponse({'name': asset.name})

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
def asset_list(request):
    assets = Asset.objects.all()
    return render(request, 'core/asset_list.html', {'assets': assets})

@login_required
def asset_history(request, symbol):
    asset = get_object_or_404(Asset, symbol__iexact=symbol)
    history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded')
    return render(request, 'core/historic_price.html', {
        'asset': asset,
        'history': history
    })

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

@login_required
def send_friend_request(request, user_id):
    receiver = get_object_or_404(User, id=user_id)
    existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active = True)
    if not existing_request.exists() and request.user != receiver:
        FriendRequest.objects.create(sender=request.user, receiver=receiver)
    return redirect('friends_list')




@login_required
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver = request.user)
    friend_request.accept()
    return redirect('friends_list')

@login_required
def decline_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver = request.user)
    friend_request.decline()
    return redirect('friends_list')

@login_required
def remove_friend(request, user_id):
    user_to_remove = get_object_or_404(User, id=user_id)
    friend_list = FriendList.objects.get(user=request.user)
    if friend_list.is_mutual_friend(user_to_remove):
        friend_list.unfriend(user_to_remove)
    return redirect('friends_list')

@login_required
def friends_list(request):
    friend_list = FriendList.objects.get_or_create(user=request.user)[0]
    friends = friend_list.friends.all()
    friend_requests = FriendRequest.objects.filter(receiver=request.user, is_active=True)

    users = None
    query = request.GET.get('q')
    if query:
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)

    return render(request, 'core/friends_list.html', {
        'friends': friends,
        'friend_requests': friend_requests,
        'users': users,
    })


class UserGoalForm(forms.ModelForm):
    class Meta:
        model = UserGoal
        fields = ['name', 'description', 'target_amount', 'current_amount', 'deadline']


@login_required
def user_goals(request):
    goals = UserGoal.objects.filter(user=request.user)
    return render(request, 'core/user_goals.html', {'goals': goals})


@login_required
def add_user_goal(request):
    if request.method == 'POST':
        form = UserGoalForm(request.POST)
        if form.is_valid():
            goal = form.save(commit=False)
            goal.user = request.user
            goal.save()
            return redirect('user_goals')
    else:
        form = UserGoalForm()
    return render(request, 'core/add_user_goal.html', {'form': form})


@login_required
def delete_user_goal(request, goal_id):
    goal = get_object_or_404(UserGoal, id=goal_id, user=request.user)
    goal.delete()
    return redirect('user_goals')




@login_required
def add_price_alert(request, asset_id):
    asset = get_object_or_404(Asset, id=asset_id)
    if request.method == 'POST':
        form = PriceAlertForm(request.POST)
        if form.is_valid():
            alert = form.save(commit=False)
            alert.asset = asset
            alert.user = request.user
            alert.save()
            messages.success(request, 'Price alert added!')
            return redirect('asset_list')
    else:
        form = PriceAlertForm()
    return render(request, 'core/add_price_alert.html', {
        'form': form,
        'asset': asset
    })

