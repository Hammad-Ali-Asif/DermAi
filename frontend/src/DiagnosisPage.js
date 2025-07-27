import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectAcne } from "./api/hf";           // your HF utility
import "./DiagnosisPage.css";

export default function DiagnosisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;              // passed from your upload page
  const imageRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState("No Diagnosis");
  const [severity, setSeverity] = useState("Unknown");
  const [acneTypes, setAcneTypes] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [recommendations, setRecommendations] = useState({ avoid: [], add: [] });

  // For drawing boxes
  const [dims, setDims] = useState({
    naturalWidth: 1,
    naturalHeight: 1,
    renderedWidth: 1,
    renderedHeight: 1,
  });

  // 1) When component mounts, load the image & run inference
  useEffect(() => {
    if (!file) {
      setError("No image provided");
      setLoading(false);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      runInference(file);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // 2) Call HF Inference API
  async function runInference(fileBlob) {
    try {
      const result = await detectAcne(fileBlob);
      // adjust these paths to match your model’s JSON schema
      setDiagnosis(result.diagnosis || "No Diagnosis");
      setSeverity(result.severity || "Unknown");
      setAcneTypes(result.acne_types || []);
      setBoxes(result.boxes || []);
      setRecommendations(result.recommendations || { avoid: [], add: [] });
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 3) Capture rendered dimensions for SVG scaling
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setDims({ naturalWidth, naturalHeight, renderedWidth: width, renderedHeight: height });
    }
  };

  const scaleX = dims.renderedWidth / dims.naturalWidth;
  const scaleY = dims.renderedHeight / dims.naturalHeight;

  // 4) Render loading / error states
  if (loading) {
    return <div className="diagnosis-container"><h2>Analyzing image…</h2></div>;
  }
  if (error) {
    return <div className="diagnosis-container"><h2 style={{ color: "red" }}>{error}</h2></div>;
  }

  // 5) Final UI
  return (
    <div className="diagnosis-container">
      <h1>Diagnosis Result</h1>

      <div className="image-section">
        <div className="image-container" style={{ position: "relative", display: "inline-block" }}>
          <img
            src={imageSrc}
            alt="Uploaded"
            ref={imageRef}
            onLoad={handleImageLoad}
            style={{ width: "100%", height: "auto", display: "block" }}
            className="diagnosis-image"
          />

          <svg
            className="bounding-box-overlay"
            width={dims.renderedWidth}
            height={dims.renderedHeight}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          >
            {boxes.map(([x1, y1, x2, y2], i) => (
              <g key={i}>
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
                  x={x1 * scaleX + 4}
                  y={y1 * scaleY - 4}
                  fill="red"
                  fontSize="12px"
                  fontWeight="bold"
                >
                  {acneTypes[i] || "Unknown"}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="diagnosis-info">
        <h2>Diagnosis: {diagnosis}</h2>
        <h2>Severity: {severity}</h2>
        <h2>
          Acne Types:{" "}
          {acneTypes.length ? Array.from(new Set(acneTypes)).join(", ") : "Unknown"}
        </h2>
      </div>

      <button
        className="recommend-button"
        onClick={() =>
          navigate("/recommendation", {
            state: { severity, acneTypes, recommendations, boxes },
          })
        }
      >
        Get Recommendation
      </button>
    </div>
  );
}
