from django.db import models


class SpecializationsList(models.Model):
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return self.specialization
