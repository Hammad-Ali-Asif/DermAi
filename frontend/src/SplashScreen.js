import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logo from "./assets/DermAI.png"; // ✅ Replace with your actual logo file

function SplashScreen() {
  const navigate = useNavigate();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true); // Start fade-in effect
    setTimeout(() => {
      setFade(false); // Start fade-out effect
      setTimeout(() => {
        navigate("/landing"); // Redirect after animation
      }, 500);
    }, 2000);
  }, [navigate]);

  return (
    <div className={`splash-container ${fade ? "fade-in" : "fade-out"}`}>
      <div className="logo-container">
        <img src={logo} alt="DermAI Logo" className="splash-logo" />
      </div>
      <h1 className="splash-title">DermAI</h1>
      <p className="splash-text">Your AI Companion for Clearer Skin</p>
    </div>
  );
}

export default SplashScreen;
