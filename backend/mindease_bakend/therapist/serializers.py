# serializers.py
from rest_framework import serializers
from .models import AvailableDate, AvailableTimes
from users.models import WalletTransaction, TherapistNotification

    
from rest_framework import serializers
from .models import AvailableDate, AvailableTimes

class AvailableTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTimes
        fields = ['id', 'time', 'is_booked']

class AvailableDateSerializer(serializers.ModelSerializer):
    available_times = AvailableTimeSerializer(many=True, read_only=True)

    class Meta:
        model = AvailableDate
        fields = ['id', 'date', 'available_times']

    

from rest_framework import serializers
from .models import TherapistDetails, Specializations, Languages

# Specialization Serializer
from rest_framework import serializers
from .models import TherapistDetails, Specializations, Languages

# Specialization Serializer
class SpecializationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specializations
        fields = ['specializations']

# Language Serializer
class LanguagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Languages
        fields = ['languages']

# TherapistDetails Serializer
class TherapistDetailsSerializer(serializers.ModelSerializer):
    specializations = SpecializationsSerializer(many=True, read_only=True)
    languages = LanguagesSerializer(many=True, read_only=True)
 

    class Meta:
        model = TherapistDetails
        fields = [
            'fullname', 'dateOfBirth', 'gender', 'phone', 'state', 'country',
            'address', 'professionalTitle', 'yearsOfExperience', 'professionalLicenseNumber',
            'licenseIssuingAuthority', 'licenseExpiryDate', 'degree', 'university',
            'yearOfGraduation', 'additionalCertifications', 'governmentIssuedID',
            'professionalLicense', 'educationalCertificate', 'additionalCertificationDocument',
            'profile_image', 'specializations', 'languages'
        ]

    def create(self, validated_data):
        # Pop related fields
        specializations_data = validated_data.pop('specializations', [])
        languages_data = validated_data.pop('languages', [])

        # Create main therapist object
        therapist = TherapistDetails.objects.create(**validated_data)

        # Create specialization entries
        for spec in specializations_data:
            Specializations.objects.create(therapist_details=therapist, specializations=spec)

        # Create language entries
        for lang in languages_data:
            Languages.objects.create(therapist_details=therapist, languages=lang)

        return therapist


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'transaction_type', 'amount', 'description', 'created_at']


class TherapistNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistNotification
        fields = '__all__'