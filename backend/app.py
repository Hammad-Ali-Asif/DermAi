from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import cv2
import torch
import tensorflow as tf

# Setup
load_model = tf.keras.models.load_model
img_to_array = tf.keras.preprocessing.image.img_to_array

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load YOLOv5 model
YOLO_MODEL_PATH = "models/best1.pt"
if not os.path.exists(YOLO_MODEL_PATH):
    raise FileNotFoundError("YOLO model file not found.")
print("Loading YOLOv5 model...")
yolo_model = torch.hub.load("ultralytics/yolov5", "custom", path=YOLO_MODEL_PATH, force_reload=True)
print("YOLO model loaded.")

# Load CNN classifier
ACNE_CLASSIFIER_PATH = "models/acne_cnn_model.h5"
if not os.path.exists(ACNE_CLASSIFIER_PATH):
    raise FileNotFoundError("Acne classification model not found.")
print("Loading Acne Classifier...")
acne_classifier = load_model(ACNE_CLASSIFIER_PATH)
print("Classifier loaded.")

ACNE_LABELS = ["Cyst", "Pustule", "Comedone"]

# Acne treatment database
acne_treatment_data = {
    "Comedone": {
        "Recommended Treatment": [
            "Salicylic Acid Cleanser",
            "Retinoids (Adapalene or Tretinoin)",
            "Benzoyl Peroxide (2.5%–5%) spot treatment",
            "Niacinamide serum (anti-inflammatory)",
            "Gentle exfoliation (BHA/AHA)",
            "Non-comedogenic moisturizers"
        ],
        "Tips": [
            "Avoid over-scrubbing, use chemical exfoliants.",
            "Cleanse twice daily with mild face wash.",
            "Avoid squeezing blackheads and whiteheads.",
            "Use non-comedogenic products to prevent clogging pores."
        ],
        "Severity": "Mild – Can be managed with OTC treatments and good skincare."
    },
    "Pustule": {
        "Recommended Treatment": [
            "Benzoyl Peroxide (2.5%–5%) antibacterial",
            "Topical antibiotics (Clindamycin, Erythromycin)",
            "Anti-inflammatory products (Niacinamide)"
        ],
        "Tips": [
            "Do not pop pustules to avoid scarring.",
            "Maintain strict face hygiene."
        ],
        "Severity": "Moderate – Needs antibacterial care; consult if persistent."
    },
    "Cyst": {
        "Recommended Treatment": [
            "Oral antibiotics",
            "Isotretinoin (Accutane) under dermatologist supervision",
            "Corticosteroid injections for large cysts"
        ],
        "Tips": [
            "Never attempt self-treatment for cysts.",
            "Scarring is highly possible if untreated."
        ],
        "Severity": "Severe – Must consult dermatologist; advanced treatment required."
    }
}

# Severity calculation logic
def calculate_severity(acne_count):
    if acne_count > 50:
        return "Severe"
    elif 25 <= acne_count <= 50:
        return "Moderate"
    elif acne_count >= 1:
        return "Mild"
    return "None"

# CNN classification
def classify_acne_type(cropped_image):
    input_shape = acne_classifier.input_shape
    expected_size = (input_shape[1], input_shape[2])
    cropped_image = cropped_image.resize(expected_size)
    img_array = img_to_array(cropped_image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = acne_classifier.predict(img_array)
    return ACNE_LABELS[np.argmax(prediction)]

# Food recommendation logic
def get_recommendations(acne_types, severity):
    base = {
        "Cyst": {
            "avoid": ["Dairy products", "Fast food", "Chocolate"],
            "add": ["Leafy greens", "Omega-3 rich foods", "Green tea"]
        },
        "Pustule": {
            "avoid": ["Spicy foods", "Soda", "Processed meats"],
            "add": ["Citrus fruits", "Whole grains", "Turmeric"]
        },
        "Comedone": {
            "avoid": ["High sugar foods", "Fried food", "Alcohol"],
            "add": ["Nuts", "Avocados", "Tomatoes"]
        }
    }

    severity_mod = {
        "Mild": {"avoid": ["Less fried food"], "add": ["Drink more water"]},
        "Moderate": {"avoid": ["Reduce dairy"], "add": ["More probiotics"]},
        "Severe": {"avoid": ["Avoid sugar completely"], "add": ["Increase vitamin A intake"]}
    }

    avoid = set()
    add = set()

    for acne in acne_types:
        if acne in base:
            avoid.update(base[acne]["avoid"])
            add.update(base[acne]["add"])

    if severity in severity_mod:
        avoid.update(severity_mod[severity]["avoid"])
        add.update(severity_mod[severity]["add"])

    return {
        "avoid": list(avoid),
        "add": list(add)
    }

# Prediction endpoint
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)

    image = Image.open(image_path).convert("RGB")
    img_np = np.array(image)

    # Run YOLO detection
    results = yolo_model(img_np)
    detections = results.pandas().xyxy[0]

    acne_types = []
    boxes = []
    acne_count = 0

    for _, row in detections.iterrows():
        x1, y1, x2, y2 = map(int, [row['xmin'], row['ymin'], row['xmax'], row['ymax']])
        boxes.append([x1, y1, x2, y2])
        cropped = image.crop((x1, y1, x2, y2))
        acne_type = classify_acne_type(cropped)
        acne_types.append(acne_type)
        acne_count += 1

    severity = calculate_severity(acne_count)
    recommendations = get_recommendations(acne_types, severity)

    # Build treatment summary per acne type
    unique_types = set(acne_types)
    treatment_summary = []

    for acne_type in unique_types:
        data = acne_treatment_data.get(acne_type, {})
        treatment_summary.append({
            "type": acne_type,
            "recommended_treatment": data.get("Recommended Treatment", ["Not specified"]),
            "tips": data.get("Tips", ["No tips available"]),
            "severity_level": data.get("Severity", "Not specified")
        })

    return jsonify({
        "image_url": f"http://localhost:5001/uploads/{image_file.filename}",
        "diagnosis": "Acne Detected" if acne_count else "No Acne Detected",
        "severity": severity,
        "acne_types": acne_types,
        "boxes": boxes,
        "recommendations": recommendations,
        "treatment_summary": treatment_summary
    })

# Serve uploaded images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Run app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
