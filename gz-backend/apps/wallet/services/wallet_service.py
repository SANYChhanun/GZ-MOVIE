from decimal import Decimal
from django.db import transaction as db_transaction
from django.core.exceptions import ValidationError
from apps.wallet.models import Wallet, WalletTransaction


class InsufficientBalanceError(Exception):
    pass


class WalletService:
    @staticmethod
    def get_or_create_wallet(user):
        """Return the user's wallet, creating one if it doesn't exist."""
        wallet, _ = Wallet.objects.get_or_create(user=user)
        return wallet

    @staticmethod
    def get_balance(user):
        wallet = WalletService.get_or_create_wallet(user)
        return wallet.balance

    @staticmethod
    def credit_wallet(user, amount, description="Top‑up", payment_reference=None, related_payment=None):
        """Add funds to the wallet."""
        amount = Decimal(str(amount))
        with db_transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(user=user)
            wallet.balance += amount
            wallet.save()
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                transaction_type='credit',
                description=description,
                payment_reference=payment_reference,
                related_payment=related_payment
            )
        return wallet

    @staticmethod
    def debit_wallet(user, amount, description, payment_reference=None, related_payment=None):
        """Remove funds (e.g., for a purchase). Raises InsufficientBalanceError if not enough."""
        amount = Decimal(str(amount))
        with db_transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(user=user)
            if wallet.balance < amount:
                raise InsufficientBalanceError(f"Insufficient balance (need ${amount}, have ${wallet.balance})")
            wallet.balance -= amount
            wallet.save()
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                transaction_type='debit',
                description=description,
                payment_reference=payment_reference,
                related_payment=related_payment
            )
        return wallet

    @staticmethod
    def transfer(user_from, user_to, amount, description="Transfer"):
        """Move funds between two users (admin / internal use)."""
        WalletService.debit_wallet(user_from, amount, f"Transfer to {user_to.email}: {description}")
        WalletService.credit_wallet(user_to, amount, f"Transfer from {user_from.email}: {description}")