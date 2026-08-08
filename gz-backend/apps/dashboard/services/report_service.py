import os
import tempfile
from datetime import datetime
from django.conf import settings
from django.db.models import Sum, Count
from django.contrib.auth import get_user_model
from apps.movies.models import Movie
from apps.payments.models import Payment
from apps.membership.models import UserMembership

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
            'generated_at': datetime.utcnow().isoformat(),
        }
        if report_type == 'revenue':
            payments = Payment.objects.filter(status='completed')
            data['total_revenue'] = payments.aggregate(total=Sum('amount'))['total'] or 0
            data['payment_count'] = payments.count()
        elif report_type == 'users':
            data['total_users'] = User.objects.count()
            data['active_members'] = UserMembership.objects.filter(
                is_active=True, expires_at__gt=datetime.utcnow()
            ).count()
        elif report_type == 'movies':
            movies = Movie.objects.annotate(view_count=Count('stream_sessions'))
            data['total_movies'] = movies.count()
            data['top_10'] = list(
                movies.order_by('-view_count')[:10].values('title', 'view_count')
            )
        return data

    def generate_pdf_report(self, report_type):
        """
        Generates a PDF report file and returns the file path.
        TODO: Integrate with ReportLab or WeasyPrint for real PDF output.
        """
        data = self._gather_data(report_type)
        # Placeholder: create an empty temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            tmp.write(f'Report {report_type} - {data}'.encode('utf-8'))
            return tmp.name

    def generate_excel_report(self, report_type):
        """
        Generates an Excel report file and returns the file path.
        TODO: Integrate with openpyxl or XlsxWriter.
        """
        data = self._gather_data(report_type)
        # Placeholder: create an empty temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            tmp.write(f'Report {report_type} - {data}'.encode('utf-8'))
            return tmp.name