import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileUploadPage.css";
import backgroundImage from "./assets/pro.png"; // Ensure this image is in the correct folder

function ProfileUploadPage({ userName }) {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedImage = event.target.files[0];
      setImage(selectedImage);
      setPreviewURL(URL.createObjectURL(selectedImage)); // ✅ Set preview URL
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      // ✅ Navigate to Diagnosis page with all received data
      navigate("/diagnosis", {
        state: {
          image_url: data.image_url,
          diagnosis: data.diagnosis,
          severity: data.severity,
          acne_types: data.acne_types,
          boxes: data.boxes,
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to connect to backend.");
    }
  };

  return (
    <div className="profile-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="upload-box">
        <h1>Welcome, {userName}</h1>
        {previewURL && <img src={previewURL} alt="Preview" className="image-preview" />}
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button className="upload-button" onClick={handleUpload}>
          Upload Picture
        </button>
      </div>
    </div>
  );
}

export default ProfileUploadPage;
