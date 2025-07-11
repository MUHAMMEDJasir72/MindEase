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


# Run Daphne ASGI server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "mindease_bakend.asgi:application"]
