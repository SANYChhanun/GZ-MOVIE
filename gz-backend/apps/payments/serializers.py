from rest_framework import serializers
from .models import Payment, WebhookLog


class CreatePaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    currency = serializers.CharField(default='USD', max_length=3)
    payment_type = serializers.ChoiceField(choices=['topup', 'membership'])
    membership_plan_slug = serializers.SlugField(required=False, allow_null=True)

    def validate(self, data):
        if data['payment_type'] == 'membership' and not data.get('membership_plan_slug'):
            raise serializers.ValidationError("membership_plan_slug is required for membership payment")
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'amount', 'currency', 'reference_id',
            'payment_type', 'membership_plan', 'status',
            'qr_code_data', 'transaction_hash', 'created_at', 'completed_at'
        ]
        read_only_fields = fields


class WebhookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookLog
        fields = '__all__'
        read_only_fields = fields