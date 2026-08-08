import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """Example validator for Cambodian phone numbers (starts with 0, 9 digits)."""
    pattern = r'^0\d{8,9}$'
    if not re.match(pattern, value):
        raise ValidationError(_('Enter a valid phone number (e.g., 012345678).'))


def validate_password_strength(value):
    """Ensure password has at least 8 chars, one digit, one letter."""
    if len(value) < 8:
        raise ValidationError(_('Password must be at least 8 characters long.'))
    if not re.search(r'[A-Za-z]', value):
        raise ValidationError(_('Password must contain at least one letter.'))
    if not re.search(r'[0-9]', value):
        raise ValidationError(_('Password must contain at least one digit.'))