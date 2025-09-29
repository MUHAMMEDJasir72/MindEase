from django.conf import settings
import os
from django.contrib.auth.decorators import login_required
from django.http import FileResponse, Http404
from django.db.models import Avg
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count
from calendar import month_name
from django.forms.models import model_to_dict
from users.serializers import UserSerializer
import re
from django.http import JsonResponse
from .models import AvailableDate
from django.utils.dateparse import parse_date
from django.utils.timezone import localtime
from django.db.models import Q
from datetime import datetime, timedelta
from django.utils import timezone
from .serializers import AvailableDateSerializer
from datetime import date
from .models import AvailableDate, AvailableTimes
from rest_framework.exceptions import NotFound
import json
from django.forms import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import traceback
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from django.contrib.auth import authenticate, get_user_model
from admins.serializers import TherapistDetailsSerializer

from users.models import *
from users.serializers import TherapySessionSerializer


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import TherapistDetails

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TherapistDetails, Specializations, Languages
from django.contrib.auth.models import User


from rest_framework import permissions


class IsNotBlockedTherapist(permissions.BasePermission):
    """
    Allows access only to non-blocked therapists.
    """

    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and not user.is_therapist_active:
            return False
        return True


class RegisterTherapistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        files = request.FILES
        try:
            user = request.user  

            if TherapistDetails.objects.filter(user=user).exists():
                return Response(
                    {
                        "success": False,
                        "message": "You have already submitted the form.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            therapist = TherapistDetails.objects.create(
                user=user,
                professionalTitle=data.get("professionalTitle"),
                yearsOfExperience=data.get("yearsOfExperience"),
                professionalLicenseNumber=data.get(
                    "professionalLicenseNumber"),
                licenseIssuingAuthority=data.get("licenseIssuingAuthority"),
                licenseExpiryDate=data.get("licenseExpiryDate"),
                degree=data.get("degree"),
                university=data.get("university"),
                yearOfGraduation=data.get("yearOfGraduation"),
                additionalCertifications=data.get("additionalCertifications"),
                governmentIssuedID=files.get("governmentIssuedID"),
                professionalLicense=files.get("professionalLicense"),
                educationalCertificate=files.get("educationalCertificate"),
                additionalCertificationDocument=files.get(
                    "additionalCertificationDocument"
                ),
                profile_image=files.get("profile_image"),
            )

            specializations = data.get(
                "specializations")  
            specializations_list = specializations.split(
                ",") 

            for spec_name in specializations_list:
                try:
                    specialization_obj = SpecializationsList.objects.get(
                        specialization=spec_name.strip()
                    )
                    Specializations.objects.create(
                        specialization=specialization_obj, therapist_details=therapist
                    )
                except SpecializationsList.DoesNotExist:
                    continue

            languages = data.getlist("languages")
            lang_data = languages[0].split(",")
            for lang in lang_data:
                Languages.objects.create(
                    therapist_details=therapist, languages=lang)

            admin_user = UserDetails.objects.filter(is_superuser=True).first()
            AdminNotification.objects.create(
                user=admin_user,
                title="New Therapist Request",
                message=f"New Therapist Request from {user.fullname} ",
                type="success",
                location=f"/therapistDetails/{therapist.id}",
            )

            return Response(
                {"success": True, "message": "form subimtted successfully"},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


class CheckRequestedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "therapist" and not getattr(user, "therapist_details", None):
            return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True}, status=status.HTTP_200_OK)


class CheckApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        therapist_details = getattr(user, "therapist_details", None)

        if therapist_details:
            return Response({"success": True}, status=status.HTTP_200_OK)

        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)


class GetProfileView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request):
        try:
            user = request.user
            details = TherapistDetails.objects.get(user=user)
            serializer = TherapistDetailsSerializer(details)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        except TherapistDetails.DoesNotExist:
            raise NotFound(
                detail="Therapist details not found for this user.", code=404
            )


class AddSlotView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def post(self, request):
        date = request.data.get("date")
        available_times = request.data.get("available_times")

        if date is None:
            return Response(
                {"message": "Please select a date"}, status=status.HTTP_400_BAD_REQUEST
            )
        if not available_times:
            return Response(
                {"message": "Please select a time"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            therapist_details = TherapistDetails.objects.get(user=request.user)
        except TherapistDetails.DoesNotExist:
            return Response(
                {"message": "Therapist details not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not therapist_details.specializations.exists():
            return Response(
                {
                    "message": "You have any specialization. Please add a specialization before creating slots."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_date_obj, created = AvailableDate.objects.get_or_create(
            date=date, user=request.user
        )

        for time_slot in available_times:
            time_value = time_slot.get("time")

            if AvailableTimes.objects.filter(
                date=available_date_obj, time=time_value
            ).exists():
                continue

            AvailableTimes.objects.create(
                time=time_value, date=available_date_obj)

        return Response(
            {"message": "New slots successfully created."},
            status=status.HTTP_201_CREATED,
        )


class GetAvailabilityView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        available_dates = AvailableDate.objects.filter(
            user=user, date__gte=today
        ).order_by("date")
        serializer = AvailableDateSerializer(available_dates, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class GetTherapistAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request):
        now = timezone.now()

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

                    wallet = Wallet.objects.get(user=session.client)
                    admin_wallet = Wallet.objects.get(user__is_staff=True)
                    admin_wallet.balance -= session.price
                    wallet.balance += session.price

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
                        user=session.client,
                        title="Refund from absent session",
                        message=f"You got {session.price} to yout wallet , because of therapist absent of session {session.id}",
                        type="success",
                        location="/appointments",
                    )
                else:
                    session.status = "Completed"
                session.save()

        user = request.user
        appointments = TherapySession.objects.filter(therapist=user).order_by(
            "-date__date", "-time__time"
        )

        serializer = TherapySessionSerializer(appointments, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class GetAvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.GET.get("date")
        if not date_str:
            return Response({"message": "Date parameter is required."}, status=400)

        try:
            selected_date = parse_date(date_str)
            if not selected_date:
                return Response({"message": "Invalid date format."}, status=400)

            available_date = AvailableDate.objects.get(
                date=selected_date, user=request.user
            )
            available_times = available_date.available_times.values(
                "id", "time", "is_booked"
            )

            return Response({"available_times": list(available_times)}, status=200)

        except AvailableDate.DoesNotExist:
            return Response({"available_times": []}, status=200)
        except Exception as e:
            return Response({"message": str(e)}, status=500)


class RemoveSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slot_id):
        try:
            time_slot = AvailableTimes.objects.get(
                id=slot_id, date__user=request.user)
            related_date = (
                time_slot.date
            )

            if time_slot.is_booked:
                return Response(
                    {"message": "This slot already booked, You can't remove"},
                    status=400,
                )

            time_slot.delete()

            if not related_date.available_times.exists():
                related_date.delete()

            return Response({"message": "Time slot removed successfully"}, status=200)

        except AvailableTimes.DoesNotExist:
            return Response({"message": "Time slot not found"}, status=404)
        except Exception as e:
            return Response({"message": str(e)}, status=500)


class UpdateTherapistProfile(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def put(self, request):
        data = request.data
        user = request.user
        print('data',data)

        try:
            details = TherapistDetails.objects.get(user=user)

            user.fullname = data.get("user[fullname]", user.fullname)
            user.age = data.get("user[age]", user.age)
            user.gender = data.get("user[gender]", user.gender)
            user.phone = data.get("user[phone]", user.phone)
            user.place = data.get("user[place]", user.place)

            details.professionalTitle = data.get(
                "professionalTitle", details.professionalTitle
            )
            details.yearsOfExperience = data.get(
                "yearsOfExperience", details.yearsOfExperience
            )
            details.professionalLicenseNumber = data.get(
                "professionalLicenseNumber", details.professionalLicenseNumber
            )
            details.licenseIssuingAuthority = data.get(
                "licenseIssuingAuthority", details.licenseIssuingAuthority
            )
            details.licenseExpiryDate = data.get(
                "licenseExpiryDate", details.licenseExpiryDate
            )
            details.degree = data.get("degree", details.degree)
            details.university = data.get("university", details.university)
            details.yearOfGraduation = data.get(
                "yearOfGraduation", details.yearOfGraduation
            )
            details.additionalCertifications = data.get(
                "additionalCertifications", details.additionalCertifications
            )

            details.profile_image = (
                request.FILES.getlist("profile_image")[0]
                if request.FILES.getlist("profile_image")
                else details.profile_image
            )
            details.governmentIssuedID = (
                request.FILES.getlist("governmentIssuedID")[0]
                if request.FILES.getlist("governmentIssuedID")
                else details.governmentIssuedID
            )
            details.professionalLicense = (
                request.FILES.getlist("professionalLicense")[0]
                if request.FILES.getlist("professionalLicense")
                else details.professionalLicense
            )
            details.educationalCertificate = (
                request.FILES.getlist("educationalCertificate")[0]
                if request.FILES.getlist("educationalCertificate")
                else details.educationalCertificate
            )
            details.additionalCertificationDocument = (
                request.FILES.getlist("additionalCertificationDocument")[0]
                if request.FILES.getlist("additionalCertificationDocument")
                else details.additionalCertificationDocument
            )
            details.status = "pending"
            details.save()
            user.save()

            Specializations.objects.filter(therapist_details=details).delete()
            specializations_data = []

            for key in data:
                if re.match(r"specializations\[\d+\]\[specialization\]", key):
                    specializations_data.append({"specialization": data[key]})

            for specialization in specializations_data:
                spec_name = specialization.get("specialization")

                try:
                    spec_obj = SpecializationsList.objects.get(
                        specialization=spec_name)

                    Specializations.objects.create(
                        therapist_details=details, specialization=spec_obj
                    )

                except SpecializationsList.DoesNotExist:
                    raise ValidationError(
                        f"There is not {spec_name} specialization, try another one"
                    )

            Languages.objects.filter(therapist_details=details).delete()
            languages_data = []
            for key in data:
                if re.match(r"languages\[\d+\]\[languages\]", key):
                    languages_data.append({"languages": data[key]})

            for language in languages_data:
                Languages.objects.create(
                    therapist_details=details, languages=language.get(
                        "languages")
                )
            admin_user = UserDetails.objects.filter(is_superuser=True).first()
            AdminNotification.objects.create(
                user=admin_user,
                title="Rerequest for therapist",
                message=f"{user.fullname} rerequested for therapist",
                type="success",
                location=f"/therapistDetails/{details.id}",
            )

            return Response(
                {"message": "form resubmitted successfully"}, status=status.HTTP_200_OK
            )

        except TherapistDetails.DoesNotExist:
            return Response(
                {"message": "Therapist details not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MakeCompleted(APIView):
    def patch(self, request):
        session_id = request.data.get("id")
        if not session_id:
            return Response(
                {"message": "Session ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = TherapySession.objects.get(id=session_id)
            if not session.therapist_attended:
                return Response(
                    {"message": "You Should Attend The Session"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not session.user_attended:
                return Response(
                    {"message": "Client Didn't Attend The Session"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            session.status = "Completed"
            session.save()

            therapist_share = session.price * 0.8 
            try:
                therapist_wallet = Wallet.objects.get(user=session.therapist)
            except Wallet.DoesNotExist:
                return Response(
                    {"message": "Wallet not found for therapist"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            therapist_wallet.balance += therapist_share
            therapist_wallet.save()

            TherapistTransaction.objects.create(
                wallet=therapist_wallet,
                transaction_type="CREDIT",
                amount=therapist_share,
                description=f"Earning from session #{session.id}",
            )
            TherapistNotification.objects.create(
                user=session.therapist,
                title=f"₹{therapist_share} Credited to Your Wallet",
                message=f"You've earned ₹{therapist_share} from session #{session.id}.",
                type="success",
                read=False,
                location="/earnings",
            )

            return Response({"message": "Session Completed"}, status=status.HTTP_200_OK)
        except TherapySession.DoesNotExist:
            return Response(
                {"message": "Session not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetTherapistInfo(APIView):
    def get(self, request, id):
        user = get_object_or_404(UserDetails, id=id)
        therapist = get_object_or_404(TherapistDetails, user=user)
        serializer = TherapistDetailsSerializer(therapist)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )


class GetUserInfo(APIView):
    def get(self, request, id):
        user = get_object_or_404(UserDetails, id=id)
        serializer = UserSerializer(user)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )


class RequestWithdrawalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        therapist = request.user
        amount = int(request.data.get("amount"))
        upi_id = request.data.get("upi_id")

        if therapist.role != "therapist":
            return Response(
                {"error": "Only therapists can request withdrawal."}, status=403
            )

        wallet = Wallet.objects.get(user=therapist)
        if wallet.wallet_amount < amount:
            return Response({"error": "Insufficient wallet balance."}, status=400)

        WithdrawalRequest.objects.create(
            therapist=therapist, amount=amount, upi_id=upi_id
        )
        wallet.wallet_amount -= amount
        wallet.save()

        return Response({"message": "Withdrawal request submitted."})


class GetWalletAmount(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            wallet = Wallet.objects.get(user=user)
            return Response(
                {
                    "data": {
                        "balance": wallet.balance,
                    }
                },
                status=status.HTTP_200_OK,
            )
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetTransactions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            wallet = Wallet.objects.get(user=user)
            transactions = wallet.therapist_transactions.all().order_by(
                "-created_at"
            )  # latest first
            serializer = WalletTransactionSerializer(transactions, many=True)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND
            )


class RequestWithdraw(APIView):
    def post(self, request):
        user = request.user
        amount = request.data.get("amount")
        upi_id = request.data.get("upi_id")

        min_amount_instance = MinimumWithdrawAmount.objects.first()
        min_amount = int(min_amount_instance.amount) if min_amount_instance else 0

        if amount < min_amount:
            return Response(
                {"message": f"Minimum withdrawal amount is ₹{min_amount}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


        WithdrawalRequest.objects.create(
            therapist=user, amount=amount, upi_id=upi_id)
        admin_user = UserDetails.objects.filter(is_superuser=True).first()
        therapist = TherapistDetails.objects.get(user=user)
        user = request.user

        AdminNotification.objects.create(
            user=admin_user,
            title="Withdraw Request",
            message=f"You have a withdrawal request of ₹{amount} from therapist {user.fullname if user.fullname else user.username}",
            type="success",
            location="/adminEarnings",
        )
        return Response(
            {"message": "Withdrawal request submitted successfully"},
            status=status.HTTP_201_CREATED,
        )


class GetAdmin(APIView):
    def get(self, request):
        admin = UserDetails.objects.get(is_superuser=True)
        data = model_to_dict(
            admin, fields=["id"]
        )  
        return Response({"data": data}, status=status.HTTP_200_OK)


def get_chat_history(request, sender_id, receiver_id):
    chats = AdminTherapistChat.objects.filter(
        sender_id__in=[sender_id, receiver_id], receiver_id__in=[
            sender_id, receiver_id]
    ).order_by("timestamp")

    chat_data = [
        {
            "sender": chat.sender.id,
            "receiver": chat.receiver.id,
            "message": chat.message,
            "timestamp": chat.timestamp.isoformat(),
        }
        for chat in chats
    ]

    return JsonResponse(chat_data, safe=False)


class ReportForTherapistDashboard(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request, therapist_id):
        now = timezone.now()
        today = now.date()
        current_year = today.year
        current_month = today.month

        therapist_sessions = TherapySession.objects.filter(
            therapist_id=therapist_id)

        total_completed_sessions = therapist_sessions.filter(
            status="Completed").count()
        today_completed = therapist_sessions.filter(
            status="Completed", date__date=today
        ).count()
        month_completed = therapist_sessions.filter(
            status="Completed",
            date__date__month=current_month,
            date__date__year=current_year,
        ).count()
        year_completed = therapist_sessions.filter(
            status="Completed", date__date__year=current_year
        ).count()
        total_scheduled = therapist_sessions.filter(status="Scheduled").count()
        total_cancelled = therapist_sessions.filter(status="Cancelled").count()

        todays_sessions = therapist_sessions.filter(date__date=today)
        today_sessions_data = []
        for session in todays_sessions:
            time_value = session.time.time
            client_name = session.client.fullname or session.client.username
            status = session.status.lower()

            today_sessions_data.append(
                {
                    "time": time_value.strftime("%I:%M %p") if time_value else "N/A",
                    "client": client_name,
                    "status": status,
                }
            )

        monthly_trend = []
        for month in range(1, 13):
            completed_count = therapist_sessions.filter(
                status="Completed",
                date__date__month=month,
                date__date__year=current_year,
            ).count()
            cancelled_count = therapist_sessions.filter(
                status="Cancelled",
                date__date__month=month,
                date__date__year=current_year,
            ).count()
            monthly_trend.append(
                {
                    "month": month_name[month][:3],
                    "completed": completed_count,
                    "cancelled": cancelled_count,
                }
            )

        therapist_wallets = Wallet.objects.filter(user=therapist_id)
        credit_transactions = WalletTransaction.objects.filter(
            transaction_type="CREDIT", wallet__in=therapist_wallets
        )

        total_revenue = credit_transactions.aggregate(
            total=Sum("amount"))["total"] or 0
        today_revenue = (
            credit_transactions.filter(created_at__date=today).aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )
        month_revenue = (
            credit_transactions.filter(
                created_at__year=current_year, created_at__month=current_month
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )
        year_revenue = (
            credit_transactions.filter(created_at__year=current_year).aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        monthly_revenue = []
        for month in range(1, 13):
            revenue = (
                credit_transactions.filter(
                    created_at__year=current_year, created_at__month=month
                ).aggregate(total=Sum("amount"))["total"]
                or 0
            )
            monthly_revenue.append(
                {"month": month_name[month][:3], "revenue": revenue})

        # Final data dictionary
        data = {
            "totalCompleted": total_completed_sessions,
            "todayCompleted": today_completed,
            "monthCompleted": month_completed,
            "yearCompleted": year_completed,
            "pending": total_scheduled,
            "cancelled": total_cancelled,
            "todaySessions": today_sessions_data,
            "sessionStatus": [
                {"name": "Completed", "value": total_completed_sessions},
                {"name": "Cancelled", "value": total_cancelled},
                {"name": "Scheduled", "value": total_scheduled},
            ],
            "monthlyTrend": monthly_trend,
            "revenue": {
                "total": total_revenue,
                "today": today_revenue,
                "month": month_revenue,
                "year": year_revenue,
                "monthlyRevenue": monthly_revenue,
            },
        }

        return JsonResponse(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    TherapistNotification.objects.filter(user=user, read=True).delete()
    notifications = TherapistNotification.objects.filter(
        user=user).order_by("-time")
    serializer = TherapistNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


class Get_total_rating(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "therapist":
            return JsonResponse({"error": "Unauthorized"}, status=403)

        sessions = TherapySession.objects.filter(
            therapist=request.user, rating__isnull=False
        )
        avg_rating = sessions.aggregate(avg_rating=Avg("rating"))[
            "avg_rating"] or 0

        return JsonResponse({"rate": avg_rating})


@login_required
def Therapist_protected_document_view(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404("File not found")

    return FileResponse(open(file_path, "rb"))


class MarkTherapistNotification(APIView):
    def patch(self, request):
        notification_id = request.data.get("id")

        if not notification_id:
            return Response(
                {"message": "Notification ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            notification = TherapistNotification.objects.get(
                id=notification_id, user=request.user
            )
            notification.read = True
            notification.save()
            return Response(
                {"message": "Notification marked as read."}, status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND
            )


class MarkAllTherapistNotifications(APIView):
    def patch(self, request):
        TherapistNotification.objects.filter(user=request.user, read=False).update(
            read=True
        )
        return Response(
            {"message": "All notifications marked as read."}, status=status.HTTP_200_OK
        )
