from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('get_therapists/', GetTherapistsView.as_view(), name='get_therapists'),
    path('get_all_therapist/', GetAllTherapist.as_view(), name='get_all_therapist'),
    path('get_therapist_information/<int:id>/', GetTherapistsInformationView.as_view(), name='get_therapists_information'),
    path('get_users/', GetUsersView.as_view(), name='get_users'),
    path('approve_therapist/<int:id>/', ApproveTherapist.as_view(), name='approve_therapist'),
    path('specializations/', SpecializationsView.as_view(), name='specializations-list'),
    path('specializations/<int:id>/', SpecializationsView.as_view(), name='specializations-detail'),
    path('change_therapist_status/<int:id>/', ChangeTherapistStatus.as_view(), name='change_therapist_status'),
    path('change_user_status/<int:id>/', ChangeUserStatus.as_view(), name='change_user_status'),
    path('get_user_details/<int:id>/', GetUserDetails.as_view(), name='get_user_details'),
    path('get_withdraw_requests/', GetWithdrawRequestsView.as_view(), name='get_withdraw_requests'),
    path('process_withdraw/<int:id>/', ProcessWithdraw.as_view(), name='process_withdraw'),
    path('reportForAdminDashboard/', ReportForAdminDashboard.as_view(), name='reportForAdminDashboard'),
    path('sessions/', Sessions.as_view(), name='sessions'),
    path('get_notifications/', views.get_notifications, name='get_notifications'),



]