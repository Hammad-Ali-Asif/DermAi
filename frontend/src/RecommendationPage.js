import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RecommendationPage.css";

const diagnosisURL = 'https://haseeb-283f2-default-rtdb.firebaseio.com/diagnosis';

const recommendations = {
  Cyst: {
    Severe: { avoid: ["Dairy", "Sugar", "Fried foods", "Soy"], add: ["Turmeric", "Salmon", "Probiotics", "Green tea"] },
    Moderate: { avoid: ["Gluten", "Caffeine", "Spicy foods"], add: ["Vitamin A foods", "Zinc-rich foods", "Antioxidants"] },
    Mild: { avoid: ["Artificial sweeteners", "Sodas"], add: ["Cucumber water", "Leafy greens"] },
  },
  Pustule: {
    Severe: { avoid: ["Alcohol", "Sugary cereals", "Processed meats"], add: ["Vitamin C foods", "Healthy fats", "Detox foods"] },
    Moderate: { avoid: ["Excess caffeine", "Spicy foods"], add: ["Herbal teas", "Whole grains"] },
    Mild: { avoid: ["High-sodium foods"], add: ["Raw veggies", "Adequate protein"] },
  },
  Comedone: {
    Severe: { avoid: ["Excess dairy", "Fast food"], add: ["Collagen-boosting foods", "Prebiotic foods"] },
    Moderate: { avoid: ["Too much peanut butter"], add: ["Vitamin E foods", "Fermented foods"] },
    Mild: { avoid: ["Artificial food dyes"], add: ["Lentils", "Mint-infused water"] },
  },
  Unknown: {
    Severe: { avoid: ["Highly processed foods", "Excess sugar"], add: ["Whole foods", "Hydrating fluids"] },
    Moderate: { avoid: ["Refined carbs"], add: ["Fiber-rich foods"] },
    Mild: { avoid: ["Artificial ingredients"], add: ["Nutrient-dense meals"] },
  },
};

function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { acne_types = ["Unknown"], severity = "Unknown", imageSrc, boxes = [] } = location.state || {};
  const validAcneType = acne_types.length > 0 ? acne_types[0] : "Unknown";
  const acneRecommendations = recommendations[validAcneType]?.[severity] || { avoid: ["No data available"], add: ["No data available"] };

  const imageRef = useRef(null);
  const [imageDims, setImageDims] = useState({
    naturalWidth: 1,
    naturalHeight: 1,
    renderedWidth: 1,
    renderedHeight: 1,
  });

  useEffect(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setImageDims({ naturalWidth, naturalHeight, renderedWidth: width, renderedHeight: height });
    }
  }, [imageSrc]);

  const scaleX = imageDims.renderedWidth / imageDims.naturalWidth;
  const scaleY = imageDims.renderedHeight / imageDims.naturalHeight;

  const saveProgress = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in. Cannot save progress.");
      return;
    }

    const progress = {
      date: new Date().toLocaleDateString(),
      diagnosis: validAcneType,
      severity,
      imageSrc,
      avoid: acneRecommendations.avoid,
      add: acneRecommendations.add,
    };

    const savedProgress = JSON.parse(localStorage.getItem("progressData")) || [];
    savedProgress.push(progress);
    localStorage.setItem("progressData", JSON.stringify(savedProgress));

    try {
      await axios.post(`${diagnosisURL}/${userId}.json`, progress);
      console.log("Diagnosis saved to Firebase.");
      navigate("/progress-tracking");
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      alert("Failed to save diagnosis. Please try again.");
    }
  };

  return (
    <div className="recommendation-container">
      <h1>Dietary Recommendations</h1>

      <div className="content-wrapper">
        {/* Left Side - Image with bounding boxes */}
        <div className="image-container" style={{ position: "relative", display: "inline-block" }}>
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt="Acne Detection"
                ref={imageRef}
                onLoad={() => {
                  if (imageRef.current) {
                    const { naturalWidth, naturalHeight, width, height } = imageRef.current;
                    setImageDims({ naturalWidth, naturalHeight, renderedWidth: width, renderedHeight: height });
                  }
                }}
                className="diagnosis-image"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <svg
                className="bounding-box-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${imageDims.renderedWidth}px`,
                  height: `${imageDims.renderedHeight}px`,
                  pointerEvents: "none",
                }}
              >
                {boxes.map(([x1, y1, x2, y2], index) => (
                  <g key={index}>
                    <rect
                      x={x1 * scaleX}
                      y={y1 * scaleY}
                      width={(x2 - x1) * scaleX}
                      height={(y2 - y1) * scaleY}
                      stroke="red"
                      fill="none"
                      strokeWidth="2"
                    />
                    <text
                      x={x1 * scaleX + 5}
                      y={Math.max(12, y1 * scaleY - 5)}
                      fill="red"
                      fontSize="12px"
                      fontWeight="bold"
                    >
                      {acne_types[index] || "Unknown"}
                    </text>
                  </g>
                ))}
              </svg>
            </>
          ) : (
            <p>No image uploaded</p>
          )}
        </div>

        {/* Right Side - Info Boxes */}
        <div className="info-section">
          <div className="info-box diagnosis-box">
            <h2>Diagnosis</h2>
            <p>{validAcneType}</p>
          </div>

          <div className="info-box severity-box">
            <h2>Severity</h2>
            <p>{severity}</p>
          </div>

          <div className="info-box recommendation-box">
            <h2>Things to Avoid</h2>
            <ul>
              {acneRecommendations.avoid.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>Things to Add</h2>
            <ul>
              {acneRecommendations.add.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <button className="save-button" onClick={saveProgress}>
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendationPage;
