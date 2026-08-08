import logging
from django.utils import timezone
from django.db import transaction as db_transaction
from apps.payments.models import Payment, WebhookLog
from apps.wallet.services.wallet_service import WalletService
from apps.membership.services.membership_service import MembershipService

logger = logging.getLogger(__name__)


class WebhookHandler:
    @staticmethod
    def process_webhook(payload, headers, ip):
        """
        Validate and process a Bakong payment webhook.
        Steps:
        1. Log the webhook.
        2. Verify signature and IP (if needed).
        3. Extract order reference and transaction details.
        4. Update Payment record and execute business logic (credit wallet / activate membership).
        """
        # Step 1: Log everything
        webhook_log = WebhookLog.objects.create(
            payload=payload,
            headers=headers,
            ip_address=ip,
            is_valid=False,  # will be set after validation
        )

        # Step 2: Validate signature (skipped in mock)
        from .khqr_service import KHQRService
        is_valid = KHQRService.verify_webhook_signature(payload, headers)
        is_ip_valid = KHQRService.verify_ip_address(ip)
        if not is_valid or not is_ip_valid:
            webhook_log.is_valid = False
            webhook_log.error_message = "Signature or IP invalid"
            webhook_log.save()
            return False

        webhook_log.is_valid = True
        webhook_log.save()

        # Step 3: Parse payload (expect JSON)
        try:
            # In a real scenario, the bank sends a JSON with transaction details.
            # Here we assume payload contains at least 'order_id' and 'status'
            data = payload
            order_id = data.get('order_id')
            status = data.get('status')  # 'COMPLETED' or 'FAILED'
            tx_hash = data.get('transaction_hash', '')
            bakong_tx_id = data.get('bakong_transaction_id', '')
        except Exception as e:
            webhook_log.error_message = f"Payload parse error: {str(e)}"
            webhook_log.save()
            return False

        # Step 4: Find the Payment record
        try:
            payment = Payment.objects.select_for_update().get(reference_id=order_id)
        except Payment.DoesNotExist:
            webhook_log.error_message = f"Payment with reference {order_id} not found"
            webhook_log.save()
            return False

        # Check for duplicate processing
        if payment.status == 'completed':
            webhook_log.processed = True
            webhook_log.save()
            return True

        if status != 'COMPLETED':
            payment.status = 'failed'
            payment.save()
            webhook_log.processed = True
            webhook_log.save()
            return True

        # Update payment and process business logic
        try:
            with db_transaction.atomic():
                payment.status = 'completed'
                payment.transaction_hash = tx_hash
                payment.bakong_transaction_id = bakong_tx_id
                payment.completed_at = timezone.now()
                payment.save()

                # Execute payment-specific logic
                if payment.payment_type == 'topup':
                    # Credit wallet
                    WalletService.credit_wallet(payment.user, payment.amount)
                elif payment.payment_type == 'membership' and payment.membership_plan:
                    # Activate membership
                    MembershipService.activate_membership(
                        user=payment.user,
                        plan=payment.membership_plan,
                    )
                # Could also log activity
                webhook_log.processed = True
                webhook_log.save()
                return True
        except Exception as e:
            logger.exception("Failed to process payment webhook")
            webhook_log.error_message = str(e)
            webhook_log.save()
            # Possibly revert status if critical, but we'll just log for now.
            return False