# apps/accounts/services/otp_service.py
import random
import string
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import OTPCode


class OTPService:
    """Service for OTP generation and verification"""
    
    OTP_EXPIRY_MINUTES = 10
    
    @staticmethod
    def generate_otp(user, purpose):
        """
        Generate OTP for user.
        
        Returns:
            str: OTP code
        """
        # Deactivate old OTPs
        OTPCode.objects.filter(
            user=user,
            purpose=purpose,
            is_used=False
        ).update(is_used=True)
        
        # Generate 6-digit OTP
        code = ''.join(random.choices(string.digits, k=6))
        
        # Save OTP
        OTPCode.objects.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
        )
        
        return code
    
    @staticmethod
    def verify_otp(user, code, purpose):
        """
        Verify OTP code.
        
        Returns:
            tuple: (success, error) - True if valid, False if invalid
        """
        try:
            otp = OTPCode.objects.get(
                user=user,
                code=code,
                purpose=purpose,
                is_used=False
            )
            
            if not otp.is_valid:
                return False, "OTP has expired"
            
            # Mark OTP as used
            otp.mark_used()
            
            return True, None
            
        except OTPCode.DoesNotExist:
            return False, "Invalid OTP code"
    
    @staticmethod
    def send_otp_email(user, code):
        """Send OTP via email"""
        # TODO: Implement email sending
        pass
    
    @staticmethod
    def send_otp_sms(user, code):
        """Send OTP via SMS"""
        # TODO: Implement SMS sending
        pass