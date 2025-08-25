from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import TierPriceConfig

@receiver(post_migrate)
def create_default_tier_config(sender, **kwargs):
    print('working', sender.name)
    if sender.name == "admins":  # replace with your app name
        if not TierPriceConfig.objects.exists():
            TierPriceConfig.objects.create()
