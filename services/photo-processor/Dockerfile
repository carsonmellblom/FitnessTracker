FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Pillow and OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY *.py .

# Pre-download MediaPipe models (running as root)
RUN python download_model.py

# Create uploads directory and non-root user
RUN mkdir -p /app/uploads && \
    useradd -m -u 1000 -s /bin/bash appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Ensure Python output is visible in Docker logs
ENV PYTHONUNBUFFERED=1

# Run the service
CMD ["python", "main.py"]
