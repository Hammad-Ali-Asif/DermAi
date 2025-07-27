# Use Python 3.11 slim so TensorFlow‑CPU and OpenCV work
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only requirements.txt first, to cache this layer when deps don’t change
COPY requirements.txt .

# Install OS‑level dependencies needed by cv2 and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libgl1-mesa-glx \
      libglib2.0-0 \
      libsm6 \
      libxrender1 \
      libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy in the rest of your backend code
COPY . .

# Expose the port Gunicorn will use
EXPOSE 8000

# Launch the app with Gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]
