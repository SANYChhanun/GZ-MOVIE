# apps/dashboard/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services.report_service import ReportService

from .serializers import ActivityLogSerializer
from .models import ActivityLog


class DashboardStatsView(APIView):
    """Dashboard statistics for admin"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            from apps.accounts.models import User
            from apps.movies.models import Movie
            from apps.payments.models import Payment
            
            total_users = User.objects.count()
            total_movies = Movie.objects.count()
            total_payments = Payment.objects.count()
            
            total_revenue = Payment.objects.filter(
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            active_members = User.objects.filter(
                subscriptions__is_active=True,
                subscriptions__expires_at__gt=timezone.now()
            ).distinct().count()
            
            recent_activities = ActivityLog.objects.all()[:10]
            activities_data = ActivityLogSerializer(recent_activities, many=True).data
            
            return Response({
                'total_users': total_users,
                'active_members': active_members,
                'total_movies': total_movies,
                'total_revenue': float(total_revenue),
                'recent_activities': activities_data,
            })
            
        except Exception as e:
            print(f"Dashboard error: {e}")
            return Response({
                'total_users': 0,
                'active_members': 0,
                'total_movies': 0,
                'total_revenue': 0,
                'recent_activities': [],
            })


class RevenueReportView(APIView):
    """Revenue report for admin"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        from apps.payments.models import Payment
        from django.db.models.functions import TruncDate
        
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        daily_revenue = Payment.objects.filter(
            status='completed',
            completed_at__gte=seven_days_ago
        ).annotate(
            date=TruncDate('completed_at')
        ).values('date').annotate(
            total=Sum('amount')
        ).order_by('date')
        
        return Response({
            'daily_revenue': list(daily_revenue),
        })


class ActivityLogView(APIView):
    """Recent activities for admin"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        activities = ActivityLog.objects.all()[:20]
        serializer = ActivityLogSerializer(activities, many=True)
        return Response({
            'activities': serializer.data,
        })

class GenerateReportView(APIView):
    """Generate report for admin"""
    permission_classes = [AllowAny]
    
    def get(self, request, report_type):
        service = ReportService()
        format_type = request.query_params.get('format', 'excel')
        
        try:
            if format_type == 'pdf':
                file_path = service.generate_pdf_report(report_type)
            else:
                file_path = service.generate_excel_report(report_type)
            
            return Response({
                'message': f'Report generated successfully',
                'file_path': file_path,
                'report_type': report_type,
                'format': format_type,
            })
        except Exception as e:
            return Response({
                'error': str(e),
            }, status=400)