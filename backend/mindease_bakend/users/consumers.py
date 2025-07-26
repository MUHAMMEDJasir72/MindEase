from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connection attempt")
        await self.channel_layer.group_add("notifications", self.channel_name)
        await self.accept()
        print(f"WebSocket accepted and added to group: {self.channel_name}")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code {close_code}")
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def receive(self, text_data):
        print(f"Received message from client: {text_data}")
        data = json.loads(text_data)
        message = data.get("message", "")
        
        # Test message to broadcast
        print(f"Broadcasting message: {message}")  # Add this log
        await self.channel_layer.group_send(
            "notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": "New Notification",
                    "message": message,
                    "time": "",  # Optionally add the timestamp here
                    "type": "info"
                }
            }
        )

    async def send_notification(self, event):
        print(f"Sending notification: {event['message']}")  # Add this log
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
class TherapistNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connection attempt")
        await self.channel_layer.group_add("therapist_notifications", self.channel_name)
        await self.accept()
        print(f"WebSocket accepted and added to group: {self.channel_name}")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code {close_code}")
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def receive(self, text_data):
        print(f"Received message from client: {text_data}")
        data = json.loads(text_data)
        message = data.get("message", "")
        
        # Test message to broadcast
        print(f"Broadcasting message: {message}")  # Add this log
        await self.channel_layer.group_send(
            "notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": "New Notification",
                    "message": message,
                    "time": "",  # Optionally add the timestamp here
                    "type": "info"
                }
            }
        )

    async def send_notification(self, event):
        print(f"Sending notification: {event['message']}")  # Add this log
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))


class AdminNotificationConsumer(AsyncWebsocketConsumer): 
    async def connect(self):
        print("WebSocket connection attempt")
        await self.channel_layer.group_add("admin_notifications", self.channel_name)
        await self.accept()
        print(f"WebSocket accepted and added to group: {self.channel_name}")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code {close_code}")
        await self.channel_layer.group_discard("admin_notifications", self.channel_name)

    async def receive(self, text_data):
        print(f"Received message from client: {text_data}")
        data = json.loads(text_data)
        message = data.get("message", "")
        
        await self.channel_layer.group_send(
            "admin_notifications",
            {
                "type": "send_notification",
                "message": {
                    "title": "New Notification",
                    "message": message,
                    "time": datetime.now().isoformat(),
                    "type": "info"
                }
            }
        )

    async def send_notification(self, event):
        print(f"Sending notification: {event['message']}")
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))





# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Message
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

User = get_user_model()

from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Message, TherapistNotification
from channels.db import database_sync_to_async
import json
from django.core.files.base import ContentFile
import base64
import uuid

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Room name format: "userId-therapistId"
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join the WebSocket room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the WebSocket room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message, media=None, media_type=None):
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            
            # Create message with optional media
            message_obj = Message(
                sender=sender,
                receiver=receiver,
                text=message,
                media_type=media_type
            )
            
            if media:
                # Handle base64 encoded media or file path
                if isinstance(media, str) and media.startswith('data:'):
                    # Base64 encoded file
                    file_format, file_data = media.split(';base64,')
                    file_ext = file_format.split('/')[-1]
                    file_name = f"{uuid.uuid4()}.{file_ext}"
                    file_content = ContentFile(base64.b64decode(file_data), name=file_name)
                    message_obj.media.save(file_name, file_content)
                else:
                    # Assume it's a file path from the upload endpoint
                    message_obj.media = media
            
            message_obj.save()
            return message_obj
            
        except User.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            sender_id = data['sender']
            receiver_id = data['receiver']
            media = data.get('media', None)
            media_type = data.get('media_type', None)

            # Validate at least message or media is present
            if not message and not media:
                await self.send(text_data=json.dumps({
                    'error': 'Either message text or media is required'
                }))
                return

            # Save the new message to the database
            message_obj = await self.save_message(
                sender_id, 
                receiver_id, 
                message,
                media,
                media_type
            )
            
            if message_obj:
                # Prepare the message data to send
                message_data = {
                    'message': message,
                    'sender': sender_id,
                    'receiver': receiver_id,
                    'timestamp': message_obj.timestamp.isoformat(),
                }
                
                # Add media info if present
                if message_obj.media:
                    message_data['media'] = message_obj.media.url
                    message_data['media_type'] = message_obj.media_type
                
                # Send the message to the WebSocket group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        **message_data
                    }
                )
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid message format'
            }))
        except KeyError as e:
            await self.send(text_data=json.dumps({
                'error': f'Missing required field: {str(e)}'
            }))
        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'error': 'An error occurred while processing your message'
            }))

    async def chat_message(self, event):
        # Remove 'type' key before sending to the client
        message_data = {k: v for k, v in event.items() if k != 'type'}
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message_data))



from .models import AdminTherapistChat, UserDetails, AdminNotification  # make sure these imports are correct
from django.utils.timezone import now

class ChatAdminTherapistConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_id = data['sender']
        receiver_id = data['receiver']

        # Get current timestamp
        timestamp = now().isoformat()

        # Save message and create notification
        await self.save_message_and_notify(sender_id, receiver_id, message)

        # Broadcast to WebSocket group with timestamp
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_id,
                'receiver': receiver_id,
                'timestamp': timestamp,
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'receiver': event['receiver'],
            'timestamp': event['timestamp'],  
        }))


    @database_sync_to_async
    def save_message_and_notify(self, sender_id, receiver_id, message):
        sender = UserDetails.objects.get(id=sender_id)
        receiver = UserDetails.objects.get(id=receiver_id)

        # Save chat message
        AdminTherapistChat.objects.create(sender=sender, receiver=receiver, message=message)

        # Create a notification for the therapist (assuming therapist is the receiver)
        if receiver.role == 'therapist':
            TherapistNotification.objects.create(
                user=receiver,
                message=message,
                title="New Message from Admin",
                type="chat",
                location="/chatToAdmin"
            )
        else:
            AdminNotification.objects.create(
                user=receiver,
                message=message,
                title=f"New Message from {sender.therapist_details.fullname}",
                type="chat",
                location="/chatToTherapists"
            )

