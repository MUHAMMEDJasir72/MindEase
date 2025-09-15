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
        return f"Video: {self.video_call}, Voice: {self.voice_call}, Message: {self.message}"


class TierPriceConfig(models.Model):
    bronze_video = models.IntegerField(default=700)
    bronze_audio = models.IntegerField(default=500)
    bronze_chat = models.IntegerField(default=300)

    silver_video = models.IntegerField(default=1000)
    silver_audio = models.IntegerField(default=700)
    silver_chat = models.IntegerField(default=500)

    gold_video = models.IntegerField(default=1500)
    gold_audio = models.IntegerField(default=1000)
    gold_chat = models.IntegerField(default=700)

    platinum_video = models.IntegerField(default=2000)
    platinum_audio = models.IntegerField(default=1500)
    platinum_chat = models.IntegerField(default=1000)

    def __str__(self):
        return "Tier Price Configuration"
