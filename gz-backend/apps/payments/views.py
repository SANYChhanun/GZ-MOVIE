# apps/payments/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from decimal import Decimal

from .models import Payment, WebhookLog
from .serializers import (
    CreatePaymentSerializer,
    PaymentSerializer,
    WebhookLogSerializer,
)


# ============================================================
# PUBLIC PAYMENT ENDPOINTS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Create a new payment.
    
    POST /api/payments/create/
    {
        "amount": 10.00,
        "currency": "USD",
        "payment_type": "topup" or "membership",
        "membership_plan_slug": "monthly" (optional, for membership)
    }
    """
    serializer = CreatePaymentSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    try:
        # បង្កើត payment record
        payment = Payment.objects.create(
            user=request.user,
            amount=data['amount'],
            currency=data.get('currency', 'USD'),
            payment_type=data['payment_type'],
            membership_plan_slug=data.get('membership_plan_slug'),
            status='pending',
        )
        
        # TODO: ហៅ KHQR service ដើម្បីបង្កើត QR code
        # from .services.khqr_service import KHQRService
        # qr_data = KHQRService.generate_qr(payment)
        # payment.qr_code_data = qr_data
        # payment.save()
        
        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request, reference_id):
    """
    Check payment status.
    
    GET /api/payments/status/{reference_id}/
    """
    try:
        payment = Payment.objects.get(reference_id=reference_id, user=request.user)
        return Response(PaymentSerializer(payment).data)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def webhook_handler(request):
    """
    Handle payment webhook from ABA/Bakong.
    
    POST /api/payments/webhook/
    """
    try:
        # TODO: ផ្ទៀងផ្ទាត់ webhook signature
        # from .services.webhook_handler import WebhookHandler
        # handler = WebhookHandler()
        # result = handler.process(request.data)
        
        # សម្រាប់ពេលនេះ គ្រាន់តែ log ទិន្នន័យ
        WebhookLog.objects.create(
            event_type=request.data.get('event_type', 'unknown'),
            payload=request.data,
            status='received',
        )
        
        return Response(
            {'message': 'Webhook received'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# ADMIN PAYMENT ENDPOINTS
# ============================================================

class PaymentAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin viewset for viewing all payments.
    Read-only - payments shouldn't be modified manually.
    
    GET /api/payments/admin/              → List all payments
    GET /api/payments/admin/{id}/         → Payment detail
    GET /api/payments/admin/summary/      → Payment summary
    """
    queryset = Payment.objects.select_related('user', 'membership_plan').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_type', 'currency']
    search_fields = ['reference_id', 'user__username', 'user__email', 'transaction_hash']
    ordering_fields = ['created_at', 'amount', 'status']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """ទាញយកស្ថិតិសង្ខេបសម្រាប់ dashboard"""
        from django.db.models import Sum, Count
        
        total_amount = Payment.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0')
        
        today_amount = Payment.objects.filter(
            created_at__date=timezone.now().date(),
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        return Response({
            'total_payments': Payment.objects.count(),
            'total_amount': float(total_amount),
            'today_payments': Payment.objects.filter(
                created_at__date=timezone.now().date()
            ).count(),
            'today_amount': float(today_amount),
            'pending_payments': Payment.objects.filter(status='pending').count(),
            'status_breakdown': Payment.objects.values('status').annotate(
                count=Count('id')
            ),
        })


class WebhookLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View webhook logs for debugging payment issues.
    
    GET /api/payments/webhook-logs/ → List webhook logs
    """
    queryset = WebhookLog.objects.all()
    serializer_class = WebhookLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'status']
    search_fields = ['payload']
    ordering_fields = ['created_at']
    ordering = ['-created_at']