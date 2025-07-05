FROM python:3.11-slim-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY ./mindease_bakend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir gunicorn==21.2.0 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./mindease_bakend/ .

EXPOSE 8000
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "mindease_bakend.asgi:application"]
