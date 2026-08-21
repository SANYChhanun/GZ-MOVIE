# apps/dashboard/urls.py
from django.urls import path
from .views import (
    DashboardStatsView, 
    RevenueReportView, 
    ActivityLogView,
    GenerateReportView,  # ✅ បន្ថែម
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('revenue/', RevenueReportView.as_view(), name='dashboard-revenue'),
    path('activities/', ActivityLogView.as_view(), name='dashboard-activities'),
    path('report/<str:report_type>/', GenerateReportView.as_view(), name='generate-report'),  # ✅ បន្ថែម
]