from django.urls import path
from . import views

urlpatterns = [
    path('', views.PurchaseListView.as_view(), name='purchase-list'),
    path('create/', views.PurchaseCreateView.as_view(), name='purchase-create'),
    path('<int:pk>/', views.PurchaseDetailView.as_view(), name='purchase-detail'),
    path('check/', views.AccessCheckView.as_view(), name='purchase-check'),
]