from django.contrib import admin
from core.models import FriendList, FriendRequest, Asset, UserGoal, PriceAlert,HistoricAsset, CurrentAsset, Wallet, WalletAsset, Group

# filter - how we can filter among the fields
# display - what is showed on a page
# search - by which field we can search
# readonly - means that this field is only to read(even admin cannot change it)
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

# thanks to the admin.site.register every model is showed in a admin panel
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(Asset)
admin.site.register(UserGoal)
admin.site.register(PriceAlert)
admin.site.register(HistoricAsset)
admin.site.register(CurrentAsset)
admin.site.register(Wallet)
admin.site.register(WalletAsset)
admin.site.register(Group)

