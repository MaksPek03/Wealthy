from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from core import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('api/login/', views.api_login, name='api_login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),
    path('api/register/', views.api_register, name='api_register'),
    path('', views.home, name='home'),
    path('accounts/profile/', views.profile, name='profile'),
    path('accounts/profile/wallets/', views.wallets, name='wallet_list'),
    path('accounts/profile/wallets/add_wallet', views.add_wallet, name='add_wallet'),
    path('accounts/profile/wallets/<int:wallet_id>/', views.wallet_detail, name='wallet_detail'),
    path('accounts/profile/wallets/<int:wallet_id>/add_wallet_asset/', views.add_wallet_asset, name='add_wallet_asset'),
    path('account/profile/wallets/<int:wallet_id>/add_wallet_asset/<int:asset_id>/', views.add_wallet_asset_details, name='add_wallet_asset_details'),
    path('accounts/profile/wallets/remove_wallet/<int:wallet_id>/', views.remove_wallet, name='remove_wallet'),
    path('price/', views.price, name='price'),
    path('api/price/', views.api_price, name='api_price'),
    path('assets/', views.asset_list, name='asset_list'),
    path('asset/<str:symbol>/history/', views.asset_history, name='historic_price'),
    path('trends/', views.trends, name='trends'),
]
