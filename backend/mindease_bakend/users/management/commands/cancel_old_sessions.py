from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import TherapySession

class Command(BaseCommand):
    help = 'Automatically cancel scheduled sessions if they are 2+ hours past the session time.'

    def handle(self, *args, **kwargs):
        now = timezone.localtime(timezone.now())
        sessions = TherapySession.objects.filter(status='Scheduled')
        

        for session in sessions:
            
            session_date = session.date.date  # assuming AvailableDate has a `date` field (DateField)
            session_time = session.time.time  # assuming AvailableTimes has a `time` field (TimeField)
            session_datetime = datetime.combine(session_date, session_time)
            session_datetime = timezone.make_aware(session_datetime)
            print('date',session.date.date, 'time', session.time.time)
            print(session_datetime)
            print(now)

            if now > session_datetime + timedelta(hours=2):
                session.status = 'Cancelled'
                session.save()
                self.stdout.write(f"Session {session.id} cancelled.")
