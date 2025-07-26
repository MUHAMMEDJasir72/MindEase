from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import timedelta
from django.utils.timezone import now
from therapist.models import AvailableDate, AvailableTimes

class UserDetails(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('therapist', 'Therapist'),
        ('admin', 'Admin'),
    )
    fullname = models.CharField(max_length=100,blank=True,null=True)
    age = models.CharField(max_length=200,blank=True,null=True)
    place = models.CharField(max_length=100,blank=True,null=True)
    gender = models.CharField(max_length=100,blank=True,null=True)
    language = models.CharField(max_length=100,blank=True,null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)  
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_therapist_active = models.BooleanField(default=True)
    is_user_active = models.BooleanField(default=True)
    is_therapist = models.BooleanField(default=False)



   
    
    def __str__(self):
        return self.username
    
# models.py
class TemporaryUser(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)  # Consider hashing before saving
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_otp_expired(self):
        expiry_time = self.created_at + timedelta(minutes=5)
        return now() > expiry_time

    
    
class TherapySession(models.Model):
    SESSION_STATUS = (
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Absent - Client', 'Absent - Client'),
        ('Absent - Therapist', 'Absent - Therapist'),
        ('No Show - Both', 'No Show - Both'),
    )

    CANCEL_PERSON = (
        ('Client', 'Client'),
        ('Therapist', 'Therapist')
    )

    client = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='client_sessions')
    therapist = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='therapist_sessions')
    date = models.ForeignKey(AvailableDate, on_delete=models.CASCADE)
    time = models.ForeignKey(AvailableTimes, on_delete=models.CASCADE)
    price = models.IntegerField()
    status = models.CharField(max_length=100, choices=SESSION_STATUS, default='Scheduled')
    session_mode = models.CharField(max_length=100)
    is_new = models.BooleanField(default=True)
    feedback = models.TextField(blank=True, null=True)
    rating = models.IntegerField(blank=True, null=True)
    cancel_reason = models.TextField(blank=True, null=True)
    canceled_person = models.CharField(max_length=100, choices=CANCEL_PERSON, blank=True, null=True)
    user_attended = models.BooleanField(default=False)
    therapist_attended = models.BooleanField(default=False)




class Notification(models.Model):
    user = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    read = models.BooleanField(default=False)
    time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message[:20]}"

    
# users/models.py


from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    text = models.TextField(blank=True, null=True)
    media = models.FileField(upload_to='chat_media/', blank=True, null=True)
    media_type = models.CharField(max_length=20, blank=True, null=True)  # 'image', 'video', 'document', etc.
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def save(self, *args, **kwargs):
        if self.media:
            # Determine media type based on file extension
            ext = self.media.name.split('.')[-1].lower()
            if ext in ['jpg', 'jpeg', 'png', 'gif']:
                self.media_type = 'image'
            elif ext in ['mp4', 'webm', 'ogg']:
                self.media_type = 'video'
            elif ext in ['pdf', 'doc', 'docx', 'txt']:
                self.media_type = 'document'
            else:
                self.media_type = 'other'
        super().save(*args, **kwargs)





class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s Wallet - ₹{self.balance}"


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit'),   # money added
        ('DEBIT', 'Debit'),     # money used
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet.user.username} - {self.transaction_type} - ₹{self.amount}"

class ClientWithdrawalRequest(models.Model):
    client = models.ForeignKey(UserDetails, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField()
    upi_id = models.CharField(max_length=100)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.client.username} - ₹{self.amount}"

# therapist/models.py
class WithdrawalRequest(models.Model):
    therapist = models.ForeignKey(UserDetails, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField()
    upi_id = models.CharField(max_length=100)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.therapist.username} - ₹{self.amount}"


    



class AdminTherapistChat(models.Model):
    sender = models.ForeignKey(UserDetails, related_name='sent_chats', on_delete=models.CASCADE)
    receiver = models.ForeignKey(UserDetails, related_name='received_chats', on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

class TherapistNotification(models.Model):
    user = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name="therapist_notifications")
    message = models.TextField()
    read = models.BooleanField(default=False)
    time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message[:20]}"
    

class AdminNotification(models.Model):
    user = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name="admin_notifications")
    message = models.TextField()
    read = models.BooleanField(default=False)
    time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message[:20]}"