from rest_framework import serializers
from .models import MembershipPlan, UserMembership


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = ['id', 'name', 'slug', 'description', 'price', 'duration_days', 'features', 'is_active']


class UserMembershipSerializer(serializers.ModelSerializer):
    plan = MembershipPlanSerializer(read_only=True)
    plan_slug = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=MembershipPlan.objects.filter(is_active=True),
        write_only=True,
        required=True
    )

    class Meta:
        model = UserMembership
        fields = ['id', 'plan', 'plan_slug', 'start_date', 'expires_at', 'is_active', 'auto_renew']
        read_only_fields = ['id', 'start_date', 'expires_at', 'is_active']

    def validate_plan_slug(self, value):
        if not MembershipPlan.objects.filter(slug=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive plan.")
        return value


class SubscribeSerializer(serializers.Serializer):
    plan_slug = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=MembershipPlan.objects.filter(is_active=True),
        required=True
    )
    # In a real flow, we might include a payment_token or reference to a completed payment.
    # For simplicity, we assume the payment was already verified and we just record the membership.
    auto_renew = serializers.BooleanField(default=False)