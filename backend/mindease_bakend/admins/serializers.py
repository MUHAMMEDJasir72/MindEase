# therapists/serializers.py
from rest_framework import serializers
from therapist.models import TherapistDetails, Specializations, Languages, AvailableDate, AvailableTimes
from .models import SpecializationsList
from django.contrib.auth import get_user_model
from django.utils import timezone

from users.models import WithdrawalRequest, TherapySession, AdminNotification, ClientWithdrawalRequest

User = get_user_model()

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # or list the specific fields you want

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Languages
        fields = ['id', 'languages']


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specializations
        fields = ['id', 'specializations']

class AvailableTimesSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    class Meta:
        model = AvailableTimes
        fields = ['id', 'time', 'is_booked']

    def get_time(self, obj):
        return obj.time.strftime('%I:%M %p').lower()
    
    

class AvailableDateSerializer(serializers.ModelSerializer):
    available_times = serializers.SerializerMethodField()

    class Meta:
        model = AvailableDate
        fields = ['id', 'date', 'available_times']

    def get_available_times(self, obj):
        times = obj.available_times.all().order_by('time')  # Ascending order
        return AvailableTimesSerializer(times, many=True).data



    

class TherapistDetailsSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='user.role', read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)
    user = UsersSerializer(read_only=True)
    availabilities = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = TherapistDetails
        fields = '__all__'

    def get_availabilities(self, obj):
        # Order by date ascending
        today = timezone.now().date()
        availabilities = obj.user.availabilities.filter(date__gte=today).order_by('date')
        return AvailableDateSerializer(availabilities, many=True).data
    
    def get_rating(self, obj):
        from django.db.models import Avg
        sessions = TherapySession.objects.filter(
            therapist=obj.user,
            rating__isnull=False
        )
        avg_rating = sessions.aggregate(avg=Avg('rating'))['avg']
        return round(avg_rating, 1) if avg_rating is not None else None


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # or list the specific fields you want




class SpecializationsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecializationsList
        fields = ['id', 'specialization']


class TherapistWithdrawalRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = WithdrawalRequest
        fields =  '__all__'

class ClientWithdrawalRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClientWithdrawalRequest
        fields =  '__all__'



class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = '__all__'



# serializers.py

from rest_framework import serializers
from therapist.models import AvailableDate, AvailableTimes
from users.models import UserDetails, TherapySession


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetails
        fields = ['id', 'name', 'email']


class TherapistSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetails
        fields = ['id', 'username', 'email']


class DateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableDate
        fields = ['id', 'date']


class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTimes
        fields = ['id', 'time', 'is_booked']


class ReportSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    therapist = TherapistSerializer()
    date = DateSerializer()
    time = TimeSerializer()

    class Meta:
        model = TherapySession
        fields = [
            'id', 'client', 'therapist', 'date', 'time', 'price', 'status',
            'session_mode', 'is_new', 'feedback', 'rating', 'cancel_reason', 'canceled_person'
        ]




class FetchAllTherapistSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistDetails
        fields = '__all__'