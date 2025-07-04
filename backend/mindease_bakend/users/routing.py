# users/routing.py

from django.urls import re_path
from .consumers import NotificationConsumer,ChatAdminTherapistConsumer,TherapistNotificationConsumer, AdminNotificationConsumer
from . import consumers


websocket_urlpatterns = [
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<room_name>[^/]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/chatAdminTherapist/(?P<room_name>[^/]+)/$', ChatAdminTherapistConsumer.as_asgi()),
    re_path(r'ws/therapist/notifications/$', TherapistNotificationConsumer.as_asgi()),
    re_path(r'ws/admin/notifications/$', AdminNotificationConsumer.as_asgi()),
]
