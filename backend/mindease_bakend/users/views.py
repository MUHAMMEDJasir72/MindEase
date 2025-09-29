from .models import TherapySession  # Make sure this import is correct
from datetime import datetime
import os
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from django.contrib.auth import login
from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.sites.models import Site
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework.decorators import api_view, permission_classes
from datetime import time
from .serializers import MessageSerializer
from .models import Message
from .models import TherapySession
from django.utils.decorators import method_decorator
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import stripe
from django.utils.timezone import localtime
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from datetime import timedelta
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserDetails, TemporaryUser
from decouple import config
import re
import string
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
import random
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from rest_framework.exceptions import NotAuthenticated
from .serializers import *
from .models import *
from therapist.models import AvailableDate, AvailableTimes, TherapistDetails
from admins.models import *
from rest_framework import permissions
import logging
logger = logging.getLogger("users")

User = get_user_model()


class IsNotBlockedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and not user.is_user_active:
            return False
        return True




class RegisterUserView(APIView):
    def post(self, request):
        """Handle user registration with validation and OTP sending."""
        data = request.data
        full_name = data.get("fullName", "").strip()
        email = data.get("email", "").strip()
        age = data.get("age", "").strip()
        place = data.get("place", "").strip()
        gender = data.get("gender", "").strip()
        language = data.get("language", "").strip()
        phone = data.get("phone", "").strip()
        password1 = data.get("password1", "")
        password2 = data.get("password2", "")

        logger.info("Received registration request with data: %s", data)

        if not all(
            [
                full_name,
                email,
                age,
                place,
                gender,
                language,
                phone,
                password1,
                password2,
            ]
        ):
            return Response(
                {"success": False, "error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not re.match(r"^[A-Za-z]{3,20}$", full_name):
            return Response(
                {
                    "success": False,
                    "error": "Fullname must contain only letters and be 3–20 characters long.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"success": False, "error": "Invalid email format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if UserDetails.objects.filter(email=email).exists():
            return Response(
                {"success": False, "error": "Email already registered."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not age.isdigit() or not (0 < int(age) <= 150):
            return Response(
                {"success": False, "error": "Age must be a number between 1 and 150."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not re.match(r"^[A-Za-z\s]{3,50}$", place):
            return Response(
                {
                    "success": False,
                    "error": "Place must contain only letters and be 3–50 characters long.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not re.match(r"^[A-Za-z\s]{2,30}$", language):
            return Response(
                {
                    "success": False,
                    "error": "Language must contain only letters and be 2–30 characters long.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not re.match(r"^\+?[1-9]\d{8,14}$", phone):
            return Response(
                {"success": False, "error": "Invalid phone number format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password1 != password2:
            return Response(
                {"success": False, "error": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            len(password1) < 8
            or len(password1) > 30
            or not re.search(r"[0-9]", password1)
            or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password1)
        ):
            return Response(
                {
                    "success": False,
                    "error": "Password must be 8–30 characters long, include at least one number and one special character.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        temp_user = TemporaryUser.objects.filter(email=email)
        if temp_user.exists():
            temp_user.delete()

        otp_code = random.randint(100000, 999999)

        TemporaryUser.objects.create(
            email=email,
            password=password1,
            otp=otp_code,
            fullname=full_name,
            age=age,
            place=place,
            gender=gender,
            language=language,
            phone=phone,
        )

        send_mail(
            "Your MindEase Verification Code",
            f"""Dear User,\n\nYour One-Time Password (OTP) for MindEase is:\n**{otp_code}**\n\nThis code expires in 5 minutes.
                Please do not share it with anyone.\n\nIf you didn’t request this code, please secure your account by changing your password immediately or contacting our support team at [jasirsnr72@gmail.com].\n\nThank you,\nThe MindEase Team""",
            config("EMAIL_HOST_USER"),
            [email],
            fail_silently=False,
        )

        return Response(
            {"message": "User registered successfully. Please verify your OTP."},
            status=status.HTTP_201_CREATED,
        )


class LoginViews(APIView):
    def post(self, request):
        """Authenticate user and return access & refresh tokens."""
        email = request.data.get("email")
        password = request.data.get("password")
        current_role = request.data.get("current_role")

        try:
            user_obj = UserDetails.objects.get(email=email)
        except UserDetails.DoesNotExist:
            return Response(
                {"detail": "No account found with this email."},
                status=status.HTTP_404_NOT_FOUND,
            )
        user = authenticate(
            request, username=user_obj.username, password=password)

        if user is not None:
            if not user.is_user_active and current_role == "user":
                return Response(
                    {"message": "Your account is blocked"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not user.is_therapist_active and current_role == "therapist":
                return Response(
                    {"message": "Your account is blocked"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)

            if user.role == "admin":
                user.current_role = "admin"
            else:
                user.current_role = current_role
            user.save()

            response = Response(
                {
                    "message": "Login successful",
                    "data": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "current_role": getattr(user, "current_role", None),
                        "role": user.role,
                    },
                },
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,  
                samesite="Lax",
                max_age=10800,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=86400,
            )
            return response
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    """API endpoint to log out a user and clear tokens."""

    def post(self, request):
        """Blacklist refresh token and remove cookies."""
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            user = request.user
            user.current_role = None
            user.save()

            response = Response(
                {"message": "Logged out successfully"}, status=status.HTTP_200_OK
            )
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response

        except Exception as e:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


class VerifyOtp(APIView):
    """API endpoint to verify OTP and create a new user account."""
    def post(self, request):
        user_otp = request.data.get("otp")
        email = request.data.get("email")

        if not email or not user_otp:
            return Response(
                {"message": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            temp_user = TemporaryUser.objects.get(email=email, otp=user_otp)
        except TemporaryUser.DoesNotExist:
            return Response({"message": "Invalid OTP"}, status=400)

        if temp_user.is_otp_expired():
            return Response(
                {"message": "OTP has expired. Please request a new one."}, status=400
            )

        user = UserDetails.objects.create_user(
            username=temp_user.email.split("@")[0],
            email=temp_user.email,
            fullname=temp_user.fullname,
            age=temp_user.age,
            place=temp_user.place,
            gender=temp_user.gender,
            language=temp_user.language,
            phone=temp_user.phone,
        )
        user.set_password(temp_user.password)
        user.save()

        temp_user.delete()

        return Response({"message": "Yout account created successfully"}, status=200)


class VerifyForgetPasswordOtp(APIView):
    """API endpoint to verify OTP for password reset."""

    def post(self, request):
        user_otp = request.data.get("otp")
        email = request.data.get("email")

        if not email or not user_otp:
            return Response(
                {"message": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            temp_user = TemporaryUser.objects.get(email=email, otp=user_otp)
        except TemporaryUser.DoesNotExist:
            return Response({"message": "Invalid OTP"}, status=400)

        if temp_user.is_otp_expired():
            return Response(
                {"message": "OTP has expired. Please request a new one."}, status=400
            )

        temp_user.delete()

        return Response({"message": "OTP verified successfully"}, status=200)


class ResendOtp(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email not found"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, email=email)

        if not user:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        otp_code = random.randint(100000, 999999)
        user.otp_code = otp_code
        user.otp_created_at = now()
        user.save()

        send_mail(
            "Your MindEase Verification Code",
            f"""Dear User,\n\nYour One-Time Password (OTP) for MindEase is:\n**{otp_code}**\n\nThis code expires in 5 minutes.
                Please do not share it with anyone.\n\nIf you didn’t request this code, please secure your account by changing your password immediately or contacting our support team at [jasirsnr72@gmail.com].\n\nThank you,\nThe MindEase Team""",
            config("EMAIL_HOST_USER"),
            [email],
            fail_silently=False,
        )

        return Response(
            {"message": "New OTP sent to your email."}, status=status.HTTP_200_OK
        )




class RefreshTokenView(APIView):
    """API endpoint to resend OTP to user's email."""
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token

            response = Response(
                {"message": "Token refreshed"}, status=status.HTTP_200_OK
            )

            response.set_cookie(
                key="access_token",
                value=str(access_token),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=10800,
            )

            return response

        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class ProfileView(APIView):
    """API endpoint to view and update user profile information."""

    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def get(self, request):
        user = request.user
        method = user.is_google_account

        profile_data = {
            "username": user.username,
            "email": user.email,
            "fullname": user.fullname,
            "age": user.age,
            "place": user.place,
            "gender": user.gender,
            "language": user.language,
            "phone": user.phone,
            "profile_image": user.profile_image.url if user.profile_image else None,
        }
        return Response(
            {"success": True, "profile_info": profile_data, "login_method": method}
        )

    def patch(self, request):
        user = request.user
        data = request.data

        allowed_fields = ["fullname", "age",
                          "phone", "place", "gender", "language"]
        for field in allowed_fields:
            if field in data:
                if hasattr(user, field):
                    setattr(user, field, data[field])
        user.save()

        return Response(
            {"success": True, "message": "Profile updated successfully!"},
            status=status.HTTP_200_OK,
        )


class ProfileImageUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        if "profile_image" in request.FILES:
            user.profile_image = request.FILES["profile_image"]
            user.save()
            return Response(
                {
                    "success": True,
                    "profile_image": user.profile_image.url,
                    "message": "Profile image updated successfully!",
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"success": False, "message": "No image uploaded"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class VerifyPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        typed_password = request.data.get("password")
        if typed_password and request.user.check_password(typed_password):
            return Response({"success": True}, status=status.HTTP_200_OK)
        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)


class ChangeForgotPasswordView(APIView):

    def post(self, request):
        email = request.data.get("email")
        password1 = request.data.get("password1")
        password2 = request.data.get("password2")
        if not password1 and not password2:
            return Response(
                {"success": False, "message": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if password1 != password2:
            return Response(
                {"success": False, "message": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if (
            len(password1) < 8
            or len(password1) > 30
            or not re.search(r"[0-9]", password1)
            or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password1)
        ):
            return Response(
                {
                    "success": False,
                    "message": "Password must be 8–30 characters long, include at least one number and one special character.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(password1)
        user.save()

        return Response(
            {"success": True, "message": "Password updated successfully"},
            status=status.HTTP_200_OK,
        )


class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password1 = request.data.get("password1")
        password2 = request.data.get("password2")
        if not password1 or not password2:
            return Response(
                {"success": False, "message": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if password1 != password2:
            return Response(
                {"success": False, "message": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if (
            len(password1) < 8
            or len(password1) > 30
            or not re.search(r"[0-9]", password1)
            or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password1)
        ):
            return Response(
                {
                    "success": False,
                    "message": "Password must be 8–30 characters long, include at least one number and one special character.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        user.set_password(password1)
        user.save()
        return Response(
            {"success": True, "message": "Password updated successfully"},
            status=status.HTTP_200_OK,
        )


class VerifyEmailView(APIView):
    def post(self, request):
        entered_email = request.data.get("email", "").strip()

        if not entered_email:
            return Response(
                {"success": False, "message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=entered_email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Email not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        temp_user = TemporaryUser.objects.filter(email=entered_email)
        if temp_user.exists():
            temp_user.delete()

        otp_code = random.randint(100000, 999999)

        TemporaryUser.objects.create(email=entered_email, otp=otp_code)

        send_mail(
            "Your MindEase Verification Code",
            f"""Dear User,\n\nYour One-Time Password (OTP) for MindEase is:\n**{otp_code}**\n\nThis code expires in 5 minutes.
                Please do not share it with anyone.\n\nIf you didn’t request this code, please secure your account by changing your password immediately or contacting our support team at [jasirsnr72@gmail.com].\n\nThank you,\nThe MindEase Team""",
            config("EMAIL_HOST_USER"),
            [entered_email],
            fail_silently=False,
        )
        return Response(
            {"success": True, "message": "OTP has been sent to your email."},
            status=status.HTTP_200_OK,
        )


class CreateAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def post(self, request):
        data = request.data
        client = request.user
        therapist_id = data.get("therapist")
        date_id = data.get("date")
        time_id = data.get("time")
        price = data.get("price")
        session_mode = data.get("mode")
        session_type = data.get("type")

        therapistInstance = TherapistDetails.objects.get(id=therapist_id)
        if not therapistInstance.specializations.exists():
            return Response(
                {"success": False, "message": "Sorry, you can't book session with this therapist. Please try with another therapist."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        therapist = UserDetails.objects.get(id=therapistInstance.user.id)

        get_date = get_object_or_404(AvailableDate, id=date_id)
        get_time = get_object_or_404(AvailableTimes, id=time_id, date=get_date)

        if get_time.is_booked:
            return Response(
                {"success": False, "message": "This slot is already booked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if BlockedSlot.objects.filter(
            client=request.user, date=get_date, time=get_time
        ).exists():
            return Response(
                {"message": "You cannot rebook this time slot again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        get_time.is_booked = True
        get_time.save()

        date = AvailableDate.objects.get(id=date_id)
        time = AvailableTimes.objects.get(id=time_id)
        if session_type != "new":
            session_type = False
        else:
            session_type = True

        session = TherapySession.objects.create(
            client=client,
            therapist=therapist,
            date=date,
            time=time,
            price=price,
            session_mode=session_mode,
            is_new=session_type,
        )
        admin_user = UserDetails.objects.filter(is_superuser=True).first()
        admin_wallet = Wallet.objects.get(user=admin_user)
        admin_share = price * 20 // 100
        admin_wallet.balance += admin_share
        admin_wallet.save()

        WalletTransaction.objects.create(
            wallet=admin_wallet,
            transaction_type="CREDIT",
            amount=admin_share,
            description=f"Admin commission from session #{session.id}",
        )

        client_wallet = Wallet.objects.get(user=client)
        WalletTransaction.objects.create(
            wallet=client_wallet,
            transaction_type="DEBIT",
            amount=price,
            description=f"Stripe payment for session #{session.id} with therapist {therapist.fullname}",
        )

        Notification.objects.create(
            user=client,
            title="New Appointment",
            message=f"You have a new appointment with therapist {therapist.fullname} on {date.date.strftime('%B %d, %Y')} at {time.time.strftime('%I:%M %p')}.",
            type="success",
            location="/appointments",
        )
        TherapistNotification.objects.create(
            user=therapist,
            title="Slot Booked",
            message=f"You have a new appointment with client {client} on {date.date.strftime('%B %d, %Y')} at {time.time.strftime('%I:%M %p')}.",
            type="success",
            location="/therapistAppointments",
        )
        AdminNotification.objects.create(
            user=admin_user,
            title="New Commision added to wallet",
            message=f"Recieved {admin_share} to wallet by Commision from session #{session.id}",
            type="success",
            location="/adminEarnings",
        )
        return Response(
            {"message": "Appointment created successfully"},
            status=status.HTTP_201_CREATED,
        )


class GetAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def get(self, request):

        sessions = TherapySession.objects.filter(status="Scheduled")

        for session in sessions:
            naive_session_datetime = datetime.combine(
                session.date.date, session.time.time
            )

            session_datetime = timezone.make_aware(
                naive_session_datetime, timezone.get_current_timezone()
            )

            now = localtime(
                timezone.now()
            ) 

            if now > session_datetime + timedelta(hours=1):
                if not session.user_attended and not session.therapist_attended:
                    session.status = "No Show - Both"
                elif not session.user_attended:
                    session.status = "Absent - Client"
                elif not session.therapist_attended:
                    session.status = "Absent - Therapist"

                    wallet = Wallet.objects.get(user=request.user)
                    admin_wallet = Wallet.objects.get(user__is_staff=True)
                    wallet.balance += session.price
                    admin_wallet.balance -= session.price

                    WalletTransaction.objects.create(
                        wallet=wallet,
                        transaction_type="CREDIT",
                        amount=session.price,
                        description=f"Refund from {session.id}, because of therapist not attended",
                    )
                    WalletTransaction.objects.create(
                        wallet=admin_wallet,
                        transaction_type="DEBIT",
                        amount=session.price,
                        description=f"gave refund to {session.client.fullname} from {session.id}, because of therapist not attended",
                    )
                    wallet.save()
                    admin_wallet.save()

                    Notification.objects.create(
                        user=request.user,
                        title="Refund from absent session",
                        message=f"You got {session.price} to yout wallet , because of therapist absent of session {session.id}",
                        type="success",
                        location="/appointments",
                    )

                else:
                    session.status = "Completed"
                session.save()

        user = request.user

        appointments = TherapySession.objects.filter(client=user).order_by(
            "date", "time"
        )

        serializer = TherapySessionSerializer(appointments, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CancelSession(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        try:
            session = TherapySession.objects.get(id=session_id)

            if session.status == "Cancelled":
                return Response(
                    {"message": "Session is already cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            session_date = session.date.date
            session_time = session.time.time
            session_datetime = datetime.combine(session_date, session_time)

            if datetime.now() > session_datetime - timedelta(hours=1):
                return Response(
                    {
                        "message": "Session can only be cancelled at least 1 hour before it starts."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reason = request.data.get("reason")
            current_role = request.data.get(
                "current_role") 

            if current_role == "user":
                session.canceled_person = "Client"
                cancelled_by = "Client"
            else:
                session.canceled_person = "Therapist"
                cancelled_by = "Therapist"

            admin_user = UserDetails.objects.filter(is_superuser=True).first()
            admin_wallet = Wallet.objects.get(user=admin_user)
            client_wallet = Wallet.objects.get(user=session.client)
            admin_share = (
                session.price * 0.2
            ) 
            client_wallet.balance += session.price
            admin_wallet.balance -= admin_share
            client_wallet.save()
            admin_wallet.save()

            session.status = "Cancelled"
            session.cancel_reason = reason
            session.save()

            session.time.is_booked = False
            session.time.save()

            BlockedSlot.objects.get_or_create(
                client=session.client, date=session.date, time=session.time
            )

            if cancelled_by == "Client":
                client_noti_message = f"You cancelled Session ({session.id}) with {session.therapist.fullname} on {session_date} at {session_time.strftime('%I:%M %p')}."
                therapist_noti_message = f"The client {session.client.fullname if session.client.fullname else session.client.username} cancelled session with you on {session_date} at {session_time.strftime('%I:%M %p')}."
            else:
                client_noti_message = f"The Therapist {session.therapist.fullname} cancelled session with you on {session_date} at {session_time.strftime('%I:%M %p')}."
                therapist_noti_message = f"You cancelled Session ({session.id}) with {session.client.fullname if session.client.fullname else session.client.username} on {session_date} at {session_time.strftime('%I:%M %p')}."

            Notification.objects.create(
                user=session.client,
                title="Session Cancelled",
                message=client_noti_message,
                read=False,
                location="/appointments",
                type="warning",
            )
            TherapistNotification.objects.create(
                user=session.therapist,
                title="Session Cancelled",
                message=therapist_noti_message,
                read=False,
                location="/therapistAppointments",
                type="warning",
            )

            return Response(
                {"message": "Session cancelled successfully."},
                status=status.HTTP_200_OK,
            )

        except TherapySession.DoesNotExist:
            return Response(
                {"message": "Session not found."}, status=status.HTTP_404_NOT_FOUND
            )



stripe.api_key = settings.STRIPE_SECRET_KEY


@method_decorator(csrf_exempt, name="dispatch")
class CreatePaymenIntent(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def post(self, request):
        try:
            data = json.loads(request.body)
            amount_in_inr = data.get("amount")

            if not amount_in_inr:
                return JsonResponse({"error": "Amount is required"}, status=400)

            conversion_rate = 0.01144
            amount_in_usd = float(amount_in_inr) * conversion_rate

            amount_in_cents = int(round(amount_in_usd * 100))

            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency="usd",
                automatic_payment_methods={"enabled": True},
            )
            return JsonResponse({"clientSecret": intent["client_secret"]})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    endpoint_secret = (
        settings.STRIPE_ENDPOINT_SECRET
    )  

    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret)
    except ValueError as e:
        return JsonResponse({"error": "Invalid payload"}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({"error": "Invalid signature"}, status=400)

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]

    return JsonResponse({"status": "success"}, status=200)


class CreateFeedback(APIView):
    def patch(self, request):
        appointment_id = request.data.get("appointment_id")
        feedback = request.data.get("feedback")
        rating = request.data.get("rating")

        if not appointment_id or feedback is None or rating is None:
            return Response(
                {"message": "appointment_id, feedback, and rating are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = TherapySession.objects.get(id=appointment_id)
        except TherapySession.DoesNotExist:
            return Response(
                {"message": "Therapy session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        session.feedback = feedback
        session.rating = rating
        session.save()

        return Response(
            {"message": "Feedback updated successfully."}, status=status.HTTP_200_OK
        )


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user1_id, user2_id):
        try:
            user1 = User.objects.get(id=user1_id)
            user2 = User.objects.get(id=user2_id)

            messages = Message.objects.filter(
                Q(sender=user1, receiver=user2) | Q(
                    sender=user2, receiver=user1)
            ).order_by("timestamp")

            serializer = MessageSerializer(messages, many=True)

            return Response(serializer.data)

        except ObjectDoesNotExist:
            return Response(
                {"error": "One or both users not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    Notification.objects.filter(user=user, read=True).delete()

    notifications = Notification.objects.filter(user=user).order_by("-time")
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_as_read(request):
    notification_id = request.data.get("id")

    if not notification_id:
        return Response(
            {"message": "Notification ID is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        notification = Notification.objects.get(
            id=notification_id, user=request.user)
        notification.read = True
        notification.save()
        return Response(
            {"message": "Notification marked as read."}, status=status.HTTP_200_OK
        )
    except Notification.DoesNotExist:
        return Response(
            {"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    notifications = Notification.objects.filter(user=request.user, read=False)
    updated_count = notifications.update(read=True)

    return Response(
        {"message": f"{updated_count} notifications marked as read."},
        status=status.HTTP_200_OK,
    )


class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")
        current_role = request.data.get("current_role")
        mode = request.data.get("mode")

        if not token:
            return Response(
                {"error": "Google OAuth token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), config("GOOGLE_CLIENT_ID")
            )

            if idinfo.get("iss") not in [
                "accounts.google.com",
                "https://accounts.google.com",
            ]:
                return Response(
                    {"error": "Invalid token issuer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = idinfo.get("email")
            if not email:
                return Response(
                    {"error": "Email not found in Google account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            name = idinfo.get("name", email.split("@")[0])

            if mode == "register":
                if User.objects.filter(email=email).exists():
                    return Response(
                        {
                            "error": "This email is already registered. Please log in instead."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                user = User.objects.create(
                    email=email, username=name, is_google_account=True, fullname=name
                )

            elif mode == "login":
                user = User.objects.filter(email=email).first()
                if not user:
                    return Response(
                        {
                            "error": "No account found with this email. Please register first."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if not user.is_google_account:
                    return Response(
                        {
                            "error": "This email is registered using email/password. Please use normal login."
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            if not user.is_user_active and current_role == "user":
                return Response(
                    {"error": "Your account is blocked"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not user.is_therapist_active and current_role == "therapist":
                return Response(
                    {"error": "Your account is blocked"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if user.role == "admin":
                user.current_role = "admin"
            else:
                user.current_role = current_role
            user.save()

            refresh = RefreshToken.for_user(user)

            response = Response(
                {
                    "message": "Login successful",
                    "role": user.current_role,
                },
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=10800,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False, 
                samesite="Lax",
                max_age=86400,
            )

            return response

        except ValueError:
            return Response(
                {"error": "Invalid or expired Google OAuth token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": f"Authentication failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload_media(request):
    if "file" not in request.FILES:
        return Response({"error": "No file provided"}, status=400)

    file = request.FILES["file"]
    sender = request.POST.get("sender")
    receiver = request.POST.get("receiver")

    media_dir = os.path.join(settings.MEDIA_ROOT, "chat_media")
    os.makedirs(media_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    ext = file.name.split(".")[-1]
    filename = f"{timestamp}_{sender}_{receiver}.{ext}"

    file_path = os.path.join(media_dir, filename)
    with open(file_path, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    media_type = "other"
    if ext.lower() in ["jpg", "jpeg", "png", "gif"]:
        media_type = "image"
    elif ext.lower() in ["mp4", "webm", "ogg"]:
        media_type = "video"
    elif ext.lower() in ["pdf", "doc", "docx", "txt"]:
        media_type = "document"

    return Response(
        {
            "media_url": os.path.join("/media/chat_media", filename),
            "media_type": media_type,
        }
    )


class MarkAsAttended(APIView):
    def post(self, request):
        session_id = request.data.get("id")
        role = request.data.get("role")

        try:
            session = TherapySession.objects.get(id=session_id)
        except TherapySession.DoesNotExist:
            return Response(
                {"message": "Session not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if role == "user":
            session.user_attended = True
        else:
            session.therapist_attended = True

        session.save()
        return Response({"message": "Marked as attended"}, status=status.HTTP_200_OK)


class ClientWithdrawRequest(APIView):
    def post(self, request):
        user = request.user
        amount = request.data.get("amount")
        upi_id = request.data.get("upi_id")

        min_amount_instance = MinimumWithdrawAmount.objects.first()
        min_amount = int(min_amount_instance.amount) if min_amount_instance else 0

        # Check against minimum amount
        if amount < min_amount:
            return Response(
                {"message": f"Minimum withdrawal amount is ₹{min_amount}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ClientWithdrawalRequest.objects.create(
            client=user, amount=amount, upi_id=upi_id
        )
        admin_user = UserDetails.objects.filter(is_superuser=True).first()

        AdminNotification.objects.create(
            user=admin_user,
            title="Withdraw Request",
            message=f"You have a withdrawal request of ₹{amount} from client {user.fullname if user.fullname else user.username}",
            type="success",
            location="/adminEarnings",
        )
        return Response(
            {"message": "Withdrawal request submitted successfully"},
            status=status.HTTP_201_CREATED,
        )


class GetTherapistProfile(APIView):
    def get(self, request, id):
        therapist = TherapistDetails.objects.get(id=id)
        serializer = GetTherapistProfileSerializer(therapist)
        return Response({"profile_info": serializer.data})


class MyInfoview(APIView):
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        raise NotAuthenticated(detail="Not logged in")

    def get(self, request):
        user = request.user
        return Response(
            {
                "data": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "current_role": getattr(user, "current_role", None),
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )


class GetTransactionsHistory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            wallet = Wallet.objects.get(user=user)
            transactions = wallet.transactions.all().order_by(
                "-created_at"
            )  
            serializer = UserWalletTransactionSerializer(
                transactions, many=True)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND
            )


class CheckAuth(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            logger.info(
                f"User {request.user.username} authenticated with role {request.user.role}"
            )
            return Response(
                {
                    "authenticated": True,
                    "current_role": request.user.current_role,
                    "role": request.user.role,
                }
            )

        logger.warning("Unauthenticated request received")
        return Response({"authenticated": False})


class CheckSlotAvailability(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def post(self, request):
        date_id = request.data.get("date")
        time_id = request.data.get("time")
        get_date = get_object_or_404(AvailableDate, id=date_id)
        get_time = get_object_or_404(AvailableTimes, id=time_id, date=get_date)

        if get_time.is_booked:
            return Response(
                {"available": False, "message": "Slot already booked"}, status=400
            )
        return Response({"available": True})
