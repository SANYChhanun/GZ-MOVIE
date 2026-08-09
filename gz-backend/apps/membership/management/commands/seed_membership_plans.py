# app/membership/management/commands/seed_membership_plans.py
from django.core.management.base import BaseCommand
from apps.membership.models import MembershipPlan

PLANS = [
    dict(name='Free', slug='free', price=0, duration_days=None, sort_order=0,
         description='Watch free titles only.',
         features=['Free-tagged movies only', 'Ads supported', '1 device']),
    dict(name='2 Week', slug='2-week', price=2.99, duration_days=14, sort_order=1,
         description='Short-term VIP access.',
         features=['Member-tagged movies', 'No ads', '2 devices']),
    dict(name='1 Month', slug='1-month', price=4.99, duration_days=30, sort_order=2,
         is_highlighted=True, description='Our most popular plan.',
         features=['Member-tagged movies', 'No ads', '2 devices', 'HD streaming']),
    dict(name='3 Month', slug='3-month', price=12.99, duration_days=90, sort_order=3,
         description='Best value for regular viewers.',
         features=['Member-tagged movies', 'No ads', '4 devices', 'HD streaming']),
]


class Command(BaseCommand):
    help = 'Seed/update the core membership plans.'

    def handle(self, *args, **kwargs):
        for data in PLANS:
            plan, created = MembershipPlan.objects.update_or_create(slug=data['slug'], defaults=data)
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {plan.name}"))