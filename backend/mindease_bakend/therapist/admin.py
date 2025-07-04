from django.contrib import admin

from .models import *

admin.site.register(TherapistDetails)
admin.site.register(AvailableDate)
admin.site.register(AvailableTimes)
admin.site.register(Specializations)
admin.site.register(Languages)