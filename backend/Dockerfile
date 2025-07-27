# Use Python 3.11 slim so TensorFlow‑CPU will install cleanly
FROM python:3.11-slim

WORKDIR /app

# Copy only requirements first (caches layer)
COPY requirements.txt .

# Install system tools if needed
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Expose the port Gunicorn will use
EXPOSE 8000

# Launch via Gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]
