import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileUploadPage.css";
import backgroundImage from "./assets/pro.png"; // Ensure this path is correct

export default function ProfileUploadPage({ userName }) {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleProceed = () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }
    // Navigate to DiagnosisPage, passing the File object
    navigate("/diagnosis", { state: { file: image } });
  };

  return (
    <div
      className="profile-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="upload-box">
        <h1>Welcome, {userName}</h1>

        {previewURL && (
          <img
            src={previewURL}
            alt="Selected preview"
            className="image-preview"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button className="upload-button" onClick={handleProceed}>
          Proceed to Diagnosis
        </button>
      </div>
    </div>
  );
}
