"""
URL configuration for asset_tracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
    path('trends/', views.trends, name='trends'),

]
