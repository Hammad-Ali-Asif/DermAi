import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; 
import backgroundImage from './assets/a.png'; 

function LandingPage() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const goToSignUp = () => {
    navigate('/signup');
  };

  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
      <div className="landing-content">
        <h1>DermAI</h1>
        <h2>Your companion for a better you</h2>
        <p>Helping you identify and classify acne and its severity, providing an immediate diagnosis.</p>
        <div className="buttons">
          <button className="login-btn" onClick={goToLogin}>Log In</button>
          <button className="signup-btn" onClick={goToSignUp}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
