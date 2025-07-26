from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from therapist.models import TherapistDetails
from django.contrib.auth import get_user_model
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from users.models import *
from decouple import config
from django.core.mail import send_mail



User = get_user_model()
from datetime import date
class GetTherapistsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        therapists = TherapistDetails.objects.filter(
            user__availabilities__date__gte=today,
            user__availabilities__available_times__is_booked=False
        ).distinct()
        serializer = TherapistDetailsSerializer(therapists, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
 

class GetAllTherapist(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        therapists = TherapistDetails.objects.exclude(rejected = True)
        serializer = TherapistDetailsSerializer(therapists, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)



class GetTherapistsInformationView(APIView):
    # Uncomment this when authentication is needed
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        therapist = get_object_or_404(TherapistDetails, id=id)
        serializer = TherapistDetailsSerializer(therapist)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    


class GetUsersView(APIView):
    # Uncomment this when authentication is needed
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UsersSerializer(users, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    

class GetUserDetails(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        user = get_object_or_404(UserDetails, id=id)
        serializer = UsersSerializer(user)
        print(serializer.data)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
     
    

    


class ApproveTherapist(APIView):
    def patch(self, request, id):
        # Get the TherapistDetails instance using the ID sent from frontend
        therapist = get_object_or_404(TherapistDetails, id=id)

        # Access the related user and update the role
        user = therapist.user
        user.role = 'therapist'
        user.is_therapist = True
        user.save()
        email = user.email

        TherapistNotification.objects.create(
        user=therapist.user,
        title="Approved As Therapist",
        message="You have been approved as a therapist. Please relogin for enter therapist page",
        type="success",
        )
        login_url = os.getenv("BACKEND_URL", "").rstrip("/") + "/therapistLogin"
        send_mail(
            subject='Approved As Therapist',
            message=(
                f"Congratulations! Your account has been successfully approved as a therapist on our platform.\n\n"
                "You now have access to the therapist dashboard, where you can manage your availability, "
                "view appointments, and interact with clients.\n\n"
                f"To continue, please log in again using the following link:\n{login_url}\n\n"
                "Thank you for joining our platform. We're excited to have you on board!"
            ),
            from_email=config('EMAIL_HOST_USER'),
            recipient_list=[user.email],
            fail_silently=False
        )

        return Response({"success": True}, status=status.HTTP_200_OK)
    


class RejectTherapist(APIView):
    def patch(self, request, id):
        therapist = get_object_or_404(TherapistDetails, id=id)
        therapist.rejected = True
        therapist.save()  

        return Response({
            "success": True,
            "message": f"Rejected {therapist.fullname}'s request"  
        }, status=status.HTTP_200_OK)    
    

class SpecializationsView(APIView):
    def get(self, request):
        specializations = SpecializationsList.objects.all()
        serializer = SpecializationsListSerializer(specializations, many=True)
        return Response({
            'message': 'Specializations fetched successfully',
            'specializations': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SpecializationsListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Specialization created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        specialization = get_object_or_404(SpecializationsList, id=id)
        specialization.delete()
        return Response({'message': 'Specialization deleted successfully'}, status=status.HTTP_200_OK)
    
    def patch(self, request, id):
        specialization = get_object_or_404(SpecializationsList, id=id)
        serializer = SpecializationsListSerializer(specialization, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Specialization updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ChangeTherapistStatus(APIView):
    def patch(self, request, id):
        therapist = get_object_or_404(TherapistDetails, id=id)
        user = get_object_or_404(UserDetails, id = therapist.user.id )

        user.is_therapist_active = not user.is_therapist_active
        user.save()
        

        return Response({'message': 'status changed'}, status=status.HTTP_200_OK)

 
class ChangeUserStatus(APIView):
    def patch(self, request, id):
        user = get_object_or_404(UserDetails, id=id)

        user.is_user_active = not user.is_user_active
        user.save()
        

        return Response({'message': 'status changed'}, status=status.HTTP_200_OK)
    




class GetTherapistWithdrawRequestsView(APIView):

    def get(self, request):
        requests = WithdrawalRequest.objects.all().order_by('-created_at')
        serializer = TherapistWithdrawalRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetClientWithdrawRequestsView(APIView):

    def get(self, request):
        requests = ClientWithdrawalRequest.objects.all().order_by('-created_at')
        serializer = ClientWithdrawalRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProcessTherapistWithdraw(APIView):
    def patch(self, request, id):
        try:
            withdrawal = WithdrawalRequest.objects.get(pk=id)

            if withdrawal.is_processed:
                return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

            wallet = Wallet.objects.get(user = withdrawal.therapist)
            wallet.balance -= withdrawal.amount
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='DEBIT',
                amount=withdrawal.amount,
                description=f"Withdrawal of ₹{withdrawal.amount} to {withdrawal.upi_id}"
            )

            withdrawal.is_processed = True
            withdrawal.processed_at = now()
            withdrawal.save()

            TherapistNotification.objects.create(
                user=withdrawal.therapist,
                title=f" Withdraw Approved",
                message=f"Your withdraw request of ₹{withdrawal.amount} has been processed and credited to your UPI ID {withdrawal.upi_id}",
                type="success",
                read=False,
                location="/earnings"
            )

            return Response({"message": "Withdrawal request processed successfully."}, status=status.HTTP_200_OK)

        except WithdrawalRequest.DoesNotExist:
            return Response({"error": "Withdrawal request not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ProcessClientWithdraw(APIView):
    def patch(self, request, id):
        try:
            withdrawal = ClientWithdrawalRequest.objects.get(pk=id)

            if withdrawal.is_processed:
                return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

            wallet = Wallet.objects.get(user = withdrawal.client)
            wallet.balance -= withdrawal.amount
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='DEBIT',
                amount=withdrawal.amount,
                description=f"Withdrawal of ₹{withdrawal.amount} to {withdrawal.upi_id}"
            )

            withdrawal.is_processed = True
            withdrawal.processed_at = now()
            withdrawal.save()

            Notification.objects.create(
                user=withdrawal.client,
                title=f" Withdraw Approved",
                message=f"Your withdraw request of ₹{withdrawal.amount} has been processed and credited to your UPI ID {withdrawal.upi_id}",
                type="success",
                read=False,
                location="/wallet"
            )

            return Response({"message": "Withdrawal request processed successfully."}, status=status.HTTP_200_OK)

        except WithdrawalRequest.DoesNotExist:
            return Response({"error": "Withdrawal request not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

from django.db.models import Sum, Count

class ReportForAdminDashboard(APIView):
    def get(self,request):
        today = now().date()
        current_year = today.year
        current_month = today.month

        total_sessions = TherapySession.objects.count()
        scheduled_sessions = TherapySession.objects.filter(status='Scheduled').count()
        completed_sessions = TherapySession.objects.filter(status='Completed').count()
        cancelled_sessions = TherapySession.objects.filter(status='Cancelled').count()

        today_scheduled = TherapySession.objects.filter(status='Scheduled', date__date=today).count()
        today_completed = TherapySession.objects.filter(status='Completed', date__date=today).count()
        today_cancelled = TherapySession.objects.filter(status='Cancelled', date__date=today).count()

        today_total = today_scheduled + today_completed
        completion_rate = (today_completed / today_total) * 100 if today_total > 0 else 0

        month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_sessions = []
        for i in range(1, 13):
            count = TherapySession.objects.filter(date__date__year=current_year, date__date__month=i).count()
            monthly_sessions.append({
                'month': month_labels[i - 1],
                'sessions': count
            })

        superuser_wallets = Wallet.objects.filter(user__is_superuser=True)
        total_revenue = WalletTransaction.objects.filter(
            transaction_type='CREDIT',
            wallet__in=superuser_wallets
            ).aggregate(total=Sum('amount'))['total'] or 0
        today_revenue = WalletTransaction.objects.filter(
            transaction_type='CREDIT',
            wallet__in=superuser_wallets,
            created_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0

        month_revenue = WalletTransaction.objects.filter(
            transaction_type='CREDIT',
            wallet__in=superuser_wallets,
            created_at__year=current_year,
            created_at__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0

        year_revenue = WalletTransaction.objects.filter(
            transaction_type='CREDIT',
            wallet__in=superuser_wallets,
            created_at__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_users = User.objects.filter(is_therapist=False).count()
        total_therapists = User.objects.filter(is_therapist=True).count()
        new_users_today = User.objects.filter(is_therapist=False, date_joined__date=today).count()
        new_users_month = User.objects.filter(is_therapist=False, date_joined__year=current_year, date_joined__month=current_month).count()
        new_users_year = User.objects.filter(is_therapist=False, date_joined__year=current_year).count()
        blocked_users = User.objects.filter(is_therapist=False, is_user_active=False).count()
        blocked_therapists = User.objects.filter(is_therapist=True, is_therapist_active=False).count()

        therapist_most_sessions = (
            TherapySession.objects.filter(status='Completed')
            .values('therapist__id', 'therapist__therapist_details__fullname')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        therapist_least_sessions = (
            TherapySession.objects.filter(status='Completed')
            .values('therapist__id', 'therapist__therapist_details__fullname')
            .annotate(count=Count('id'))
            .order_by('count')[:5]
        )

        therapist_most_cancelled = (
            TherapySession.objects.filter(status='Cancelled')
            .values('therapist__id', 'therapist__therapist_details__fullname')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        therapist_most_revenue = (
            WalletTransaction.objects.filter(transaction_type='CREDIT', wallet__user__is_therapist=True)
            .values('wallet__user__id', 'wallet__user__username')
            .annotate(amount=Sum('amount'))
            .order_by('-amount')[:5]
        )

        # Clients with most completed sessions
        client_most_sessions = (
            TherapySession.objects.filter(status='Completed')
            .values('client__id', 'client__username')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )


        # Clients with most cancelled sessions
        client_most_cancelled = (
            TherapySession.objects.filter(status='Cancelled')
            .values('client__id', 'client__username')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )


        
        data = {
            'sessionStats':{
                'total_sessions': total_sessions,
                'scheduled': scheduled_sessions,
                'completed': completed_sessions,
                'cancelled': cancelled_sessions,
                'today': {
                    'scheduled': today_scheduled,
                    'completed': today_completed,
                    'cancelled': today_cancelled,
                    'completionRate': completion_rate
                }
            },
            'monthlySessions':monthly_sessions,
            'revenue': {
                'total': total_revenue,
                'today': today_revenue,
                'month': month_revenue,
                'year': year_revenue,
            },
            'users': {
                'total': total_users,
                'therapists': total_therapists,
                'new': {
                    'today': new_users_today,
                    'month': new_users_month,
                    'year': new_users_year
                },
                'blocked': {
                    'users': blocked_users,
                    'therapists': blocked_therapists
                }
            },
            'topPerformers':{
                'therapists':{
                    "mostSessions": therapist_most_sessions,
                    'leastSessions': therapist_least_sessions,
                    'mostRevenue': therapist_most_revenue,
                    'mostCancelled': therapist_most_cancelled,
                },
                'clients':{
                    'mostSessions': client_most_sessions,
                    'mostCancelled': client_most_cancelled 
                }
            }
        }
        return Response(data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser  # Optional

from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from django.utils.timezone import localtime

class Sessions(APIView):
    def get(self, request):

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

        sessions = TherapySession.objects.select_related('client', 'therapist', 'date', 'time')

        data = []
        for session in sessions:
            data.append({
                'id': session.id,  # Use actual DB id
                'clientName': session.client.fullname or session.client.username,
                'therapistName': session.therapist.fullname or session.therapist.username,
                'dateTime': f"{session.date.date} {session.time.time.strftime('%H:%M')}",
                'sessionType': session.session_mode,
                'price': f"${session.price}",
                'status': session.status,
                'feedback': session.feedback,
                'rating': session.rating,
                'cancelReason': session.cancel_reason
            })

        return Response(data)


     
from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    AdminNotification.objects.filter(user=user, read=True).delete()
    notifications = AdminNotification.objects.filter(user=user).order_by('-time')
    serializer = AdminNotificationSerializer(notifications, many=True)
    return Response(serializer.data)   

from django.http import FileResponse, Http404
from django.contrib.auth.decorators import login_required
import os
from django.conf import settings


@login_required
def protected_document_view(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404("File not found")

    return FileResponse(open(file_path, 'rb'))


class MarkAdminNotification(APIView):
    def patch(self,request):      
            notification_id = request.data.get('id')

            if not notification_id:
                return Response({"message": "Notification ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                notification = AdminNotification.objects.get(id=notification_id, user=request.user)
                notification.read = True
                notification.save()
                return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
            

class MarkAllAdminNotifications(APIView):
    def patch(self, request):
        AdminNotification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)