from django.contrib import admin
from .models import Payment, WebhookLog

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference_id', 'user', 'amount', 'payment_type', 'status', 'created_at']
    list_filter = ['status', 'payment_type']
    search_fields = ['reference_id', 'user__email']
    readonly_fields = ['reference_id', 'qr_code_data', 'transaction_hash', 'completed_at']


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'is_valid', 'processed', 'received_at']
    list_filter = ['is_valid', 'processed']
    readonly_fields = ['payload', 'headers', 'ip_address']