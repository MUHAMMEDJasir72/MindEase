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

from .serializers import *
from .models import *
from therapist.models import AvailableDate, AvailableTimes, TherapistDetails


from rest_framework import permissions

class IsNotBlockedUser(permissions.BasePermission):
    """
    Allows access only to non-blocked therapists.
    """

    def has_permission(self, request, view):
        user = request.user
        # ✅ Only block if user is therapist and is blocked
        if user.is_authenticated and not user.is_user_active:
            return False
        return True

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


User = get_user_model()
from decouple import config
class RegisterUserView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        username = request.data.get('username', '').strip()
        
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)


        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        
        if TemporaryUser.objects.filter(email=email).exists():
            return Response({"error": "User already pending verification"}, status=400)

        otp_code = random.randint(100000, 999999)

        TemporaryUser.objects.create(
            email=email,
            username=username,
            password=password,  # or hash it if preferred
            otp=otp_code
        )
        
        send_mail(
            'Your MindEase Verification Code',
            f'''Dear User,\n\nYour One-Time Password (OTP) for MindEase is:\n**{otp_code}**\n\nThis code expires in 5 minutes.
                Please do not share it with anyone.\n\nIf you didn’t request this code, please secure your account by changing your password immediately or contacting our support team at [jasirsnr72@gmail.com].\n\nThank you,\nThe MindEase Team''',
            config('EMAIL_HOST_USER'),
            [email],
            fail_silently=False
        )
     

        return Response({"message": "User registered successfully. Please verify your OTP."}, status=status.HTTP_201_CREATED)
    


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class TokenObtainPairViews(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer




class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh") 
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)



class VerifyOtp(APIView):
    def post(self, request):
        user_otp = request.data.get('otp')
        email = request.data.get('email')

        if not email or not user_otp:
            return Response({"message": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            temp_user = TemporaryUser.objects.get(email=email, otp=user_otp)
        except TemporaryUser.DoesNotExist:
            return Response({"message": "Invalid OTP"}, status=400)

        if temp_user.is_otp_expired():
            return Response({"message": "OTP has expired. Please request a new one."}, status=400)

        # Create real user
        User.objects.create_user(email=temp_user.email, username=temp_user.username, password=temp_user.password)

        # Optionally delete temp user
        temp_user.delete()

        return Response({"message": "OTP verified successfully"}, status=200)


class ResendOtp(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"message": "Email not found"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, email=email)

        if not user:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        otp_code = random.randint(100000, 999999)
        user.otp_code = otp_code
        user.otp_created_at = now()
        user.save()


        send_mail(
            'Your OTP Code',
            f'Your OTP code is {otp_code}',
            config('EMAIL_HOST_USER'),
            [email],
            fail_silently=False
        )

        return Response({"message": "New OTP sent to your email."}, status=status.HTTP_200_OK)
    
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            old_refresh = RefreshToken(refresh_token)

            # Get user from user_id in token payload
            user_id = old_refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)

            # Create new rotated refresh token
            new_refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(new_refresh.access_token),
                "refresh": str(new_refresh)
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProfileView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]

    def get(self, request):
        user = request.user
        profile_data = {
            "username": user.username,
            "email": user.email,
            "fullname":user.fullname,
            "age":user.age,
            'place':user.place,
            'gender':user.gender,
            'language':user.language,
            'phone':user.phone,
            'profile_image': user.profile_image.url if user.profile_image else None,


        }
        return Response({"success": True, "profile_info": profile_data})
    
    def patch(self, request):
        user = request.user
        data = request.data

        # Update allowed fields only
        allowed_fields = ["fullname", "age", "phone", "place", "gender", "language"]
        for field in allowed_fields:
            if field in data:
                if hasattr(user, field):
                    setattr(user, field, data[field])
        user.save()
    
        return Response({"success": True, "message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
    


class ProfileImageUpdateView(APIView):
    # permission_classes = [IsAuthenticated]

    def patch(self, request):
        print("yws working")
        user = request.user
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
            user.save()
            return Response({'success': True, 'profile_image': user.profile_image.url, 'message': 'Profile image updated successfully!'}, status=status.HTTP_200_OK)
        return Response({'success': False, 'message': 'No image uploaded'}, status=status.HTTP_400_BAD_REQUEST)



class VerifyPasswordView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        typed_password = request.data.get('password')
        if typed_password and request.user.check_password(typed_password):
            return Response({'success': True}, status=status.HTTP_200_OK)
        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)
    
    
from django.core.exceptions import ObjectDoesNotExist


class ChangeForgotPasswordView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get('password')
        user_email = request.data.get('email')
        
        if not new_password or not user_email:
            return Response({'success': False, 'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=user_email)
        except ObjectDoesNotExist:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        return Response({'success': True, 'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
    
    
    
class ChangePassword(APIView):
    def post(self,request):
        new_password = request.data.get('password')
        if not new_password:
            return Response({'success': False, 'message': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({'success': True, 'message': 'Password updated successfully'}, status=status.HTTP_200_OK)


    

class VerifyEmailView(APIView):
    def post(self, request):
        entered_email = request.data.get('email', '').strip()

        if not entered_email:
            return Response({'success': False, 'message': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=entered_email)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Email not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 6-digit OTP
        otp_code = random.randint(100000, 999999)

        # Send OTP email
        send_mail(
            'Your OTP Code',
            f'Your OTP code is {otp_code}',
            config('EMAIL_HOST_USER'),  # Replace with a real no-reply email in production
            [entered_email],
            fail_silently=False
        )

        # Save OTP and timestamp
        user.otp_code = str(otp_code)
        user.otp_created_at = now()
        user.save()

        return Response({'success': True, 'message': 'OTP has been sent to your email.'}, status=status.HTTP_200_OK)
    

class CreateAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]
    def post(self, request):
        data = request.data
        client = request.user
        therapist_id = data.get('therapist')
        date_id = data.get('date')
        time_id = data.get('time')
        price = data.get('price')
        session_mode = data.get('mode')
        session_type = data.get('type')

        therapistInstance = TherapistDetails.objects.get(id=therapist_id)
        therapist = UserDetails.objects.get(id=therapistInstance.user.id)
        
        get_date = get_object_or_404(AvailableDate, id=date_id)
        get_time = get_object_or_404(AvailableTimes, id=time_id, date=get_date)
        get_time.is_booked = True
        get_time.save()

        date = AvailableDate.objects.get(id=date_id)
        time = AvailableTimes.objects.get(id=time_id)
        if session_type != 'new':
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
            is_new = session_type
        )
        admin_user = UserDetails.objects.filter(is_superuser=True).first()
        admin_wallet = Wallet.objects.get(user=admin_user)
        admin_share = price * 20 // 100
        admin_wallet.balance += admin_share
        admin_wallet.save()

        WalletTransaction.objects.create(
            wallet=admin_wallet,
            transaction_type='CREDIT',
            amount=admin_share,
            description=f"Admin commission from session #{session.id}"
        )
        Notification.objects.create(
        user=client,
        title="New Appointment",
        message=f"You have a new appointment with therapist {therapist} on {date.date.strftime('%B %d, %Y')} at {time.time.strftime('%I:%M %p')}.",
        type="success",
        location="/appointments"
        )
        TherapistNotification.objects.create(
        user=therapist,
        title="Slot Booked",
        message=f"You have a new appointment with client {client} on {date.date.strftime('%B %d, %Y')} at {time.time.strftime('%I:%M %p')}.",
        type="success",
        location="/therapistAppointments"

        )
        AdminNotification.objects.create(
        user=admin_user,
        title="New Commision added to wallet",
        message=f"Recieved {admin_share} to wallet by Commision from session #{session.id}",
        type="success",
        location="/adminEarnings"

        )
        return Response({"message": "Appointment created successfully"}, status=status.HTTP_201_CREATED)






from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q
from django.utils.timezone import localtime

class GetAppointment(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]
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

        user = request.user

        # Assuming both clients and therapists can view their sessions
        appointments = TherapySession.objects.filter(client=user ).order_by('date', 'time')

        serializer = TherapySessionSerializer(appointments, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)
    

class CancelSession(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, session_id):
        try:
            session = TherapySession.objects.get(id=session_id)

            if session.status == 'Cancelled':
                return Response({"message": "Session is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

            session_date = session.date.date
            session_time = session.time.time
            session_datetime = datetime.combine(session_date, session_time)

            if datetime.now() > session_datetime - timedelta(hours=1):
                return Response({"message": "Session can only be cancelled at least 1 hour before it starts."}, status=status.HTTP_400_BAD_REQUEST)

            reason = request.data.get('reason')
            current_role = request.data.get('current_role')  # 'user' or 'therapist'

            if current_role == 'user':
                session.canceled_person = 'Client'
                recipient = session.client
                cancelled_by = "Client"
            else:
                session.canceled_person = 'Therapist'
                recipient = session.therapist
                cancelled_by = "Therapist"

            admin_user = UserDetails.objects.filter(is_superuser=True).first()
            admin_wallet = Wallet.objects.get(user=admin_user)
            client_wallet = Wallet.objects.get(user=session.client)
            admin_share = session.price * 0.2 #admin get 20% of session price , so remove that 
            client_wallet.balance += session.price
            admin_wallet.balance -= admin_share
            client_wallet.save()
            admin_wallet.save()


            session.status = 'Cancelled'
            session.cancel_reason = reason
            session.save()

            # Create notification for the other person
            Notification.objects.create(
                user=recipient,
                title="Session Cancelled",
                message=f"Your cancelled appointment on {session_date} at {session_time.strftime('%I:%M %p')}.",
                type="warning",
                read=False,
                location="/appointments"
            )
            TherapistNotification.objects.create(
                user=recipient,
                title="Session Cancelled",
                message=f"Your canceled appointment on {session_date} at {session_time.strftime('%I:%M %p')}.",
                type="warning",
                read=False,
                location="/therapistAppointments"
            )

            return Response({"message": "Session cancelled successfully."}, status=status.HTTP_200_OK)

        except TherapySession.DoesNotExist:
            return Response({"message": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        


# imports
import stripe
from django.conf import settings
from django.http import JsonResponse

# Set your secret key (add this safely later)
stripe.api_key = settings.STRIPE_SECRET_KEY

from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')

class CreatePaymenIntent(APIView):
    permission_classes = [IsAuthenticated, IsNotBlockedUser]
    def post(self, request):
        try:
            data = json.loads(request.body)
            amount = data.get('amount')

            if not amount:
                return JsonResponse({'error': 'Amount is required'}, status=400)

            # Stripe expects smallest currency unit (e.g., cents for USD, paise for INR)
            intent = stripe.PaymentIntent.create(
                amount=int(amount),  # Multiply by 100 if you're passing in rupees/dollars
                currency='usd',      # Change to 'inr' if using INR
                automatic_payment_methods={'enabled': True},
            )
            return JsonResponse({'clientSecret': intent['client_secret']})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)



@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_ENDPOINT_SECRET  # This will be your webhook secret

    event = None

    try:
        # Verify the webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']  # Contains a stripe.PaymentIntent
        # Handle successful payment here (e.g., update order status)
        print('PaymentIntent was successful!')
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']  # Contains a stripe.PaymentIntent
        # Handle payment failure here (e.g., notify user)
        print('PaymentIntent failed!')

    # Other event types can be handled here (e.g., 'checkout.session.completed')

    return JsonResponse({'status': 'success'}, status=200)





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TherapySession

class CreateFeedback(APIView):
    def patch(self, request):
        appointment_id = request.data.get('appointment_id')
        feedback = request.data.get('feedback')
        rating = request.data.get('rating')

        if not appointment_id or feedback is None or rating is None:
            return Response({"message": "appointment_id, feedback, and rating are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = TherapySession.objects.get(id=appointment_id)
        except TherapySession.DoesNotExist:
            return Response({"message": "Therapy session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.feedback = feedback
        session.rating = rating
        session.save()

        return Response({"message": "Feedback updated successfully."}, status=status.HTTP_200_OK)


from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist

class ConversationView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, user1_id, user2_id):
        try:
            # Ensure that both users exist
            user1 = User.objects.get(id=user1_id)
            user2 = User.objects.get(id=user2_id)

            print('sender',user1)
            print('reciever',user2)
            # Fetch all messages between user1 and user2
            messages = Message.objects.filter(
                Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1)
            ).order_by('timestamp')


            # print(messages)  # Debugging: check if you're getting the expected messages

            # Serialize the messages
            serializer = MessageSerializer(messages, many=True)

            return Response(serializer.data)

        except ObjectDoesNotExist:
            # Return an error if either user is not found
            return Response(
                {"error": "One or both users not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

from datetime import time

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    Notification.objects.filter(user=user, read=True).delete()

    notifications = Notification.objects.filter(user=user).order_by('-time')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request):
    notification_id = request.data.get('id')

    if not notification_id:
        return Response({"message": "Notification ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.save()
        return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({"message": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    notifications = Notification.objects.filter(user=request.user, read=False)
    updated_count = notifications.update(read=True)

    return Response({
        "message": f"{updated_count} notifications marked as read."
    }, status=status.HTTP_200_OK)



from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from django.contrib.sites.models import Site

# views.py
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
User = get_user_model()

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify token
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), config('GOOGLE_CLIENT_ID'))

            email = idinfo['email']
            name = idinfo.get('name', '')

            
            user, created = User.objects.get_or_create(email=email, defaults={'username': name, 'first_name': name})

            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            refresh['username'] = user.username
            refresh['email'] = user.email

            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

            return Response({
                'message': 'Login successful',
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': user.username,
            })
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


# views.py
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from django.conf import settings
import os
from datetime import datetime

@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_media(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    sender = request.POST.get('sender')
    receiver = request.POST.get('receiver')
    
    # Create directory if it doesn't exist
    media_dir = os.path.join(settings.MEDIA_ROOT, 'chat_media')
    os.makedirs(media_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    ext = file.name.split('.')[-1]
    filename = f"{timestamp}_{sender}_{receiver}.{ext}"
    
    # Save file
    file_path = os.path.join(media_dir, filename)
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    # Determine media type
    media_type = 'other'
    if ext.lower() in ['jpg', 'jpeg', 'png', 'gif']:
        media_type = 'image'
    elif ext.lower() in ['mp4', 'webm', 'ogg']:
        media_type = 'video'
    elif ext.lower() in ['pdf', 'doc', 'docx', 'txt']:
        media_type = 'document'
    
    return Response({
        'media_url': os.path.join('/media/chat_media', filename),
        'media_type': media_type
    })


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TherapySession  # Make sure this import is correct

class MarkAsAttended(APIView):
    def post(self, request):
        session_id = request.data.get('id')
        role = request.data.get('role')

        try:
            session = TherapySession.objects.get(id=session_id)
        except TherapySession.DoesNotExist:
            return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        if role == 'user':
            session.user_attended = True
        else:
            session.therapist_attended = True

        session.save()
        return Response({'message': 'Marked as attended'}, status=status.HTTP_200_OK)



class ClientWithdrawRequest(APIView):
    def post(self,request):
        user = request.user
        amount = request.data.get('amount')
        upi_id = request.data.get('upi_id')

        if amount < 500:
            return Response({"message": "Minimum withdrawal amount is ₹500."}, status=status.HTTP_400_BAD_REQUEST)

        ClientWithdrawalRequest.objects.create(
                client=user,
                amount=amount,
                upi_id=upi_id
            )
        admin_user = UserDetails.objects.filter(is_superuser=True).first()

        AdminNotification.objects.create(
        user=admin_user,
        title="Withdraw Request",
        message=f"You have a withdrawal request of ₹{amount} from client {user.fullname if user.fullname else user.username}",
        type="success",
        location="/adminEarnings"

        )
        return Response({'message': 'Withdrawal request submitted successfully'}, status=status.HTTP_201_CREATED)    


class GetTherapistProfile(APIView):
    def get(self,request,id):
        therapist=TherapistDetails.objects.get(id=id)
        serializer=GetTherapistProfileSerializer(therapist)
        return Response({'profile_info': serializer.data})

        
