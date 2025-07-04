# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Wallet, UserDetails, TherapistNotification, AdminNotification

@receiver(post_save, sender=Notification)
def send_notification_on_save(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": instance.title,
                    "message": instance.message,
                    "time": instance.time.isoformat(),
                    "type": instance.type,
                },
            }, 
        )

@receiver(post_save, sender=UserDetails)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)

@receiver(post_save, sender=TherapistNotification)
def send_notification_on_save(sender, instance, created, **kwargs):
    print('📤 Signal triggered')  # <== Add this
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "therapist_notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": instance.title,
                    "message": instance.message,
                    "time": instance.time.isoformat(),
                    "type": instance.type,
                },
            },
        )


@receiver(post_save, sender=AdminNotification)
def send_notification_on_save(sender, instance, created, **kwargs):
    print('📤 Signal triggered')
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "admin_notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": instance.title,
                    "message": instance.message,
                    "time": instance.time.isoformat(),
                    "type": instance.type,
                },
            },
        )
