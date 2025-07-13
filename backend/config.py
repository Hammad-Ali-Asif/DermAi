from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import os
import numpy as np
from PIL import Image
import io
from ultralytics import YOLO

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend access

# Ensure uploads directory exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load YOLO Model
MODEL_PATH = "models/model.pt"  # Ensure this is correct
model = YOLO(MODEL_PATH)

# Function to determine severity based on acne area
def determine_severity(detections):
    total_area = sum((x2 - x1) * (y2 - y1) for x1, y1, x2, y2 in detections)

    if total_area > 15000:
        return "Severe"
    elif total_area > 5000:
        return "Moderate"
    else:
        return "Mild"

# API Endpoint for Image Processing
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    # Read image
    image_file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)

    # Open image for processing
    image = Image.open(image_path)
    img_np = np.array(image)

    # Run YOLO Model
    results = model(img_np)

    # Extract bounding boxes
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            detections.append((x1, y1, x2, y2))

    # Determine severity based on acne spread
    severity = determine_severity(detections)

    # Return results
    return jsonify({
        "diagnosis": "Acne Detected",
        "severity": severity,
        "boxes": detections
    })

# Run Flask App
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
