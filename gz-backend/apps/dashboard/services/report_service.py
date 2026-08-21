# apps/dashboard/services/report_service.py
import os
import tempfile
from datetime import datetime
from django.conf import settings
from django.db.models import Sum, Count
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.movies.models import Movie
from apps.payments.models import Payment

User = get_user_model()


class ReportService:
    """
    Service to generate analytical reports as PDF or Excel.
    Placeholder implementation – production code would use libraries like
    ReportLab (PDF) or openpyxl/XlsxWriter (Excel).
    """

    def _gather_data(self, report_type):
        """Collect data for the given report type."""
        data = {
            'generated_at': timezone.now().isoformat(),  # ✅ ប្រើ timezone.now()
        }
        
        if report_type == 'revenue':
            payments = Payment.objects.filter(status='completed')
            data['total_revenue'] = float(
                payments.aggregate(total=Sum('amount'))['total'] or 0
            )
            data['payment_count'] = payments.count()
            
            # ចំណូលតាមខែ
            monthly_revenue = payments.filter(
                completed_at__isnull=False
            ).extra(
                select={'month': "strftime('%%Y-%%m', completed_at)"}
            ).values('month').annotate(
                total=Sum('amount')
            ).order_by('month')
            
            data['monthly_revenue'] = list(monthly_revenue)
            
        elif report_type == 'users':
            data['total_users'] = User.objects.count()
            
            # សមាជិក VIP សកម្ម
            data['active_members'] = User.objects.filter(
                subscriptions__is_active=True,
                subscriptions__expires_at__gt=timezone.now()
            ).distinct().count()
            
            # អ្នកប្រើថ្មីថ្ងៃនេះ
            data['new_users_today'] = User.objects.filter(
                created_at__date=timezone.now().date()
            ).count()
            
            # អ្នកប្រើសរុបតាមខែ
            monthly_users = User.objects.extra(
                select={'month': "strftime('%%Y-%%m', created_at)"}
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')
            
            data['monthly_users'] = list(monthly_users)
            
        elif report_type == 'movies':
            # ✅ ប្រើ view_count ដោយផ្ទាល់ មិនមែន stream_sessions
            movies = Movie.objects.filter(is_active=True)
            data['total_movies'] = movies.count()
            
            # រឿងពេញនិយមបំផុត
            top_10 = movies.order_by('-view_count')[:10]
            data['top_10'] = [
                {
                    'title': movie.title,
                    'view_count': movie.view_count,
                }
                for movie in top_10
            ]
            
            # រឿងតាមប្រភេទ
            movies_by_genre = Movie.objects.filter(
                is_active=True
            ).values('genres__name').annotate(
                count=Count('id')
            ).order_by('-count')
            
            data['movies_by_genre'] = list(movies_by_genre)
            
        elif report_type == 'summary':
            # របាយការណ៍សង្ខេបទាំងអស់
            data.update({
                'total_users': User.objects.count(),
                'total_movies': Movie.objects.filter(is_active=True).count(),
                'total_revenue': float(
                    Payment.objects.filter(status='completed').aggregate(
                        total=Sum('amount')
                    )['total'] or 0
                ),
                'active_members': User.objects.filter(
                    subscriptions__is_active=True,
                    subscriptions__expires_at__gt=timezone.now()
                ).distinct().count(),
            })
        
        return data

    def generate_pdf_report(self, report_type):
        """
        Generates a PDF report file and returns the file path.
        TODO: Integrate with ReportLab or WeasyPrint for real PDF output.
        """
        data = self._gather_data(report_type)
        
        # សម្រាប់ពេលនេះ បង្កើតឯកសារសាមញ្ញ
        report_content = self._format_report_content(report_type, data)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            tmp.write(report_content.encode('utf-8'))
            return tmp.name

    def generate_excel_report(self, report_type):
        """
        Generates an Excel report file and returns the file path.
        TODO: Integrate with openpyxl or XlsxWriter.
        """
        data = self._gather_data(report_type)
        
        # សម្រាប់ពេលនេះ បង្កើតឯកសារសាមញ្ញ
        report_content = self._format_report_content(report_type, data)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            tmp.write(report_content.encode('utf-8'))
            return tmp.name
    
    def _format_report_content(self, report_type, data):
        """Format report content as readable text."""
        lines = [
            f"GZ Movie - {report_type.upper()} Report",
            f"Generated at: {data['generated_at']}",
            "=" * 50,
        ]
        
        for key, value in data.items():
            if key != 'generated_at':
                lines.append(f"{key}: {value}")
        
        return "\n".join(lines)