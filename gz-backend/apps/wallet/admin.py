from django.contrib import admin
from .models import Wallet, WalletTransaction

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['balance', 'created_at', 'updated_at']

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'wallet', 'amount', 'transaction_type', 'description', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['wallet__user__email', 'description', 'payment_reference']
    readonly_fields = ['wallet', 'amount', 'transaction_type', 'created_at']