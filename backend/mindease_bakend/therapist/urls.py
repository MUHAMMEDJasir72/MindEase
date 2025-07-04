from django.urls import path
from .views import *
from . import views

urlpatterns = [

    path('request_therapist/', RegisterTherapistView.as_view(), name='request_therapist'),
    path('check_requested/', CheckRequestedView.as_view(), name='check_requested'),
    path('check_approve/', CheckApproveView.as_view(), name='check_approve'),
    path('get_profile/', GetProfileView.as_view(), name='get_profile'),
    path('add_slot/', AddSlotView.as_view(), name='add_slot'),
    path('get_availability/', GetAvailabilityView.as_view(), name='get_availability'),
    path('get_therapist_appointments/', GetTherapistAppointment.as_view(), name='get_therapist_appointments'),
    path('slot/', GetAvailableSlotsView.as_view(), name='slot'),
    path('remove_slots/<int:slot_id>/', RemoveSlotView.as_view(), name='remove-slot'),
    path('update_therapist_profile/', UpdateTherapistProfile.as_view(), name='update_therapist_profile'),
    path('make_completed/', MakeCompleted.as_view(), name='make_completed'),
    path('get_therapist_info/<int:id>/', GetTherapistInfo.as_view(), name='get_therapist_info'),
    path('get_user_info/<int:id>/', GetUserInfo.as_view(), name='get_user_info'),
    path('get_wallet_amount/', GetWalletAmount.as_view(), name='get_wallet_amount'),
    path('get_transactions/', GetTransactions.as_view(), name='get_transactions'),
    path('request_withdraw/', RequestWithdraw.as_view(), name='request_withdraw'),
    path('get_admin/', GetAdmin.as_view(), name='get_admin'),
    path('chat-history/<int:sender_id>/<int:receiver_id>/', views.get_chat_history, name='chat_history'),
    path('reportForTherapistDashboard/<int:therapist_id>/', views.ReportForTherapistDashboard, name='reportForTherapistDashboard'),
    path('get_notifications/', views.get_notifications, name='get_notifications'),
    path('get_total_raiting/', Get_total_rating.as_view(), name='get_total_rating'),






]