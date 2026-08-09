# app/membership/serializers.py
from rest_framework import serializers
from .models import MembershipPlan, UserMembership
from django.utils.text import slugify

class MembershipPlanAdminSerializer(serializers.ModelSerializer):
    subscriber_count = serializers.SerializerMethodField()

    class Meta:
        model = MembershipPlan
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'duration_days',
            'features', 'is_highlighted', 'is_active', 'sort_order', 'subscriber_count',
        ]
        read_only_fields = ['id', 'subscriber_count']

    def get_subscriber_count(self, obj):
        return obj.usermembership_set.filter(is_active=True).count()

    def validate(self, attrs):
        duration = attrs.get('duration_days', getattr(self.instance, 'duration_days', None))
        price = attrs.get('price', getattr(self.instance, 'price', None))
        if not duration and price not in (0, None):
            raise serializers.ValidationError(
                "A plan with no duration_days is the Free tier and must have price = 0."
            )
        return attrs

    def create(self, validated_data):
        validated_data.setdefault('slug', slugify(validated_data['name']))
        return super().create(validated_data)

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