from django.contrib import admin
from .models import *

admin.site.register(UserDetails)
admin.site.register(TherapySession)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(WithdrawalRequest)
admin.site.register(TherapistNotification)
admin.site.register(AdminNotification)
admin.site.register(Wallet)
admin.site.register(WalletTransaction)
admin.site.register(AdminTherapistChat)
admin.site.register(ClientWithdrawalRequest)
admin.site.register(TemporaryUser)
