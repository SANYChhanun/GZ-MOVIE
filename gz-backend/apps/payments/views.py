import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction as db_transaction
from .models import Payment, WebhookLog
from .serializers import CreatePaymentSerializer, PaymentSerializer
from .services.khqr_service import KHQRService
from .services.webhook_handler import WebhookHandler

from apps.membership.models import MembershipPlan


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = request.user

        # Generate unique reference
        reference_id = f"GZ-{uuid.uuid4().hex[:12].upper()}"

        # If membership, fetch the plan
        plan = None
        if data['payment_type'] == 'membership':
            try:
                plan = MembershipPlan.objects.get(slug=data['membership_plan_slug'], is_active=True)
            except MembershipPlan.DoesNotExist:
                return Response({'error': 'Membership plan not found'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Payment record
        payment = Payment.objects.create(
            user=user,
            amount=data['amount'],
            currency=data['currency'],
            reference_id=reference_id,
            payment_type=data['payment_type'],
            membership_plan=plan,
            status='pending',
        )

        # Generate KHQR data for this payment
        qr_data = KHQRService.generate_qr(
            amount=data['amount'],
            currency=data['currency'],
            reference_id=reference_id,
            payment_type=data['payment_type'],
        )
        payment.qr_code_data = qr_data
        payment.save()

        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentWebhookView(APIView):
    permission_classes = [AllowAny]  # Webhooks are unauthenticated; verified by IP/signature

    def post(self, request):
        payload = request.data
        headers = dict(request.headers)
        ip = request.META.get('REMOTE_ADDR')

        success = WebhookHandler.process_webhook(payload, headers, ip)
        if success:
            return Response({'message': 'Webhook processed'}, status=status.HTTP_200_OK)
        else:
            # Log already saved; return 400 to indicate failure
            return Response({'message': 'Webhook processing failed'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, reference_id):
        try:
            payment = Payment.objects.get(reference_id=reference_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)