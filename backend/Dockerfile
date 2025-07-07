FROM python:3.11-slim-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY ./mindease_bakend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir gunicorn==21.2.0 daphne && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./mindease_bakend/ .

# Set PORT environment variable for Cloud Run
ENV PORT=8080

# Expose port (optional for Cloud Run, but good practice)
EXPOSE 8080

# Run Daphne server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8080", "mindease_bakend.asgi:application"]
