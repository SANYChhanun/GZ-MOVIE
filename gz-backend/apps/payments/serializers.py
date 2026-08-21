# apps/payments/serializers.py
from decimal import Decimal
from rest_framework import serializers
from .models import Payment, WebhookLog


class CreatePaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        min_value=Decimal('0.01')  # ✅ ប្រើ Decimal ជំនួស float
    )
    currency = serializers.CharField(default='USD', max_length=3)
    payment_type = serializers.ChoiceField(choices=['topup', 'membership'])
    membership_plan_slug = serializers.SlugField(required=False, allow_null=True)

    def validate(self, data):
        if data['payment_type'] == 'membership' and not data.get('membership_plan_slug'):
            raise serializers.ValidationError(
                "membership_plan_slug is required for membership payment"
            )
        return data


class PaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    membership_plan_name = serializers.CharField(
        source='membership_plan.name', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_email', 'user_username',
            'amount', 'currency', 'reference_id',
            'payment_type', 'membership_plan', 'membership_plan_name',
            'status', 'qr_code_data', 'transaction_hash',
            'created_at', 'completed_at'
        ]
        read_only_fields = fields


class WebhookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookLog
        fields = '__all__'
        read_only_fields = fields