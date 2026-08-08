from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from apps.movies.models import Movie
from apps.payments.models import Payment
from apps.membership.models import UserMembership
from apps.wallet.models import WalletTransaction
from .models import ActivityLog
from .serializers import DashboardStatsSerializer
from .permissions import IsDashboardAdmin
from .services.report_service import ReportService

# inside DashboardView.get()
from apps.streaming.models import StreamSession
active_streams = StreamSession.objects.filter(ended_at__isnull=True).count()

User = get_user_model()


class DashboardView(APIView):
    permission_classes = [IsDashboardAdmin]

    def get(self, request):
        """
        Returns key metrics: total users, active members, total movies,
        total revenue, and recent activity logs.
        """
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # Basic counts
        total_users = User.objects.count()
        active_members = UserMembership.objects.filter(
            is_active=True, expires_at__gt=timezone.now()
        ).count()
        total_movies = Movie.objects.count()

        # Revenue: successful payments in the last 30 days
        total_revenue = Payment.objects.filter(
            status='completed',
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Recent activity logs (latest 20)
        recent_activities = ActivityLog.objects.select_related('user')[:20]
        recent_activity_data = [
            {
                'user': log.user.email if log.user else 'Anonymous',
                'action': log.action,
                'description': log.description,
                'timestamp': log.timestamp.isoformat(),
            }
            for log in recent_activities
        ]

        stats = {
            'total_users': total_users,
            'active_members': active_members,
            'total_movies': total_movies,
            'total_revenue': total_revenue,
            'recent_activities': recent_activity_data,
        }
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class ReportExportView(APIView):
    permission_classes = [IsDashboardAdmin]

    def get(self, request, format=None):
        """
        Generate and return a PDF/Excel report.
        Query params: ?format=pdf|excel&type=revenue|users|movies
        """
        report_format = request.query_params.get('format', 'pdf').lower()
        report_type = request.query_params.get('type', 'revenue')

        service = ReportService()

        if report_format == 'excel':
            file_path = service.generate_excel_report(report_type)
            # In a real implementation, return a streaming FileResponse
            return Response(
                {'detail': f'Excel report generated: {file_path}'},
                status=status.HTTP_200_OK
            )
        else:
            # Default PDF
            file_path = service.generate_pdf_report(report_type)
            return Response(
                {'detail': f'PDF report generated: {file_path}'},
                status=status.HTTP_200_OK
            )