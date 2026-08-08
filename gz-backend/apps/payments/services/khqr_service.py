import hashlib
import hmac
import json
import uuid
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class KHQRService:
    """
    Service to generate KHQR (Bakong) payment QR codes and verify webhooks.
    In production, integrate with the official Bakong API or partner bank API.
    For now, we simulate the flow with placeholders.
    """

    @staticmethod
    def generate_qr(amount, currency, reference_id, payment_type):
        """Generate a KHQR deep link / QR data for the given amount."""
        # In a real implementation:
        # - Call Bakong API: POST /v1/create_qr with merchant info, amount, currency, order_id
        # - Receive qr_code_string (deep link) or qr_image_base64
        # We'll return a simulated deep link string.
        merchant_id = getattr(settings, 'KHQR_MERCHANT_ID', 'GZ_MOVIE_MERCHANT')
        merchant_name = getattr(settings, 'KHQR_MERCHANT_NAME', 'GZ Web Movie')
        acquirer_id = getattr(settings, 'KHQR_ACQUIRER_ID', 'ABA')

        # Build a simple deep link (real format: "https://paybakong.com/xxx" or KHQR tag)
        # For simulation, we create a JSON string that the frontend can parse.
        qr_payload = {
            "merchant_id": merchant_id,
            "merchant_name": merchant_name,
            "amount": str(amount),
            "currency": currency,
            "order_id": reference_id,
            "payment_type": payment_type,
        }
        # Simulate returning a KHQR data string (actual spec is complex)
        qr_data = json.dumps(qr_payload)
        return qr_data

    @staticmethod
    def verify_webhook_signature(payload, headers):
        """
        Verify that the webhook request comes from the bank and hasn't been tampered.
        In a real setup, you'd validate HMAC signature with a shared secret.
        """
        # Placeholder: always return True for testing
        # In production:
        # received_signature = headers.get('X-Bakong-Signature')
        # secret = settings.KHQR_WEBHOOK_SECRET.encode()
        # expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        # return hmac.compare_digest(received_signature, expected)
        return True

    @staticmethod
    def verify_ip_address(ip):
        """
        Check if the webhook IP is from a trusted bank IP range.
        """
        # Placeholder: always return True for development
        # In production:
        # allowed_ips = getattr(settings, 'KHQR_ALLOWED_IPS', [])
        # return ip in allowed_ips
        return True