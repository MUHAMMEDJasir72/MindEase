from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path("get-therapists/", GetTherapistsView.as_view(), name="get_therapists"),
    path("get-all-therapist/", GetAllTherapist.as_view(), name="get_all_therapist"),
    path("get-therapist-information/<int:id>/", GetTherapistsInformationView.as_view(), name="get_therapists_information"),
    path("get-users/", GetUsersView.as_view(), name="get_users"),
    path("approve-therapist/<int:id>/", ApproveTherapist.as_view(), name="approve_therapist"),
    path("reject-therapist/", RejectTherapist.as_view(), name="reject_therapist"),
    path("specializations/", SpecializationsView.as_view(), name="specializations-list"),
    path("update-specializations/<int:id>/", SpecializationsView.as_view(), name="specializations-detail"),
    path("change-therapist-status/<int:id>/", ChangeTherapistStatus.as_view(), name="change_therapist_status"),
    path("change-user-status/<int:id>/", ChangeUserStatus.as_view(), name="change_user_status"),
    path("get-user-details/<int:id>/", GetUserDetails.as_view(), name="get_user_details"),
    path("report-dashboard/", ReportForAdminDashboard.as_view(), name="report-dashboard"),
    path("sessions/", Sessions.as_view(), name="sessions"),
    path("get-notifications/", get_notifications.as_view(), name="get_notifications"),
    path("secure-documents/<path:path>", protected_document_view, name="secure_document"),
    path("mark-admin-notification/", MarkAdminNotification.as_view(), name="mark-admin-notification"),
    path("mark-all-admin-notifications/", MarkAllAdminNotifications.as_view(), name="mark-all-admin-notifications"),
    path("get-therapist-withdraw-requests/", GetTherapistWithdrawRequestsView.as_view(), name="get_withdraw_requests"),
    path("get-client-withdraw-requests/", GetClientWithdrawRequestsView.as_view(), name="get_withdraw_requests"),
    path("process-therapist-withdraw/<int:id>/", ProcessTherapistWithdraw.as_view(), name="process_withdraw"),
    path("process-client-withdraw/<int:id>/", ProcessClientWithdraw.as_view(), name="process_withdraw"),
    path("tier-prices/", TierPrices.as_view(), name="tier-prices"),
    path("update-tier/", UpdateTier.as_view(), name="update-tier"),
    path("get-minimum-withdrawal-amount/", GetMinimumWithdrawalAmount.as_view(), name="get-minimum-withdrawal-amount"),
]
