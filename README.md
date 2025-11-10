MindEase – Your Online Mental Wellness Platform

MindEase is an online psychologist booking platform designed to make mental health support accessible and comfortable.
It allows users to book one-on-one sessions with certified therapists via video call or chat, helping bridge the gap between individuals and mental wellness professionals.

🪶 Table of Contents

About the Project

Features

Tech Stack

System Architecture

Project Structure

Installation Guide

Environment Variables

API Overview

Authentication Flow

Reports & Analytics

Deployment Guide

Screenshots

Future Enhancements

Contributing

Contact

License

💡 About the Project

MindEase provides a platform for users to connect with psychologists for therapy sessions online.
It supports two types of sessions — video call and chat-based therapy.

The app focuses on:

Building trust between users and therapists

Providing an easy scheduling and payment flow

Offering mental wellness reports for admins

It’s a full-stack web application built with React (frontend) and Django REST Framework (backend), deployed on AWS EC2.

✨ Features
👥 User Features

Sign up and log in with OTP verification

View available therapists and their specializations

Book 1-hour video call or chat sessions

Integrated secure payment gateway (Razorpay)

Real-time chat functionality

View session history and invoices

Manage wallet balance and refunds

Receive notifications about sessions and updates

🧑‍⚕️ Therapist Features

Apply for therapist account and upload verification documents

Manage availability and session slots

Receive real-time booking notifications

Conduct chat or video call sessions

Track session history and earnings

🛡️ Admin Features

Approve or reject therapist applications

Manage users, therapists, and sessions

Generate sales and booking reports

View analytics dashboards (revenue, bookings, therapist performance)

Manage coupons and promotional offers

🧩 Tech Stack
Frontend

React.js (Vite)

Redux Toolkit (Modern Redux)

Tailwind CSS

React Router DOM

Axios

Socket.IO Client (real-time chat)

Cloudinary for file uploads

Backend

Django & Django REST Framework

PostgreSQL

Django Channels & Redis (WebSockets)

JWT Authentication

Razorpay API

Cloudinary for media storage

Deployment

AWS EC2 (Ubuntu)

Gunicorn & Nginx

Cloudinary for static/media files

GitHub for version control

🧱 System Architecture
                ┌───────────────────────────┐
                │        Frontend           │
                │  React + Redux + Vite     │
                └───────────┬───────────────┘
                            │  REST API / WebSocket
                ┌───────────▼───────────────┐
                │         Backend           │
                │ Django REST + Channels    │
                └───────────┬───────────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
   ┌────────▼──────┐ ┌──────▼────────┐ ┌─────▼────────┐
   │ PostgreSQL DB │ │ Cloudinary    │ │ Razorpay API  │
   │   Data Store  │ │ File Storage  │ │ Payment System│
   └───────────────┘ └──────────────┘ └───────────────┘

📂 Project Structure
MindEase/
├── backend/
│   ├── mindease/                # Django project settings
│   ├── user/                    # User-related logic
│   ├── therapist/               # Therapist module
│   ├── adminpanel/              # Admin functionalities
│   ├── reports/                 # Analytics & Reports
│   ├── media/                   # Media files (handled by Cloudinary)
│   └── ...
│
├── frontend/
│   ├── mindease_frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── redux/
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── index.html
│
└── README.md

⚙️ Installation Guide
1️⃣ Clone the Repository
git clone https://github.com/yourusername/mindease.git
cd mindease

2️⃣ Setup Backend
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt


Run migrations:

python manage.py migrate
python manage.py runserver

3️⃣ Setup Frontend
cd ../frontend
npm install
npm run dev


The frontend will start at http://localhost:5173
The backend runs at http://127.0.0.1:8000

🔐 Environment Variables

Create a .env file in the backend directory and add:

SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_NAME=mindease_db
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
CLOUDINARY_URL=your_cloudinary_url
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
REDIS_URL=redis://127.0.0.1:6379

🔗 API Overview
Endpoint	Method	Description
/api/register/	POST	Register new user with OTP
/api/login/	POST	Login and receive JWT
/api/therapists/	GET	Get all therapists
/api/book-session/	POST	Book a session
/api/payment/verify/	POST	Verify payment
/api/chat/send/	POST	Send chat message
/api/chat/history/	GET	Retrieve messages
🔄 Authentication Flow

User registers → receives OTP via email

Verifies OTP → Account is created

Logs in → JWT tokens are issued

Tokens stored securely in local storage

Refresh tokens used for session persistence

📈 Reports & Analytics

Admin can view:

Total sessions booked (daily/monthly/yearly)

Total revenue generated

Active therapists and users

Coupon usage reports

Top performing psychologists

Reports can be exported as PDF or Excel files.

☁️ Deployment Guide
Backend Deployment

Hosted on AWS EC2 (Ubuntu)

Served with Gunicorn

Reverse proxy setup via Nginx

Environment variables stored securely in .env

Frontend Deployment

Built using npm run build

Deployed on Vercel, Netlify, or served via Nginx on EC2

Media & Static Files

Managed by Cloudinary

🖼️ Screenshots

(Add screenshots after hosting your app)

Page	Preview
Home Page	

Therapist List	

Chat Session	

Video Call	

Admin Dashboard	
🔮 Future Enhancements

AI-powered mental health chatbot

Therapist calendar scheduling system

Session recording & review system

Email reminders for upcoming sessions

Mood tracking and journaling for users

Zoom / Google Meet API integration

🤝 Contributing

Fork this repository

Create a feature branch:

git checkout -b feature/new-feature


Commit your changes

Push to your branch and open a Pull Request

📧 Contact

Developer: Jasir
📍 Kasargod, India
📩 Email: your-email@example.com

🔗 LinkedIn: linkedin.com/in/yourprofile

💻 GitHub: github.com/yourusername

🪪 License

This project is licensed under the MIT License.
You’re free to use, modify, and distribute it.

Would you like me to include:

✅ Badges (Tech stack, build, license, version, etc.)

✅ README banner / logo section (MindEase logo at top)

I can make it look like a polished GitHub landing page with those additions. Do you want that version?
