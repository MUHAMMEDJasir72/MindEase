from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings

# in your model


class TherapistDetails(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='therapist_details')
    fullname = models.CharField(max_length=100)
    dateOfBirth = models.DateField()
    gender = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    professionalTitle = models.CharField(max_length=100)  
    yearsOfExperience = models.CharField(max_length=100)
    professionalLicenseNumber = models.CharField(max_length=100)
    licenseIssuingAuthority = models.CharField(max_length=100)
    licenseExpiryDate = models.DateField()
    degree = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    yearOfGraduation = models.CharField(max_length=100)
    additionalCertifications = models.CharField(max_length=100, blank=True, null=True)
    governmentIssuedID = models.FileField(upload_to='documents/')
    professionalLicense = models.FileField(upload_to='documents/')
    educationalCertificate = models.FileField(upload_to='documents/')
    additionalCertificationDocument = models.FileField(upload_to='documents/', blank=True, null=True)
    profile_image = models.ImageField(upload_to='therapist_profile_images/', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.fullname
    

class Specializations(models.Model):
    specializations = models.CharField(max_length=100)
    therapist_details = models.ForeignKey(TherapistDetails, on_delete=models.CASCADE, related_name='specializations')

class Languages(models.Model):
    languages = models.CharField(max_length=100)
    therapist_details = models.ForeignKey(TherapistDetails, on_delete=models.CASCADE, related_name='languages')

    
class AvailableDate(models.Model): 
    date = models.DateField() 
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='availabilities')

    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
class AvailableTimes(models.Model):
    time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    date = models.ForeignKey(AvailableDate, on_delete=models.CASCADE, related_name='available_times')




