# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt


# Copy project files
COPY mindease_bakend/ /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Run the app
CMD ["gunicorn", "mindease_bakend.wsgi:application", "--bind", "0.0.0.0:8000"]
