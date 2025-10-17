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
from .models import SharedWallet
from .models import AssetTrend

from .models import Group, Membership, GroupTransaction, JoinRequest, GroupAssetPurchase
from decimal import Decimal, InvalidOperation
from .forms import BuyAssetForm
from decimal import Decimal
from django.db.models import Max, Min, Avg
from django.utils.timezone import now
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.http import require_POST
from django.db.models import DecimalField, F, Sum
from django.db.models import Sum, F, DecimalField, ExpressionWrapper, FloatField



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
    
def api_exchange_rates(request):
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']
    assets = CurrentAsset.objects.filter(symbol__in=currencies)
    asset_map = {asset.symbol: asset.current_price for asset in assets}
    rates = {currency: asset_map.get(currency, None) for currency in currencies}
    return JsonResponse(rates, safe = False)

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

def api_add_user_goal(request):
    if request.method != "POST":
            return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')
        targetAmount = data.get('targetAmount')
        deadline = data.get('deadline')
        userId = data.get('userId')

        user = get_object_or_404(User, id=userId)

        goal = Goals.objects.create(
            user=user,
            name=name,
            description=description,
            target_amount=targetAmount,
            deadline=deadline
        )

        return JsonResponse({
            'name': goal.name,
            'description': goal.description,
            'target_amount': goal.target_amount,
            'deadline': goal.deadline,
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

def api_friend_requests_list(request):
    friend_requests = FriendRequest.objects.filter(receiver=request.user, is_active=True)

    requests_data = [
        {
            "id": fr.id,
            "sender_id": fr.sender.id,
            "sender_username": fr.sender.username,
        }
        for fr in friend_requests
    ]

    return JsonResponse(requests_data, safe=False)

def api_accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver=request.user)
    friend_request.accept()

    return JsonResponse({"message": "Request accepted successfully"})


def api_decline_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver=request.user)
    friend_request.decline()

    return JsonResponse({"message": "Request declined successfully"})

def api_remove_friend(request, user_id):
    user_to_remove = get_object_or_404(User, id=user_id)
    friend_list = FriendList.objects.get(user=request.user)
    if friend_list.is_mutual_friend(user_to_remove):
        friend_list.unfriend(user_to_remove)

    return JsonResponse({"message": "Friend removed successfully"})

def api_users_list(request):
    users = User.objects.exclude(id=request.user.id)

    users_data = [
            {
                "id": user.id,
                "username": user.username,
            }
            for user in users
        ]

    return JsonResponse(users_data, safe=False)

def api_send_friend_request(request, user_id):
    receiver = get_object_or_404(User, id=user_id)
    existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active = True)
    if not existing_request.exists() and request.user != receiver:
        FriendRequest.objects.create(sender=request.user, receiver=receiver)

    return JsonResponse({"message": "Request sent successfully"})

def api_trends(request, user_id):
    wallets = Wallet.objects.filter(user=user_id)
    wallet_assets = WalletAsset.objects.filter(wallet__in=wallets).select_related('asset')

    # Total portfolio value
    asset_prices = {a.symbol: a.current_price for a in CurrentAsset.objects.all()}
    total_value = sum(
        wa.quantity * asset_prices.get(wa.asset.symbol, wa.purchase_price)
        for wa in wallet_assets
    )

    # Timeframes
    timeframes = ['day', 'week', 'month', 'year']

    # Top/Bottom assets
    trends_data = {}
    for tf in timeframes:
        records = AssetTrend.objects.filter(timeframe=tf)
        sorted_records = sorted(records, key=lambda x: x.change_pct, reverse=True)
        best = sorted_records[:5]
        worst = sorted_records[-5:][::-1]

        max_len = max(len(best), len(worst))
        paired = []
        for i in range(max_len):
            paired.append({
                'best': {
                    'symbol': best[i].symbol,
                    'change_pct': best[i].change_pct,
                } if i < len(best) else None,
                'worst': {
                    'symbol': worst[i].symbol,
                    'change_pct': worst[i].change_pct,
                } if i < len(worst) else None,
            })
        trends_data[tf] = paired

    # Average change by asset type
    type_trends = {}
    asset_types = Asset.objects.values_list('type', flat=True).distinct()
    for atype in asset_types:
        type_trends[atype] = {}
        symbols_of_type = Asset.objects.filter(type=atype).values_list('symbol', flat=True)
        for tf in timeframes:
            records = AssetTrend.objects.filter(
                timeframe=tf,
                symbol__in=symbols_of_type
            )
            if records:
                avg_change = sum(r.change_pct for r in records) / len(records)
                type_trends[atype][tf] = round(avg_change, 2)
            else:
                type_trends[atype][tf] = None

    return JsonResponse({
        "total_value": total_value,
        "trends_data": trends_data,
        "type_trends": type_trends,
        "timeframes": timeframes,
    }, safe=False)

def register(request):
    form = UserCreationForm(request.POST or None)
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created!')
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
    asset_type = request.GET.get('type', None)
    prices = CurrentAsset.objects.all()

    if asset_type:
        prices = prices.filter(type=asset_type)

    try:
        currency_asset = CurrentAsset.objects.get(symbol=currency)
        currency_rate = currency_asset.current_price
    except CurrentAsset.DoesNotExist:
        currency_rate = 1

    for price_obj in prices:
        price_obj.converted_price = round(price_obj.current_price / currency_rate, 2)

    asset_types = CurrentAsset.objects.values_list('type', flat=True).distinct()

    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']

    return render(request, 'core/price.html', {
        'prices': prices,
        'currency': currency,
        'currencies': currencies,
        'asset_types': asset_types,
        'selected_type': asset_type,
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

# given function returns assets connected to the wallet, check the price of purchase of every of them
# then checks the actual value of the all assets, to counts the differnce in price, both in currency and percentages
# there exist a possible option to check the prices in a different currency

@login_required
def wallet_detail(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    wallet_assets = WalletAsset.objects.filter(wallet=wallet).select_related('asset')

    asset_summaries_dict = {}

    for wa in wallet_assets:
        asset_id = wa.asset.id
        if asset_id not in asset_summaries_dict:
            asset_summaries_dict[asset_id] = {
                'asset': wa.asset,
                'symbol': wa.asset.symbol,
                'total_quantity': wa.quantity,
                'total_purchase': wa.purchase_price,
                'current_unit_price': Decimal('0'),
                'current_total': Decimal('0'),
            }
        else:
            asset_summaries_dict[asset_id]['total_quantity'] += wa.quantity
            asset_summaries_dict[asset_id]['total_purchase'] += wa.purchase_price

    asset_prices = {a.symbol: Decimal(a.current_price) for a in CurrentAsset.objects.all()}

    total_value = Decimal('0')
    for summary in asset_summaries_dict.values():
        current_price = asset_prices.get(summary['symbol'], Decimal('0'))
        summary['current_unit_price'] = current_price
        summary['current_total'] = summary['total_quantity'] * current_price
        total_value += summary['current_total']

    total_purchase_value = sum(s['total_purchase'] for s in asset_summaries_dict.values())
    total_difference = total_value - total_purchase_value
    difference_in_percentage = (total_difference / total_purchase_value * Decimal('100')) if total_purchase_value > 0 else Decimal('0')

    # Waluta
    currency = request.GET.get('currency', 'usd').lower()
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']
    try:
        currency_rate = Decimal(CurrentAsset.objects.get(symbol=currency).current_price)
    except CurrentAsset.DoesNotExist:
        currency_rate = Decimal('1')

    converted_total_value = total_value / currency_rate
    converted_total_purchase_value = total_purchase_value / currency_rate
    converted_total_difference = converted_total_value - converted_total_purchase_value
    converted_difference_in_percentage = (
        (converted_total_difference / converted_total_purchase_value * Decimal('100'))
        if converted_total_purchase_value > 0 else Decimal('0')
    )

    asset_summaries = list(asset_summaries_dict.values())

    return render(request, 'core/wallet_detail.html', {
        'wallet': wallet,
        'wallet_assets': wallet_assets,
        'asset_summaries': asset_summaries,
        'total_purchase': converted_total_purchase_value,
        'total_value': converted_total_value,
        'total_difference': converted_total_difference,
        'difference_in_percentage': converted_difference_in_percentage,
        'currency': currency,
        'currencies': currencies,
    })



@login_required
def wallet_asset_detail(request, wallet_id, asset_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)

    transactions_qs = WalletAsset.objects.filter(wallet=wallet, asset=asset)

    asset_total_purchase_value = transactions_qs.aggregate(
        total=Sum('purchase_price', output_field=DecimalField(max_digits=30, decimal_places=12))
    )['total'] or Decimal('0')

    total_quantity = transactions_qs.aggregate(
        total_qty=Sum('quantity', output_field=DecimalField(max_digits=30, decimal_places=12))
    )['total_qty'] or Decimal('0')

    try:
        base_price = Decimal(CurrentAsset.objects.get(symbol=asset.symbol).current_price)
    except CurrentAsset.DoesNotExist:
        base_price = Decimal('0')

    currency = request.GET.get('currency', 'usd').lower()
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'cad']
    try:
        currency_rate = Decimal(CurrentAsset.objects.get(symbol=currency).current_price)
    except CurrentAsset.DoesNotExist:
        currency_rate = Decimal('1')

    converted_unit_price = (base_price / currency_rate) if currency_rate != 0 else Decimal('0')

    total_current_value = (converted_unit_price * total_quantity)
    converted_total_purchase = (asset_total_purchase_value / currency_rate) if currency_rate != 0 else Decimal('0')

    total_difference = total_current_value - converted_total_purchase
    total_difference_percentage = (total_difference / converted_total_purchase * Decimal('100')) if converted_total_purchase > 0 else Decimal('0')

    transactions = []
    for tx in transactions_qs:
        transactions.append({
            'id': tx.id,
            'quantity': tx.quantity,
            'purchase_price': tx.purchase_price,
            'purchase_date': tx.purchase_date,
            'current_value': Decimal(tx.quantity) * converted_unit_price,
        })

    return render(request, 'core/wallet_asset_detail.html', {
        'wallet': wallet,
        'asset': asset,
        'transactions': transactions,
        'converted_unit_price': converted_unit_price,
        'asset_total_purchase_value': converted_total_purchase,
        'total_current_value': total_current_value,
        'total_difference': total_difference,
        'total_difference_percentage': total_difference_percentage,
        'currency': currency,
        'currencies': currencies,
        'total_quantity': total_quantity,
    })


# it shows all the assets in a wallet, basically it should not named 'add'
@login_required
def wallet_assets(request, wallet_id):
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


# user delete only one of the transaction, not whole the asset, one asset can have many transactions
@login_required
def delete_wallet_transaction(request, wallet_id, asset_id, transaction_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)
    asset = get_object_or_404(Asset, id=asset_id)
    transaction = get_object_or_404(WalletAsset, id=transaction_id, wallet=wallet, asset=asset)

    transaction.delete()
    messages.success(request, "transaction deleted successfully")

    return redirect('wallet_asset_detail', wallet_id=wallet.id, asset_id=asset.id)


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



# for a specific user that sends the request, it will returns all the goals that are setted
@login_required
def user_goals(request):
    goals = UserGoal.objects.filter(user=request.user)
    total_value = sum(
        wallet.quantity * CurrentAsset.objects.get(symbol=wallet.asset.symbol).current_price
        for wallet in WalletAsset.objects.filter(wallet__user=request.user)
    )
    return render(request, 'core/user_goals.html', {
        'goals': goals,
        'current_value': total_value
    })


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

        direction = "above" if alert.above else "below"
        reached = False  

        if current_price is not None:
            difference = round(alert.target_price - current_price, 2)

            if alert.above and current_price >= alert.target_price:
                reached = True
            elif not alert.above and current_price <= alert.target_price:
                reached = True
        else:
            difference = "no data"
            reached = None  

        alerts_with_diff.append({
            'alert': alert,
            'current_price': current_price,
            'difference': difference,
            'direction': direction,
            'reached': reached,
        })

    return render(request, 'core/my_alerts.html', {
        'alerts_with_diff': alerts_with_diff
    })



# function to share the wallet, by the id to the other user, from the user friend list
@login_required
def share_wallet(request, wallet_id):
    wallet = get_object_or_404(Wallet, id=wallet_id, user=request.user)

    friend_list, created = FriendList.objects.get_or_create(user=request.user)
    friends = friend_list.friends.all()

    if request.method == "POST":
        friend_id = request.POST.get('friend_id')
        friend_user = get_object_or_404(User, id=friend_id)

        SharedWallet.objects.get_or_create(wallet=wallet, shared_with=friend_user)
        messages.success(request, f'You shared the wallet with user: {friend_user.username}')
        return redirect('wallet_detail', wallet_id=wallet.id)

    return render(request, 'core/share_wallet.html', {
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


@login_required
def group_list(request):
    now = timezone.now()
    groups = Group.objects.all()

    for g in groups:
        # determine if group is in active purchase
        if g.start_time and g.purchase_end_time:
            g.is_purchase_active = g.start_time <= now <= g.purchase_end_time
            if now < g.start_time:
                g.purchase_status = f"Starts in {(g.start_time - now).days} days"
            elif now > g.purchase_end_time:
                g.purchase_status = "Purchasing closed"
            else:
                remaining = g.purchase_end_time - now
                hours = remaining.total_seconds() // 3600
                g.purchase_status = f"Ends in {int(hours)}h"
        else:
            g.is_purchase_active = False
            g.purchase_status = "No time info"

        # determine if group summary is due
        if g.summary_time:
            if now >= g.summary_time:
                g.is_summary_due = True
                g.summary_status = "Summary due now!"
            else:
                remaining = g.summary_time - now
                g.is_summary_due = False
                g.summary_status = f"Summary in {remaining.days} days"
        else:
            g.is_summary_due = False
            g.summary_status = "No summary scheduled"

        # Count members
        g.member_count = Membership.objects.filter(group=g).count()

    return render(request, 'core/group_list.html', {
        "groups": groups,
        "now": now
    })


# details of group and ladeboard
@login_required
def group_detail(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    members = Membership.objects.filter(group=group)
    assets = CurrentAsset.objects.all()
    membership = Membership.objects.filter(group=group, user=request.user).first()

    now = timezone.localtime()

    can_purchase = (
        group.start_time
        and group.purchase_end_time
        and (group.start_time <= now <= group.purchase_end_time)
    )

    if group.purchase_end_time:
        remaining = group.purchase_end_time - now
        if remaining.total_seconds() > 0:
            days = remaining.days
            hours, remainder = divmod(remaining.seconds, 3600)
            minutes, _ = divmod(remainder, 60)

            if days > 0:
                time_remaining = f"Ends in {days}d {hours}h {minutes}min"
            elif hours > 0:
                time_remaining = f"Ends in {hours}h {minutes}min"
            elif minutes > 0:
                time_remaining = f"Ends in {minutes} minutes"
            else:
                time_remaining = "Ending soon!"
        else:
            time_remaining = "Purchase period ended"
    else:
        time_remaining = "No purchase end time set"

    if group.summary_time:
        if now >= group.summary_time:
            summary_status = f"Summary available since {group.summary_time.strftime('%Y-%m-%d %H:%M')}"
        else:
            summary_status = f"Next summary at {group.summary_time.strftime('%Y-%m-%d %H:%M')}"
    else:
        summary_status = "No summary scheduled"

    user_total_value = Decimal(0)
    group_total_value = Decimal(0)
    user_purchases = []
    asset_prices = {a.symbol: a.current_price for a in CurrentAsset.objects.all()}

    use_live_prices = can_purchase

    for m in members:
        purchases = GroupAssetPurchase.objects.filter(membership=m)
        total_invested = Decimal(0)
        current_value = Decimal(0)

        for p in purchases:
            total_invested += p.quantity * p.price_at_purchase

            if use_live_prices and p.asset.symbol in asset_prices:
                price_now = asset_prices[p.asset.symbol]
            else:
                price_now = p.price_at_purchase

            current_value += p.quantity * price_now

            if membership and p.membership == membership:
                user_purchases.append({
                    "symbol": p.asset.symbol,
                    "quantity": p.quantity,
                    "buy_price": p.price_at_purchase,
                    "current_price": price_now,
                    "value_now": round(p.quantity * price_now, 2),
                    "difference": round((price_now - p.price_at_purchase) * p.quantity, 2),
                    "created_at": timezone.localtime(p.created_at),
                })

        m.total_invested = round(total_invested, 2)
        m.portfolio_value = round(current_value + m.balance, 2)
        group_total_value += current_value

        if membership and m == membership:
            user_total_value = round(current_value, 2)

    members = sorted(members, key=lambda x: x.portfolio_value, reverse=True)

    return render(request, 'core/group_detail.html', {
        "group": group,
        "members": members,
        "assets": assets,
        "membership": membership,
        "time_remaining": time_remaining,
        "can_purchase": can_purchase,
        "summary_status": summary_status,
        "user_total_value": user_total_value,
        "group_total_value": round(group_total_value, 2),
        "user_purchases": user_purchases,
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

    now = timezone.now()
    if not (group.start_time <= now <= group.purchase_end_time):
        messages.error(request, "Purchases are not allowed at this time!")
        return redirect("group_detail", group_id=group.id)


    if request.method == "POST":
        form = BuyAssetForm(request.POST)
        if form.is_valid():
            current_asset = form.cleaned_data["asset"]
            asset = get_object_or_404(Asset, symbol=current_asset.symbol)
            quantity = form.cleaned_data["quantity"]
            total_cost = Decimal(quantity) * current_asset.current_price

            if membership.balance < total_cost:
                messages.error(request, "Not enough balance in group account")
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

@login_required
def trends(request):
    user = request.user
    wallets = Wallet.objects.filter(user=user)
    wallet_assets = WalletAsset.objects.filter(wallet__in=wallets).select_related('asset')

    # total portfolio value
    asset_prices = {a.symbol: a.current_price for a in CurrentAsset.objects.all()}
    total_value = sum(
        wa.quantity * asset_prices.get(wa.asset.symbol, wa.purchase_price)
        for wa in wallet_assets
    )

    # Timeframes
    timeframes = ['day', 'week', 'month', 'year']

    # Top/Bottom assets
    trends_data = {}
    for tf in timeframes:
        records = AssetTrend.objects.filter(timeframe=tf)
        sorted_records = sorted(records, key=lambda x: x.change_pct, reverse=True)
        best = sorted_records[:5]
        worst = sorted_records[-5:][::-1]
        max_len = max(len(best), len(worst))
        paired = []
        for i in range(max_len):
            paired.append({
                'best': best[i] if i < len(best) else None,
                'worst': worst[i] if i < len(worst) else None
            })
        trends_data[tf] = paired

    # Average change by asset type 
    type_trends = {}
    asset_types = Asset.objects.values_list('type', flat=True).distinct()
    for atype in asset_types:
        type_trends[atype] = {}
        symbols_of_type = Asset.objects.filter(type=atype).values_list('symbol', flat=True)
        for tf in timeframes:
            records = AssetTrend.objects.filter(
                timeframe=tf,
                symbol__in=symbols_of_type
            )
            type_trends[atype][tf] = round(sum(r.change_pct for r in records)/len(records), 2) if records else None

    return render(request, "core/trends.html", {
        "total_value": total_value,
        "trends_data": trends_data,
        "type_trends": type_trends,
        "timeframes": timeframes,
    })
