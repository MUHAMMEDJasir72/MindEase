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
        # ✅ Only block if user is therapist and is blocked
        if user.is_authenticated and not user.is_therapist_active:
            return False
        return True
    


class RegisterTherapistView(APIView):
    def post(self, request):
        data = request.data
        files = request.FILES

        try:
            user = request.user  # Or fetch manually if needed
            
            therapist = TherapistDetails.objects.create(
                user=user,
                fullname=data.get('fullname'),
                dateOfBirth=data.get('dateOfBirth'),
                gender=data.get('gender'),
                phone=data.get('phone'),
                state=data.get('state'),
                country=data.get('country'),
                address=data.get('address'),
                professionalTitle=data.get('professionalTitle'),
                yearsOfExperience=data.get('yearsOfExperience'),
                professionalLicenseNumber=data.get('professionalLicenseNumber'),
                licenseIssuingAuthority=data.get('licenseIssuingAuthority'),
                licenseExpiryDate=data.get('licenseExpiryDate'),
                degree=data.get('degree'),
                university=data.get('university'),
                yearOfGraduation=data.get('yearOfGraduation'),
                additionalCertifications=data.get('additionalCertifications'),
                governmentIssuedID=files.get('governmentIssuedID'),
                professionalLicense=files.get('professionalLicense'),
                educationalCertificate=files.get('educationalCertificate'),
                additionalCertificationDocument=files.get('additionalCertificationDocument'),
                profile_image=files.get('profile_image'),
            )

         

            # Save many-to-one specializations
            specializations = data.getlist('specializations')
            spec_data = specializations[0].split(',')
            for spec in spec_data:
                Specializations.objects.create(therapist_details=therapist, specializations=spec)

            
            languages = data.getlist('languages')
            lang_data = languages[0].split(',')
            for lang in lang_data:
                Languages.objects.create(therapist_details=therapist, languages=lang)

            admin_user = UserDetails.objects.filter(is_superuser=True).first()
            AdminNotification.objects.create(
            user=admin_user,
            title="New Therapist Request",
            message=f"New Therapist Request from {therapist.fullname} ",
            type="success",
            location=f"/therapistDetails/{therapist.id}"

            )

            return Response({'success': True, "message":"form subimtted successfully"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print('Error:', e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)






class CheckRequestedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'therapist' and not getattr(user, 'therapist_details', None):
            return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True}, status=status.HTTP_200_OK)



        
class CheckApproveView(APIView):
    # Uncomment this when ready to use authentication
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        therapist_details = getattr(user, 'therapist_details', None)

        if therapist_details:
            return Response({"success": True}, status=status.HTTP_200_OK)

        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.exceptions import NotFound

class GetProfileView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request):
        try:
            user = request.user
            details = TherapistDetails.objects.get(user=user)
            serializer = TherapistDetailsSerializer(details)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except TherapistDetails.DoesNotExist:
            raise NotFound(detail="Therapist details not found for this user.", code=404)




# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import AvailableDate, AvailableTimes

class AddSlotView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def post(self, request):
        date = request.data.get('date')
        available_times = request.data.get('available_times')
        
        
        if date is None:
            return Response({'message': "Please select a date"}, status=status.HTTP_400_BAD_REQUEST)
        if not available_times:
            return Response({'message': "Please select a time"}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming the user is authenticated
        user = request.user

        # Check if the date already exists for the user
        available_date_obj, created = AvailableDate.objects.get_or_create(date=date, user=user)

        for time_slot in available_times:
            time_value = time_slot.get('time')

            if AvailableTimes.objects.filter(date=available_date_obj, time=time_value).exists():
                continue

            # Save the time slot
            AvailableTimes.objects.create(
                time=time_value,
                date=available_date_obj
            )

        return Response({"message": f"New slots successfully created."}, status=status.HTTP_201_CREATED)
        

from datetime import date
from .serializers import AvailableDateSerializer

from django.utils import timezone

class GetAvailabilityView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        available_dates = AvailableDate.objects.filter(user=user, date__gte=today).order_by('date')
        serializer = AvailableDateSerializer(available_dates, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    


from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q


from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q
from django.utils.timezone import localtime

class GetTherapistAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]

    def get(self, request):
        now = timezone.now()

        sessions = TherapySession.objects.filter(status='Scheduled')

        for session in sessions:
            # Get naive datetime from date and time foreign keys
            naive_session_datetime = datetime.combine(session.date.date, session.time.time)

            # Convert to timezone-aware datetime
            session_datetime = timezone.make_aware(naive_session_datetime, timezone.get_current_timezone())
      

            now = localtime(timezone.now())  # This converts to your current timezone (e.g., IST)

        
            if now > session_datetime + timedelta(hours=1):
                if not session.user_attended and not session.therapist_attended:
                    session.status = 'No Show - Both'
                elif not session.user_attended:
                    session.status = 'Absent - Client'
                elif not session.therapist_attended:
                    session.status = 'Absent - Therapist'
                else:
                    session.status = 'Completed'
                session.save()

        user = request.user
        appointments = TherapySession.objects.filter(therapist=user).order_by('-date__date', '-time__time')

        serializer = TherapySessionSerializer(appointments, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)





from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .models import AvailableDate
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date

class GetAvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.GET.get('date')
        if not date_str:
            return Response({'message': 'Date parameter is required.'}, status=400)

        try:
            selected_date = parse_date(date_str)
            if not selected_date:
                return Response({'message': 'Invalid date format.'}, status=400)

            available_date = AvailableDate.objects.get(date=selected_date, user=request.user)
            available_times = available_date.available_times.values('id', 'time', 'is_booked')
            
            return Response({'available_times': list(available_times)}, status=200)

        except AvailableDate.DoesNotExist:
            return Response({'available_times': []}, status=200)
        except Exception as e:
            return Response({'message': str(e)}, status=500)


       

# views.py
class RemoveSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slot_id):
        try:
            time_slot = AvailableTimes.objects.get(id=slot_id, date__user=request.user)
            related_date = time_slot.date  # Store the related date before deleting the time slot

            # Prevent removal if already booked
            if time_slot.is_booked:
                return Response({"message": "This slot already booked, You can't remove"}, status=400)

            time_slot.delete()

            # Check if the related date has any more time slots
            if not related_date.available_times.exists():
                related_date.delete()

            return Response({'message': 'Time slot removed successfully'}, status=200)

        except AvailableTimes.DoesNotExist:
            return Response({'message': 'Time slot not found'}, status=404)
        except Exception as e:
            return Response({'message': str(e)}, status=500)

from rest_framework.response import Response
from rest_framework import status
from .models import TherapistDetails, Specializations, Languages
import re

class UpdateTherapistProfile(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]
    def put(self, request):
        data = request.data
        user = request.user

        try:
            details = TherapistDetails.objects.get(user=user)

            # Update simple fields
            details.fullname = data.get('fullname', details.fullname)
            details.dateOfBirth = data.get('dateOfBirth', details.dateOfBirth)
            details.gender = data.get('gender', details.gender)
            details.phone = data.get('phone', details.phone)
            details.state = data.get('state', details.state)
            details.country = data.get('country', details.country)
            details.address = data.get('address', details.address)
            details.professionalTitle = data.get('professionalTitle', details.professionalTitle)
            details.yearsOfExperience = data.get('yearsOfExperience', details.yearsOfExperience)
            details.professionalLicenseNumber = data.get('professionalLicenseNumber', details.professionalLicenseNumber)
            details.licenseIssuingAuthority = data.get('licenseIssuingAuthority', details.licenseIssuingAuthority)
            details.licenseExpiryDate = data.get('licenseExpiryDate', details.licenseExpiryDate)
            details.degree = data.get('degree', details.degree)
            details.university = data.get('university', details.university)
            details.yearOfGraduation = data.get('yearOfGraduation', details.yearOfGraduation)
            details.additionalCertifications = data.get('additionalCertifications', details.additionalCertifications)


            details.profile_image = request.FILES.getlist('profile_image')[0] if request.FILES.getlist('profile_image') else details.profile_image
            details.governmentIssuedID = request.FILES.getlist('governmentIssuedID')[0] if request.FILES.getlist('governmentIssuedID') else details.governmentIssuedID
            details.professionalLicense = request.FILES.getlist('professionalLicense')[0] if request.FILES.getlist('professionalLicense') else details.professionalLicense
            details.educationalCertificate = request.FILES.getlist('educationalCertificate')[0] if request.FILES.getlist('educationalCertificate') else details.educationalCertificate
            details.additionalCertificationDocument = request.FILES.getlist('additionalCertificationDocument')[0] if request.FILES.getlist('additionalCertificationDocument') else details.additionalCertificationDocument


            details.save()

            # Clear and recreate specializations
            Specializations.objects.filter(therapist_details=details).delete()
            specializations_data = []
            for key in data:
                if re.match(r"specializations\[\d+\]\[specializations\]", key):
                    specializations_data.append({'specializations': data[key]})

            for specialization in specializations_data:
                Specializations.objects.create(
                    therapist_details=details,
                    specializations=specialization.get('specializations')
                )

            # Clear and recreate languages
            Languages.objects.filter(therapist_details=details).delete()
            languages_data = []
            for key in data:
                if re.match(r"languages\[\d+\]\[languages\]", key):
                    languages_data.append({'languages': data[key]})

            for language in languages_data:
                Languages.objects.create(
                    therapist_details=details,
                    languages=language.get('languages')
                )

            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

        except TherapistDetails.DoesNotExist:
            return Response({"message": "Therapist details not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(str(e))  # <--- Add this line
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)




class MakeCompleted(APIView):
    def patch(self, request):
        session_id = request.data.get('id')
        if not session_id:
            return Response({"message": "Session ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = TherapySession.objects.get(id=session_id)
            if not session.therapist_attended:
                return Response({"message": "You Should Attend The Session"}, status=status.HTTP_404_NOT_FOUND)
            if not session.user_attended:
                return Response({"message": "Client Didn't Attend The Session"}, status=status.HTTP_404_NOT_FOUND)
            
            session.status = 'Completed'
            session.save()

            therapist_share = session.price * 0.8 #find 80%, admin getting 20%
            try:
                therapist_wallet = Wallet.objects.get(user=session.therapist)
            except Wallet.DoesNotExist:
                return Response({"message": "Wallet not found for therapist"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            therapist_wallet.balance += therapist_share
            therapist_wallet.save()

            WalletTransaction.objects.create(
                wallet=therapist_wallet,
                transaction_type='CREDIT',
                amount=therapist_share,
                description=f"Earning from session #{session.id}"
            )
            TherapistNotification.objects.create(
                user=session.therapist,
                title=f"₹{therapist_share} Credited to Your Wallet",
                message=f"You've earned ₹{therapist_share} from session #{session.id}.",
                type="success",
                read=False,
                location="/earnings"
            )
            
            return Response({"message": "Session Completed"}, status=status.HTTP_200_OK)
        except TherapySession.DoesNotExist:
            return Response({"message": "Session not found"}, status=status.HTTP_404_NOT_FOUND)



class GetTherapistInfo(APIView):
    def get(self,request,id):
        user = get_object_or_404(UserDetails, id=id)
        therapist = get_object_or_404(TherapistDetails, user = user)
        serializer = TherapistDetailsSerializer(therapist)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    


from users.serializers import UserSerializer

class GetUserInfo(APIView):
    def get(self,request,id):
        user = get_object_or_404(UserDetails, id=id)
        serializer = UserSerializer(user)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    

class RequestWithdrawalAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        therapist = request.user
        amount = int(request.data.get("amount"))
        upi_id = request.data.get("upi_id")

        if therapist.role != "therapist":
            return Response({"error": "Only therapists can request withdrawal."}, status=403)

        wallet = Wallet.objects.get(user=therapist)
        if wallet.wallet_amount < amount:
            return Response({"error": "Insufficient wallet balance."}, status=400)

        WithdrawalRequest.objects.create(
            therapist=therapist,
            amount=amount,
            upi_id=upi_id
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
            return Response({
                "data": {
                    "balance": wallet.balance,
                }
            }, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response({
                "error": "Wallet not found"
            }, status=status.HTTP_404_NOT_FOUND)

class GetTransactions(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            wallet = Wallet.objects.get(user=user)
            transactions = wallet.transactions.all().order_by('-created_at')  # latest first
            serializer = WalletTransactionSerializer(transactions, many=True)
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response({
                "error": "Wallet not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
class RequestWithdraw(APIView):
    def post(self,request):
        user = request.user
        amount = request.data.get('amount')
        upi_id = request.data.get('upi_id')

        if amount < 500:
            return Response({"message": "Minimum withdrawal amount is ₹500."}, status=status.HTTP_400_BAD_REQUEST)

        WithdrawalRequest.objects.create(
                therapist=user,
                amount=amount,
                upi_id=upi_id
            )
        admin_user = UserDetails.objects.filter(is_superuser=True).first()
        therapist= TherapistDetails.objects.get(user=user)

        AdminNotification.objects.create(
        user=admin_user,
        title="Withdraw Request",
        message=f"You have a withdrawal request of ₹{amount} from therapist {therapist.fullname if therapist.fullname else user.username}",
        type="success",
        location="/adminEarnings"

        )
        return Response({'message': 'Withdrawal request submitted successfully'}, status=status.HTTP_201_CREATED)

from django.forms.models import model_to_dict

class GetAdmin(APIView):
    def get(self, request):
        admin = UserDetails.objects.get(is_superuser=True)
        data = model_to_dict(admin, fields=['id'])  # Pass the model instance, not admin.id
        return Response({'data': data}, status=status.HTTP_200_OK)


def get_chat_history(request, sender_id, receiver_id):
    chats = AdminTherapistChat.objects.filter(
        sender_id__in=[sender_id, receiver_id],
        receiver_id__in=[sender_id, receiver_id]
    ).order_by('timestamp')

    chat_data = [{
        'sender': chat.sender.id,
        'receiver': chat.receiver.id,
        'message': chat.message,
        'timestamp': chat.timestamp.isoformat(),
    } for chat in chats]


    return JsonResponse(chat_data, safe=False)

from calendar import month_name
from django.db.models import Sum, Count

class ReportForTherapistDashboard(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedTherapist]
    def get(self,request,therapist_id):
        now = timezone.now()
        today = now.date()
        current_year = today.year
        current_month = today.month

        therapist_sessions = TherapySession.objects.filter(therapist_id=therapist_id)

        # Session counts
        total_completed_sessions = therapist_sessions.filter(status='Completed').count()
        today_completed = therapist_sessions.filter(status='Completed', date__date=today).count()
        month_completed = therapist_sessions.filter(status='Completed', date__date__month=current_month, date__date__year=current_year).count()
        year_completed = therapist_sessions.filter(status='Completed', date__date__year=current_year).count()
        total_scheduled = therapist_sessions.filter(status='Scheduled').count()
        total_cancelled = therapist_sessions.filter(status='Cancelled').count()

        # Today's sessions
        todays_sessions = therapist_sessions.filter(date__date=today)
        today_sessions_data = []
        for session in todays_sessions:
            time_value = session.time.time  # from AvailableTimes
            client_name = session.client.fullname or session.client.username
            status = session.status.lower()

            today_sessions_data.append({
                'time': time_value.strftime('%I:%M %p') if time_value else 'N/A',
                'client': client_name,
                'status': status
            })

        # Monthly trend data
        monthly_trend = []
        for month in range(1, 13):
            completed_count = therapist_sessions.filter(
                status='Completed',
                date__date__month=month,
                date__date__year=current_year
            ).count()
            cancelled_count = therapist_sessions.filter(
                status='Cancelled',
                date__date__month=month,
                date__date__year=current_year
            ).count()
            monthly_trend.append({
                'month': month_name[month][:3],
                'completed': completed_count,
                'cancelled': cancelled_count
            })

        # Revenue calculations
        therapist_wallets = Wallet.objects.filter(user=therapist_id)
        credit_transactions = WalletTransaction.objects.filter(
            transaction_type='CREDIT',
            wallet__in=therapist_wallets
        )

        total_revenue = credit_transactions.aggregate(total=Sum('amount'))['total'] or 0
        today_revenue = credit_transactions.filter(created_at__date=today).aggregate(total=Sum('amount'))['total'] or 0
        month_revenue = credit_transactions.filter(created_at__year=current_year, created_at__month=current_month).aggregate(total=Sum('amount'))['total'] or 0
        year_revenue = credit_transactions.filter(created_at__year=current_year).aggregate(total=Sum('amount'))['total'] or 0

        monthly_revenue = []
        for month in range(1, 13):
            revenue = credit_transactions.filter(
                created_at__year=current_year,
                created_at__month=month
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_revenue.append({
                'month': month_name[month][:3],
                'revenue': revenue
            })

        # Final data dictionary
        data = {
            'totalCompleted': total_completed_sessions,
            'todayCompleted': today_completed,
            'monthCompleted': month_completed,
            'yearCompleted': year_completed,
            'pending': total_scheduled,
            'cancelled': total_cancelled,
            'todaySessions': today_sessions_data,
            'sessionStatus': [
                { 'name': 'Completed', 'value': total_completed_sessions },
                { 'name': 'Cancelled', 'value': total_cancelled },
                { 'name': 'Scheduled', 'value': total_scheduled },
            ],
            'monthlyTrend': monthly_trend,
            'revenue': {
                'total': total_revenue,
                'today': today_revenue,
                'month': month_revenue,
                'year': year_revenue,
                'monthlyRevenue': monthly_revenue
            }
        }

        return JsonResponse(data)

from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    Notification.objects.filter(user=user, read=True).delete()
    notifications = TherapistNotification.objects.filter(user=user).order_by('-time')
    serializer = TherapistNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


from django.db.models import Avg

class Get_total_rating(APIView):
    def get(self,request):
        if request.user.role != 'therapist':
                return JsonResponse({'error': 'Unauthorized'}, status=403)

        sessions = TherapySession.objects.filter(
            therapist=request.user, 
            rating__isnull=False
        )
        avg_rating = sessions.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0

        return JsonResponse({'rate': avg_rating})
    


from django.http import FileResponse, Http404
from django.contrib.auth.decorators import login_required
import os
from django.conf import settings
@login_required
def Therapist_protected_document_view(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404("File not found")

    return FileResponse(open(file_path, 'rb'))


class MarkTherapistNotification(APIView):
    def patch(self,request):      
            notification_id = request.data.get('id')

            if not notification_id:
                return Response({"message": "Notification ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                notification = TherapistNotification.objects.get(id=notification_id, user=request.user)
                notification.read = True
                notification.save()
                return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
            

class MarkAllTherapistNotifications(APIView):
    def patch(self, request):
        TherapistNotification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)
