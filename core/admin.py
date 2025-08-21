from django.contrib import admin

# Register your models here.
from core.models import FriendList, FriendRequest, Asset, UserGoal, PriceAlert,HistoricAsset, CurrentAsset, Wallet, WalletAsset

class FriendListAdmin(admin.ModelAdmin):
    list_filter = ['user']
    list_display = ['user']
    search_fields = ['user']
    readonly_fields = ['user']

    class Meta:
        model = FriendList


class FriendRequestAdmin(admin.ModelAdmin):
    list_filter = ['sender', 'receiver']
    list_display = ['sender', 'receiver']
    search_fields = ['sender__username', 'sender__email' 'receiver__username', 'receiver_email']

    class Meta:
        model = FriendRequest
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(Asset)
admin.site.register(UserGoal)
admin.site.register(PriceAlert)
admin.site.register(HistoricAsset)
admin.site.register(CurrentAsset)
admin.site.register(Wallet)
admin.site.register(WalletAsset)

