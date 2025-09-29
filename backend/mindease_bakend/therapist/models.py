from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from admins.models import *


class TherapistDetails(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    TIER_CHOICES = [
        ("bronze", "Bronze"),
        ("silver", "Silver"),
        ("gold", "Gold"),
        ("platinum", "Platinum"),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="therapist_details",
    )
    professionalTitle = models.CharField(max_length=100)
    yearsOfExperience = models.CharField(max_length=100)
    professionalLicenseNumber = models.CharField(max_length=100)
    licenseIssuingAuthority = models.CharField(max_length=100)
    licenseExpiryDate = models.DateField()
    degree = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    yearOfGraduation = models.CharField(max_length=100)
    additionalCertifications = models.CharField(max_length=100, blank=True, null=True)
    governmentIssuedID = models.FileField(upload_to="documents/")
    professionalLicense = models.FileField(upload_to="documents/")
    educationalCertificate = models.FileField(upload_to="documents/")
    additionalCertificationDocument = models.FileField(upload_to="documents/", blank=True, null=True)
    profile_image = models.ImageField(upload_to="therapist_profile_images/", max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default="bronze")
    reject_reason = models.CharField(max_length=100, blank=True, null=True)

    


class Specializations(models.Model):
    specialization = models.ForeignKey(
        SpecializationsList,
        on_delete=models.CASCADE,
        related_name="therapist_specializations",
    )
    therapist_details = models.ForeignKey(
        TherapistDetails, on_delete=models.CASCADE, related_name="specializations"
    )


class Languages(models.Model):
    languages = models.CharField(max_length=100)
    therapist_details = models.ForeignKey(
        TherapistDetails, on_delete=models.CASCADE, related_name="languages"
    )


class AvailableDate(models.Model):
    date = models.DateField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="availabilities",
    )

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class AvailableTimes(models.Model):
    time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    date = models.ForeignKey(
        AvailableDate, on_delete=models.CASCADE, related_name="available_times"
    )


class BlockedSlot(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocked_slots"
    )
    date = models.ForeignKey(AvailableDate, on_delete=models.CASCADE)
    time = models.ForeignKey(AvailableTimes, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("client", "date", "time")

    def __str__(self):
        return (
            f"{self.client.username} blocked from {self.date.date} at {self.time.time}"
        )
