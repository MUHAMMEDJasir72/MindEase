MindEase – Online Counseling Platform

MindEase is an online counseling platform designed to help people find relief from mental health issues through professional therapy sessions — all from the comfort and privacy of home.
Users can connect with certified therapists through video calls, voice calls, or real-time chat, manage appointments, handle secure payments, and more — all in one place.

🌐 Live: https://mindeasee.shop

📦 Backend: Django REST Framework (hosted on AWS EC2)

💻 Frontend: React (hosted on Vercel)

🚀 Features 

🧍‍♀️ For Users
--------------

🔍 View and filter therapists by specialization and category 

🗓️ Book sessions for preferred date and time

💬 Communicate via real-time chat, video calls (WebRTC), and voice calls

💰 Wallet system for payments and refunds

💳 Stripe integration for secure payments

❌ Cancel sessions (with refunds if canceled at least 1 hour before) 

🕒 View session history and upcoming sessions

🔐 Login with Google Authentication

💸 Request wallet withdrawals

👩‍⚕️ For Therapists
-------------------

📝 Apply to become a therapist (admin approval required)

⏰ Create and manage available time slots

💼 View bookings, earnings, and chat with clients

💸 Request payouts (manual transfer by admin to UPI account)

🧑‍💼 For Admin
--------------

✅ Approve or reject therapist applications

💬 Chat directly with therapists

🧾 View all sessions, users, and therapist details

🚫 Block/unblock users and therapists

💰 Earn 20% commission on each session

📊 Access to analytics and reports

🧰 Tech Stack
---------------

Layer Technologies

Frontend React, Tailwind CSS

Backend Django REST Framework, Django Channels, Redis, Daphne

Database PostgreSQL (Amazon RDS)

Authentication JWT, Google OAuth

Payment Stripe

Video & Voice Calls WebRTC

Deployment AWS EC2 (Backend), Vercel (Frontend), Nginx, Docker

Cloud Storage Cloudinary

Real-time Communication WebSockets via Channels + Redis

⚙️ Installation Guide
----------------------

1️⃣ Clone the Repository

git clone https://github.com/MUHAMMEDJasir72/MindEase.git

cd MindEase

2️⃣ Backend Setup

cd backend

cd mindease_bakend

python -m venv venv

source venv/bin/activate # For Windows: venv\Scripts\activate

pip install -r requirements.txt

Set up your .env file:

SECRET_KEY=your_secret_key

DEBUG=True

DATABASE_URL=your_postgres_db_url

CLOUDINARY_URL=your_cloudinary_url

STRIPE_SECRET_KEY=your_stripe_secret

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID Google OAuth Client ID

GOOGLE_CLIENT_SECRET Google OAuth Client Secret

Run migrations and start server:

python manage.py migrate

python manage.py runserver

3️⃣ Frontend Setup

cd frontend

cd mindease_frontend

npm install

npm run dev

🐳 Docker Setup (Optional)

To run using Docker:

docker-compose up --build

📱 Key Modules
----------------

Authentication Module – Handles user/therapist registration, login, and JWT management

Session Management – Booking, canceling, and managing therapy sessions

Wallet Module – Track payments, refunds, and withdrawals

Admin Dashboard – Manage users, therapists, and transactions

Real-time Communication – WebRTC for video/voice, WebSockets for chat and notifications

📊 Future Improvements
-----------------------

🌍 Multi-language support

📅 Calendar synchronization (Google Calendar integration)

📈 Advanced analytics dashboard for therapists and admin

👨‍💻 Developer
----------------

👤 Jasir

📍 Kasargod, India

💼 Developer | Python & Django Enthusiast

📧 jasirsnr72@gmail.com
