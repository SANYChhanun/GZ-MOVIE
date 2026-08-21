# apps/payments/admin.py
from django.contrib import admin
from .models import Payment, WebhookLog


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'reference_id',
        'user',
        'amount',
        'currency',
        'payment_type',
        'status',
        'created_at',
        'completed_at'
    ]
    list_filter = ['status', 'payment_type', 'currency', 'created_at']
    search_fields = ['reference_id', 'user__username', 'user__email', 'transaction_hash']
    ordering = ['-created_at']
    list_select_related = ['user', 'membership_plan']
    raw_id_fields = ['user']
    
    readonly_fields = [
        'reference_id',
        'transaction_hash',
        'created_at',
        'updated_at',
        'completed_at'
    ]


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'event_type',      # ✅ ប្តូរពី payment ទៅ event_type
        'status',          # ✅ ប្តូរពី is_valid ទៅ status
        'created_at'       # ✅ ប្តូរពី received_at ទៅ created_at
    ]
    list_filter = [
        'event_type',      # ✅ ប្តូរពី is_valid ទៅ event_type
        'status'           # ✅ ប្តូរពី processed ទៅ status
    ]
    search_fields = ['event_type', 'payload']
    ordering = ['-created_at']
    
    readonly_fields = [
        'event_type',      # ✅ ប្តូរពី headers ទៅ event_type
        'payload',         # ✅ ប្តូរពី ip_address ទៅ payload
        'status',
        'created_at'
    ]