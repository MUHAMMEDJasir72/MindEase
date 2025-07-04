from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views





urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    # path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify_otp/', VerifyOtp.as_view(), name='otp'),
    path('resend_otp/', ResendOtp.as_view(), name='resend_otp'),
    # path('refresh_token/', RefreshTokenView.as_view(), name='refresh_token'),
    path('get_profile/', ProfileView.as_view(), name='profile'),
    path('profile_image/', ProfileImageUpdateView.as_view(), name='update-profile-image'),
    path('verify_password/', VerifyPasswordView.as_view(), name='verify_password'),
    path('change_forgot_password/', ChangeForgotPasswordView.as_view(), name='change_password'),
    path('verifyEmail/', VerifyEmailView.as_view(), name='verifyEmail'),


    path('login/token/', TokenObtainPairViews.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create_appointment/', CreateAppointment.as_view(), name='create_appointment'),
    path('get_appointments/', GetAppointment.as_view(), name='get_appointments'),
    path('cancel_session/<int:session_id>/', CancelSession.as_view(), name='cancel_session'),
    path('change_password/', ChangePassword.as_view(), name='change_password'),
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('webhooks/stripe/', views.stripe_webhook, name='stripe_webhook'),
    path('create_feedback/', CreateFeedback.as_view(), name='create_feedback'),
    path('chat/conversation/<int:user1_id>/<int:user2_id>/', ConversationView.as_view(), name='conversation'),
    path('get_notifications/', views.get_notifications, name='get_notifications'),
    path('mark_as_read/', views.mark_as_read, name='mark_as_read'),
    path('mark_all_as_read/', views.mark_all_as_read, name='mark_all_as_read'),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path('chat/upload-media/', upload_media, name='upload_media'),




]


