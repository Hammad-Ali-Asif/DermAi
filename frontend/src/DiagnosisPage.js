import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DiagnosisPage.css";

function DiagnosisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const {
    image_url,
    diagnosis = "No Diagnosis Available",
    severity = "Unknown",
    acne_types = [],
    boxes = [],
    recommendations = { avoid: [], add: [] },
  } = location.state || {};

  const [imageSrc, setImageSrc] = useState(image_url || null);
  const [imageDims, setImageDims] = useState({ naturalWidth: 1, naturalHeight: 1, renderedWidth: 1, renderedHeight: 1 });

  useEffect(() => {
    if (image_url) setImageSrc(image_url);
  }, [image_url]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setImageDims({ naturalWidth, naturalHeight, renderedWidth: width, renderedHeight: height });
    }
  };

  const scaleX = imageDims.renderedWidth / imageDims.naturalWidth;
  const scaleY = imageDims.renderedHeight / imageDims.naturalHeight;

  return (
    <div className="diagnosis-container">
      <h1>Diagnosis Result</h1>

      <div className="image-section">
        {imageSrc ? (
          <div className="image-container" style={{ position: "relative", display: "inline-block" }}>
            <img
              src={imageSrc}
              alt="Uploaded"
              className="diagnosis-image"
              ref={imageRef}
              onLoad={handleImageLoad}
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
              {boxes.length > 0 &&
                boxes.map(([x1, y1, x2, y2], index) => (
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
                      y={y1 * scaleY - 5}
                      fill="red"
                      fontSize="12px"
                      fontWeight="bold"
                    >
                      {acne_types[index] || "Unknown"}
                    </text>
                  </g>
                ))}
            </svg>
          </div>
        ) : (
          <p>No image available</p>
        )}
      </div>

      <div className="diagnosis-info">
        <h2>Diagnosis: {diagnosis}</h2>
        <h2>Severity: {severity}</h2>
        <h2>
          Acne Types:{" "}
          {acne_types.length > 0 ? [...new Set(acne_types)].join(", ") : "Unknown"}
        </h2>

      </div>

      <button
        onClick={() =>
          navigate("/recommendation", {
            state: { severity, acne_types, imageSrc, recommendations, boxes },
          })
        }
      >
        Get Recommendation
      </button>
    </div>
  );
}

export default DiagnosisPage;
