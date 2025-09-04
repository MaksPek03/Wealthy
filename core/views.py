from django.shortcuts import render,  redirect,  get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import Wallet, CurrentAsset, WalletAsset, Asset, HistoricAsset
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import WalletForm, WalletAssetForm, UserGoalForm
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
from .forms import PriceAlertForm, GroupForm
from .models import PriceAlert
from django.db.models import Sum, F, FloatField
from .models import SharedWallet

from .models import Group, Membership, GroupTransaction, JoinRequest, GroupAssetPurchase
from decimal import Decimal, InvalidOperation
from .forms import BuyAssetForm
from decimal import Decimal


# it returns the main page, it does not require log in
def home(request):
    return render(request, 'core/home.html')

# it parses the request.body and dowload the username and the passweord,
# then using authenticate function it verifies it in the database
# if everything is fine it will make the session with user id
# if password is wrong it will return the 405 error, or 500 if there will be some server error
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
                return JsonResponse({
                    "message": "Logged in successfully",
                    "user_id": user.id
                })
            else:
                return JsonResponse({"message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"message": "Server error"}, status=500)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


# it parses whether the username and password are given, then it will filter to check whether the username is already taken
# if everything is alright it will create an user, here we also have exception with 500 and 405 errors
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

# it get all values from currentAsset, so the newest prices, and return it as a list of dictonaries, where we
# have name, symbol and price
def api_price(request):
    prices = CurrentAsset.objects.all().values('name', 'symbol', 'current_price')
    return JsonResponse(list(prices), safe = False)

# it checks the price for a specific asset (symbol), and returns all the properties for a given asset
def api_asset_price(request, symbol):
    asset = CurrentAsset.objects.filter(symbol__iexact=symbol).values('name', 'symbol', 'current_price').first()
    return JsonResponse({'name': asset['name'],
                                     'symbol': asset['symbol'],
                                     'current_price': asset['current_price']}, safe = False)

# for a specific asset, this function will be looking for all prices saved in the HistoricAsset
# it returns the list with all prices, and date recorded for a specific asset
def api_asset_history(request, symbol):
    history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded').values('price', 'date_recorded')
    return JsonResponse(list(history), safe = False)


# it filters the historic prices starting from a specific day
# and return all prices from such period
def api_asset_history_filter(request, symbol, day):
    if day != "max":
        day_int = int(day)
        time_threshold = now() - timedelta(day_int)
        history = HistoricAsset.objects.filter(
                symbol__iexact=symbol,
                date_recorded__gte=time_threshold
            ).order_by('-date_recorded').values('price', 'date_recorded')
    else:
        history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded').values('price', 'date_recorded')
    return JsonResponse(list(history), safe = False)

# for a specific symbol it return the name of an asset
def api_asset_name(request, symbol):
    asset = Asset.objects.filter(symbol__iexact=symbol).first()
    return JsonResponse({'name': asset.name})

# for a specifi user_id it return the wallets that are connected with such user
def api_wallets(request, user_id):
    wallets = Wallet.objects.filter(user=user_id).values('id', 'name')
    return JsonResponse(list(wallets), safe=False)

# it creates the wallet, with a specific name for a given user

@csrf_exempt
def api_add_wallet(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            wallet_name = data.get('name')
            user_id = data.get('userId')

            if not wallet_name or not user_id:
                return JsonResponse({'error': 'Name and userId are required'}, status=400)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

            wallet = Wallet.objects.create(name=wallet_name, user=user)

            return JsonResponse({'id': wallet.id, 'name': wallet.name}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'POST method required'}, status=405)

# first of all, accordind to the wallet id, we get all assets
# then it aggregates all cost, so according to the quantity and the purchase price, we have a sum of purchases
# it creates a dictionary of all current prices
# for every position it counts the actual value and then add to the sum of the wallet
# it also counts the differnece between the purchase and actual value of the wallet, in the cash and also percentages
# it return the JSON file with all data
def api_wallet_detail(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet_assets = WalletAsset.objects.filter(wallet=wallet).select_related('asset')

    total_purchase_value = wallet_assets.aggregate(
        total=Sum(F('purchase_price') * F('quantity'), output_field=FloatField())
    )['total'] or 0

    asset_prices = {
        asset.symbol: asset.current_price for asset in CurrentAsset.objects.all()
    }

    total_value = 0
    assets_list = []

    for wa in wallet_assets:
        symbol = wa.asset.symbol
        current_price = asset_prices.get(symbol, 0)
        current_value = wa.quantity * current_price
        total_value += current_value

        assets_list.append({
            "id": wa.asset.id,
            "asset": wa.asset.name,
            "symbol": symbol,
        })

    total_difference = float(total_value) - float(total_purchase_value)
    difference_in_percentage = (
        (total_difference / float(total_purchase_value)) * 100
        if total_purchase_value > 0 else 0
    )

    data = {
        "wallet": {
            "id": wallet.id,
            "name": wallet.name,
            "user": wallet.user.username,
        },
        "assets": assets_list,
        "total_purchase": float(total_purchase_value),
        "total_value": float(total_value),
        "total_difference": float(total_difference),
        "difference_in_percentage": float(difference_in_percentage)
    }

    return JsonResponse(data, safe=False)

# it search for a specifi wallet, that has a given id and basically delete it
def api_remove_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet.delete()
    return JsonResponse({"message": "Wallet removed successfully"})


def api_list_of_assets(request):
    assets = Asset.objects.all().values('id', 'name')
    return JsonResponse(list(assets), safe=False)

@csrf_exempt
def api_add_wallet_asset_details(request, wallet_id, asset_id):

    wallet = get_object_or_404(Wallet, id=wallet_id)
    asset = get_object_or_404(Asset, id=asset_id)

    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
        quantity = data.get('quantity')
        purchase_price = data.get('purchase_price')
        purchase_date = data.get('purchase_date')

        wallet_asset = WalletAsset.objects.create(
            wallet=wallet,
            asset=asset,
            quantity=quantity,
            purchase_price=purchase_price,
            purchase_date=purchase_date
        )

        return JsonResponse({
            'id': wallet_asset.id,
            'wallet_id': wallet.id,
            'asset_id': asset.id,
            'quantity': wallet_asset.quantity,
            'purchase_price': wallet_asset.purchase_price,
            'purchase_date': str(wallet_asset.purchase_date)
        }, status=201)

    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def api_wallet_asset_detail(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transactions = WalletAsset.objects.filter(wallet=wallet, asset=asset)

    asset_total_purchase_value = transactions.aggregate(
        total=Sum(F('purchase_price') * F('quantity'), output_field=FloatField())
    )['total'] or 0

    try:
        current_price = CurrentAsset.objects.get(symbol=asset.symbol).current_price
    except CurrentAsset.DoesNotExist:
        current_price = 0

    total_value_transactions = sum(
        transaction.quantity * current_price for transaction in transactions
    )

    total_difference = float(total_value_transactions) - float(asset_total_purchase_value)
    total_difference_percentage = (
        (float(total_difference) / float(asset_total_purchase_value)) * 100
        if asset_total_purchase_value != 0 else 0
    )

    return JsonResponse({
        'wallet': {
            'id': wallet.id,
            'name': wallet.name,
        },
        'asset': {
            'id': asset.id,
            'name': asset.name,
            'symbol': asset.symbol,
        },
        'transactions': [
            {
                'id': t.id,
                'quantity': float(t.quantity),
                'purchase_price': float(t.purchase_price),
                'purchase_date': str(t.purchase_date)
            }
            for t in transactions
        ],
        'asset_total_purchase_value': float(asset_total_purchase_value),
        'total_value_transactions': float(total_value_transactions),
        'total_difference': float(total_difference),
        'total_difference_percentage': float(total_difference_percentage),
        'current_price': float(current_price),
    }, status=200)


def api_delete_wallet_transaction(request, wallet_id, asset_id, transaction_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transaction = get_object_or_404(WalletAsset, id=transaction_id, wallet=wallet, asset=asset)

    transaction.delete()

    return JsonResponse({"message": "Transaction removed successfully"})

def api_remove_wallet_asset(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transactions = WalletAsset.objects.filter(wallet=wallet, asset=asset)

    transactions.delete()

    return JsonResponse({"message": "Asset removed successfully"})

def api_friends_list(request):
    friend_list, _ = FriendList.objects.get_or_create(user=request.user)
    friends = friend_list.friends.all()

    friends_data = [
        {
            "id": friend.id,
            "username": friend.username,
        }
        for friend in friends
    ]

    return JsonResponse(friends_data, safe=False)

def register(request):
    form = UserCreationForm(request.POST or None)
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created')
            return redirect('login')

    return render(request, 'registration/register.html', {'form': form})


# main page, that is shown afeter the log in
@login_required
def profile(request):
    return render(request, 'core/profile.html')


# it get the currency, by the default it is a usd, then it will get all actual prices
# then it will look for every currency rate, from the current prices (the newest prices)
# for every asset it add the new field (coneverted_prices) whtich means the price in a given currency
@login_required
def price(request):
    currency = request.GET.get('currency', 'usd').lower()
    prices = CurrentAsset.objects.all()

    try:
        currency_asset = CurrentAsset.objects.get(symbol=currency)
        currency_rate = currency_asset.current_price
    except CurrentAsset.DoesNotExist:
        currency_rate = 1

    for asset in prices:
        asset.converted_price = round(asset.current_price / currency_rate, 2)

    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']

    return render(request, 'core/price.html', {
        'prices': prices,
        'currency': currency,
        'currencies': currencies,
    })


# it returns the list of all assets
@login_required
def asset_list(request):
    assets = Asset.objects.all()
    return render(request, 'core/asset_list.html', {'assets': assets})

# for specific symbol, it will return the asset with the whole history of the prices
@login_required
def asset_history(request, symbol):
    asset = get_object_or_404(Asset, symbol__iexact=symbol)
    history = HistoricAsset.objects.filter(symbol__iexact=symbol).order_by('-date_recorded')
    return render(request, 'core/historic_price.html', {
        'asset': asset,
        'history': history
    })

# now it is only a template, there will be a trends for type of assets
# and also the most increasing/decreasing assets in a list
@login_required
def trends(request):
    return render(request,'core/trends.html')

# it returns all wallets for a specific user
# and also it will create a new empty form to add new wallets
@login_required
def wallets(request):
    wallets = Wallet.objects.filter(user=request.user)
    form = WalletForm()
    return render(request, 'core/wallet_list.html', {'wallets':wallets, 'form': form})

# function that adds the wallet to the database, after the user fulfill the form in the app
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

# given function returns assets connected to the wallet, check the price of purchase of every of them
# then checks the actual value of the all assets, to counts the differnce in price, both in currency and percentages
# there exist a possible option to check the prices in a different currency
@login_required
def wallet_detail(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet_assets = WalletAsset.objects.filter(wallet=wallet).select_related('asset')

    total_purchase_value = wallet_assets.aggregate(
        total=Sum(F('purchase_price') * F('quantity'), output_field=FloatField())
    )['total'] or 0

    asset_prices = {
        asset.symbol: asset.current_price for asset in CurrentAsset.objects.all()
    }

    total_value = 0
    for wa in wallet_assets:
        symbol = wa.asset.symbol
        if symbol in asset_prices:
            total_value += wa.quantity * asset_prices[symbol]

    total_difference = float(total_value) - float(total_purchase_value)
    differnce_in_percentage = (total_difference/float(total_purchase_value))*100


    currency = request.GET.get('currency', 'usd').lower()
    prices = CurrentAsset.objects.all()
    try:
        currency_asset = CurrentAsset.objects.get(symbol=currency)
        currency_rate = currency_asset.current_price
    except CurrentAsset.DoesNotExist:
        currency_rate = 1
    for asset in prices:
        asset.converted_price = round(asset.current_price / currency_rate, 2)
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']

    converted_total_value = total_value / currency_rate
    converted_total_purchase_value = float(total_purchase_value) / float(currency_rate)
    converted_total_difference = float(converted_total_value) - float(converted_total_purchase_value)
    converted_difference_in_percentage = (
        (converted_total_difference / converted_total_purchase_value) * 100 if total_purchase_value else 0
    )

    return render(request, 'core/wallet_detail.html', {
        'wallet': wallet,
        'wallet_assets': wallet_assets,
        'total_purchase': converted_total_purchase_value,
        'total_value': converted_total_value,
        'total_difference': converted_total_difference,
        'difference_in_percentage': converted_difference_in_percentage,
        'prices': prices,
        'currency': currency,
        'currencies': currencies,
    })


# for a given asset in a wallet the user can do the same as above
# so for specific purchase, we also see the difference in actual value and purchase price
# there is also an option to change the currency
@login_required
def wallet_asset_detail(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transactions = WalletAsset.objects.filter(wallet=wallet, asset=asset)

    asset_total_purchase_value = transactions.aggregate(
        total=Sum(F('purchase_price') * F('quantity'), output_field=FloatField())
    )['total'] or 0

    try:
        base_price = CurrentAsset.objects.get(symbol=asset.symbol).current_price
    except CurrentAsset.DoesNotExist:
        base_price = 0

    currency = request.GET.get('currency', 'usd').lower()
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']

    try:
        currency_asset = CurrentAsset.objects.get(symbol=currency)
        currency_rate = currency_asset.current_price
    except CurrentAsset.DoesNotExist:
        currency_rate = 1

    converted_price = round(base_price / currency_rate, 2)

    total_value_transactions = sum(tx.quantity * converted_price for tx in transactions)
    converted_total_purchase = float(asset_total_purchase_value) / float(currency_rate)

    total_difference = float(total_value_transactions) - float(converted_total_purchase)
    total_difference_percentage = (
        (total_difference / converted_total_purchase) * 100 if converted_total_purchase else 0
    )


    return render(request, 'core/wallet_asset_detail.html', {
        'wallet': wallet,
        'asset': asset,
        'transactions': transactions,
        'converted_price': converted_price,
        'asset_total_purchase_value': converted_total_purchase,
        'total_value_transactions': total_value_transactions,
        'total_difference': total_difference,
        'total_difference_percentage': total_difference_percentage,
        'currency': currency,
        'currencies': currencies,
    })

# it shows all the assets in a wallet, basically it should not named 'add'
@login_required
def add_wallet_asset(request, wallet_id):
    assets = Asset.objects.all()
    return render(request, 'core/add_wallet_asset.html', {'wallet_id': wallet_id, 'assets': assets})
# here the user can add the asset, to the wallet, after fulfill the form
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
            return redirect('wallet_detail', wallet_id=wallet.id)
    else:
        form = WalletAssetForm()

    return render(request, 'core/add_wallet_asset_details.html', {
        'form': form,
        'wallet_id': wallet_id,
        'asset_id': asset_id,

    })

# according to the id of a wallet, it is deleted
@login_required
def remove_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet.delete()
    return redirect('wallet_list')

# from a given, we deleted a specific asset, with its own 'transactions'
@login_required
def remove_wallet_asset(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transactions = WalletAsset.objects.filter(wallet=wallet, asset=asset)

    if transactions.exists():
        transactions.delete()
        messages.success(request, f"{asset.name} removed from your wallet.")
    else:
        messages.error(request, "no such asset in your wallet")

    return redirect('wallet_detail', wallet_id=wallet_id)

from django.views.decorators.http import require_POST

# user delete only one of the transaction, not whole the asset, one asset can have many transactions
@login_required
def delete_wallet_transaction(request, wallet_id, asset_id, transaction_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transaction = get_object_or_404(WalletAsset, id=transaction_id, wallet=wallet, asset=asset)

    transaction.delete()
    messages.success(request, "transaction deleted successfully")

    return redirect('wallet_asset_detail', wallet_id=wallet.id, asset_id=asset.id)


# it creates the invitaion of a friend request, and send to the specific person
@login_required
def send_friend_request(request, user_id):
    receiver = get_object_or_404(User, id=user_id)
    existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active = True)
    if not existing_request.exists() and request.user != receiver:
        FriendRequest.objects.create(sender=request.user, receiver=receiver)
    return redirect('friends_list')



# accept of a invitation
@login_required
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver = request.user)
    friend_request.accept()
    return redirect('friends_list')

# decline of a invitation
@login_required
def decline_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver = request.user)
    friend_request.decline()
    return redirect('friends_list')

# removinf a friend, by one of the user
@login_required
def remove_friend(request, user_id):
    user_to_remove = get_object_or_404(User, id=user_id)
    friend_list = FriendList.objects.get(user=request.user)
    if friend_list.is_mutual_friend(user_to_remove):
        friend_list.unfriend(user_to_remove)
    return redirect('friends_list')

# the function return the list of friends, but also the list of the invitations
# also user can search for a friend
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


# for a specific user that sends the request, it will returns all the goals that are setted
@login_required
def user_goals(request):
    goals = UserGoal.objects.filter(user=request.user)
    return render(request, 'core/user_goals.html', {'goals': goals})

# after fulfill the form, the goal is added to the user
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

# delete the user goal
@login_required
def delete_user_goal(request, goal_id):
    goal = get_object_or_404(UserGoal, id=goal_id, user=request.user)
    goal.delete()
    return redirect('user_goals')



# after fullfill the form about the price alerts the price allert is added to the database
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

# the idea is to show the all alerts that are connected with the user, but also showing how is far
# to get such price by the asset
@login_required
def my_alerts(request):
    user_alerts = PriceAlert.objects.filter(user=request.user).select_related('asset')

    alerts_with_diff = []
    for alert in user_alerts:
        try:
            current_asset = CurrentAsset.objects.get(symbol=alert.asset.symbol)
            current_price = current_asset.current_price
        except CurrentAsset.DoesNotExist:
            current_price = None

        if current_price is not None:
            difference = round(alert.target_price - current_price, 2)
        else:
            difference = "no data"

        alerts_with_diff.append({
            'alert': alert,
            'current_price': current_price,
            'difference': difference,
        })

    return render(request, 'core/my_alerts.html', {
        'alerts_with_diff': alerts_with_diff
    })

# function to share the wallet, by the id to the other user, from the user friend list

@login_required
def share_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user = request.user)
    friends = FriendList.objects.get(user=request.user).friends.all()

    if request.method == "POST":
        friend_id = request.POST.get('friend_id')
        friend_user = get_object_or_404(User, id=friend_id)

        SharedWallet.objects.get_or_create(wallet=wallet, shared_with=friend_user)
        messages.success(request, f'you shared a wallet to user: {friend_user.username}')
        return redirect('wallet_detail', wallet_id=wallet.id)
    return render(request, 'core/share_wallet.html',{
        'wallet': wallet,
        'friends': friends
    })
# the list of all shared wallets to the user by the friends
@login_required
def shared_wallets(request):
    shared_wall = SharedWallet.objects.filter(shared_with=request.user).select_related('wallet')
    wallets = [shared.wallet for shared in shared_wall]

    return render(request, 'core/shared_wallets.html', {
        'shared_wallets': wallets
    })

# once someone shared the wallet to the user
# the user can obtain the details of such wallets including the assets and purchase prices that are in it
# the function show also the current price of those purchases
@login_required
def shared_wallet_detail(request, wallet_id):
    shared = get_object_or_404(SharedWallet, wallet__id=wallet_id, shared_with=request.user)
    wallet = shared.wallet
    wallet_assets = WalletAsset.objects.filter(wallet=wallet).select_related('asset')

    asset_prices = {
        asset.symbol: asset.current_price for asset in CurrentAsset.objects.all()
    }

    for wa in wallet_assets:
        wa.current_price = asset_prices.get(wa.asset.symbol, 0)

    total_value = sum(wa.quantity * wa.current_price for wa in wallet_assets)

    return render(request, 'core/shared_wallet_detail.html', {
        'wallet': wallet,
        'wallet_assets': wallet_assets,
        'total_value': total_value
    })

# list all groups
@login_required
def group_list(request):
    groups = Group.objects.all()
    return render(request, 'core/group_list.html', {"groups": groups})

# details of group and ladeboard
@login_required
def group_detail(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    members = Membership.objects.filter(group=group).order_by('-balance')
    assets = CurrentAsset.objects.all()

    membership = Membership.objects.filter(group=group, user=request.user).first()

    return render(request, 'core/group_detail.html', {
        "group": group,
        "members": members,
        "assets": assets,
        "membership": membership,  # <-- dodane
    })




@login_required
def join_group(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    membership, created = Membership.objects.get_or_create(user=request.user, group=group)
    return redirect("group_detail", group_id = group.id)


@login_required
def request_to_join(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    JoinRequest.objects.get_or_create(user=request.user, group=group)
    return redirect("group_detail", group_id=group.id)

# owner can approve
@login_required
def approve_request(request, group_id, request_id):
    join_request = get_object_or_404(JoinRequest, id=request_id, group_id=group_id)
    group = join_request.group

    if request.user != group.created_by:
        return redirect('group_detail', group_id=group.id)

    join_request.is_approved = True
    join_request.save()

    Membership.objects.get_or_create(user=join_request.user, group=group)

    return redirect("group_detail", group_id=group.id)


@login_required
def reject_request(request, group_id, request_id):
    join_request = get_object_or_404(JoinRequest, id=request_id, group_id=group_id)
    group = join_request.group

    if request.user == group.created_by:
        join_request.delete()

    return redirect("group_detail", group_id=group.id)



@login_required
def buy_asset_in_group(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    membership = get_object_or_404(Membership, group=group, user=request.user)

    if request.method == "POST":
        form = BuyAssetForm(request.POST)
        if form.is_valid():
            current_asset = form.cleaned_data["asset"]
            asset = get_object_or_404(Asset, symbol=current_asset.symbol)
            quantity = form.cleaned_data["quantity"]

            total_cost = Decimal(quantity) * current_asset.current_price

            if membership.balance < total_cost:
                messages.error(request, "Not enough balance in group account!")
                return redirect("group_detail", group_id=group.id)

            GroupAssetPurchase.objects.create(
                membership=membership,
                asset=asset,
                quantity=quantity,
                price_at_purchase=current_asset.current_price,
            )

            membership.balance -= total_cost
            membership.save()

            messages.success(request, f"Bought {quantity} {asset.symbol} for {total_cost}$")
            return redirect("group_detail", group_id=group.id)
    else:
        form = BuyAssetForm()

    return render(request, "core/buy_asset_in_group.html", {
        "group": group,
        "membership": membership,
        "form": form,
    })


@login_required
def group_create(request):
    if request.method == "POST":
        form = GroupForm(request.POST)
        if form.is_valid():
            group = form.save(commit=False)
            group.created_by = request.user
            group.save()
            # the create one is of course the owner
            Membership.objects.create(user=request.user, group=group, balance=0)
            return redirect("group_detail", group_id=group.id)
    else:
        form = GroupForm()
    return render(request, "core/group_create.html", {"form": form})


@login_required
def distribute_balance(request, group_id):
    group = get_object_or_404(Group, id=group_id)

    if request.user != group.created_by:
        messages.error(request, "Only the group owner can distribute balance.")
        return redirect("group_detail", group_id=group.id)

    if request.method == "POST":
        amount = request.POST.get("amount")
        try:
            amount = Decimal(amount)
        except InvalidOperation:
            messages.error(request, "Invalid amount.")
            return redirect("group_detail", group_id=group.id)

        memberships = Membership.objects.filter(group=group)
        for membership in memberships:
            membership.balance += amount
            membership.save()

        messages.success(request, f"Distributed {amount}$ to all group members.")
        return redirect("group_detail", group_id=group.id)

    return render(request, "core/distribute_balance.html", {"group": group})
