from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView
from . import views

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("verify-forgetpassword-otp/", VerifyForgetPasswordOtp.as_view(), name="erify_forgetpassword-otp"),
    path("verify_otp/", VerifyOtp.as_view(), name="otp"),
    path("resend_otp/", ResendOtp.as_view(), name="resend_otp"),
    path("get-profile/", ProfileView.as_view(), name="profile"),
    path("profile_image/", ProfileImageUpdateView.as_view(), name="update-profile-image"),
    path("verify-password/", VerifyPasswordView.as_view(), name="verify_password"),
    path("change_forgot_password/", ChangeForgotPasswordView.as_view(), name="change_password"),
    path("verifyEmail/", VerifyEmailView.as_view(), name="verifyEmail"),
    path("login/", LoginViews.as_view(), name="login"),
    path("refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("create-appointment/", CreateAppointment.as_view(), name="create_appointment"),
    path("get-appointments/", GetAppointment.as_view(), name="get_appointments"),
    path("cancel-session/<int:session_id>/", CancelSession.as_view(), name="cancel_session"),
    path("change_password/", ChangePassword.as_view(), name="change_password"),
    path("create-payment-intent/", CreatePaymenIntent.as_view(), name="create-payment-intent"),
    path("webhooks/stripe/", views.stripe_webhook, name="stripe_webhook"),
    path("create-feedback/", CreateFeedback.as_view(), name="create_feedback"),
    path("chat/conversation/<int:user1_id>/<int:user2_id>/", ConversationView.as_view(), name="conversation"),
    path("get-notifications/", views.get_notifications, name="get_notifications"),
    path("mark-as-read/", views.mark_as_read, name="mark_as_read"),
    path("mark-all-as-read/", views.mark_all_as_read, name="mark_all_as_read"),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path("chat/upload-media/", upload_media, name="upload_media"),
    path("mark-as-attended/", MarkAsAttended.as_view(), name="mark-as-attended"),
    path("request-client-withdraw/", ClientWithdrawRequest.as_view(), name="request-client-withdraw"),
    path("get-therapist-profile/<int:id>/", GetTherapistProfile.as_view(), name="get-therapist-profile"),
    path("my-info/", MyInfoview.as_view(), name="my-info"),
    path("get-transactions-history/", GetTransactionsHistory.as_view(), name="get-transactions-history"),
    path("check-auth/", CheckAuth.as_view(), name="check-auth"),
    path("check-time-slot/", CheckSlotAvailability.as_view(), name="check-slot"),
]
