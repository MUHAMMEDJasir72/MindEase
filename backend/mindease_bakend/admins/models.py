from django.db import models


class SpecializationsList(models.Model):
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return self.specialization
    

class Prices(models.Model):
    video_call = models.IntegerField(default=0)
    voice_call = models.IntegerField(default=0)
    message = models.IntegerField(default=0)

    def __str__(self):
        return f"Video: {self.video_call}, Voice: {self.voice_call}, Message: {self.message_call}"

