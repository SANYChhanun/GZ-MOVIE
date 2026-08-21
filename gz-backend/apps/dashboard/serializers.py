# apps/dashboard/serializers.py
from rest_framework import serializers
from .models import ActivityLog


class DashboardStatsSerializer(serializers.Serializer):
    """Aggregated statistics for the admin dashboard."""
    total_users = serializers.IntegerField()
    active_members = serializers.IntegerField()
    total_movies = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_activities = serializers.ListField(child=serializers.DictField())


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_email', 'user_username',
            'action', 'description', 'ip_address', 'created_at'
        ]
        read_only_fields = fields