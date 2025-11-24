from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path("request-therapist/", RegisterTherapistView.as_view(), name="request_therapist"),
    path("check-requested/", CheckRequestedView.as_view(), name="check_requested"),
    path("check-approve/", CheckApproveView.as_view(), name="check_approve"),
    path("get-profile/", GetProfileView.as_view(), name="get_profile"),
    path("add-slot/", AddSlotView.as_view(), name="add_slot"),
    path("get-availability/", GetAvailabilityView.as_view(), name="get_availability"),
    path("get-therapist-appointments/", GetTherapistAppointment.as_view(), name="get_therapist_appointments"),
    path("slot/", GetAvailableSlotsView.as_view(), name="slot"),
    path("remove-slots/<int:slot_id>/", RemoveSlotView.as_view(), name="remove-slot"),
    path("update-therapist-profile/", UpdateTherapistProfile.as_view(), name="update_therapist_profile"),
    path("make-completed/", MakeCompleted.as_view(), name="make_completed"),
    path("get-therapist-info/<int:id>/", GetTherapistInfo.as_view(), name="get_therapist_info"),
    path("get-user-info/<int:id>/", GetUserInfo.as_view(), name="get_user_info"),
    path("get-wallet-amount/", GetWalletAmount.as_view(), name="get_wallet_amount"),
    path("get-transactions/", GetTransactions.as_view(), name="get_transactions"),
    path("request-withdraw/", RequestWithdraw.as_view(), name="request_withdraw"),
    path("get-admin/", GetAdmin.as_view(), name="get_admin"),
    path("chat-history/<int:sender_id>/<int:receiver_id>/", views.get_chat_history, name="chat_history"),
    path("report-dashboard/<int:therapist_id>/", ReportForTherapistDashboard.as_view(), name="reportForTherapistDashboard"),
    path("get-notifications/", views.get_notifications, name="get_notifications"),
    path("get-total-raiting/", Get_total_rating.as_view(), name="get_total_rating"),
    path("therapist-secure-documents/<path:path>", Therapist_protected_document_view, name="therapist-secure_document"),
    path("mark-therapist-notification/", MarkTherapistNotification.as_view(), name="mark-therapist-notification"),
    path("mark-all-therapist-notifications/", MarkAllTherapistNotifications.as_view(), name="mark-alltherapist-notifications"),
]
