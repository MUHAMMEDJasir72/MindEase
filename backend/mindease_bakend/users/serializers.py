# users/serializers.py
from rest_framework import serializers
from .models import UserDetails, TherapySession, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from therapist.models import TherapistDetails, AvailableDate, AvailableTimes


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetails
        fields = '__all__'


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email  
        token['id'] = user.id  
        

        return token
    

class TherapistDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistDetails
        exclude = ['governmentIssuedID', 'professionalLicense', 'educationalCertificate', 'additionalCertificationDocument']

class AvailableDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableDate
        fields = ['id', 'date']  # Only send what's needed

class AvailableTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTimes
        fields = ['id', 'time'] 


class TherapySessionSerializer(serializers.ModelSerializer):
    therapist_details = serializers.SerializerMethodField()
    date_value = serializers.SerializerMethodField()
    time_value = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    client_profile_image = serializers.SerializerMethodField()

    class Meta:
        model = TherapySession
        fields = '__all__'

    def get_therapist_details(self, obj):
        try:
            therapist_detail = obj.therapist.therapist_details
            return TherapistDetailsSerializer(therapist_detail).data
        except TherapistDetails.DoesNotExist:
            return None

    def get_date_value(self, obj):
        if obj.date and obj.date.date:
            return obj.date.date.strftime("%d,%b,%Y")  # Format: 02,May,2024
        return None

    def get_time_value(self, obj):
        if obj.time and obj.time.time:
            return obj.time.time.strftime("%I:%M %p")  # Format: 08:30 PM
        return None

    def get_client_name(self, obj):
        return obj.client.fullname if obj.client.fullname else obj.client.username

    def get_client_profile_image(self, obj):
        if obj.client.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.client.profile_image.url)
            return obj.client.profile_image.url
        return None


from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'



class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'read', 'time', 'title', 'type']