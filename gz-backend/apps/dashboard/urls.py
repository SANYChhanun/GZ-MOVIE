from django.urls import path
from . import views

urlpatterns = [
    path('', views.DashboardView.as_view(), name='admin-dashboard'),
    path('export/', views.ReportExportView.as_view(), name='admin-report-export'),
]