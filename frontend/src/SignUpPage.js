import {React, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import './SignUpPage.css'; 
import backgroundImage from './assets/log.png'; 

const usersURL = 'https://haseeb-283f2-default-rtdb.firebaseio.com/users.json'

function SignUpPage() {
  const navigate = useNavigate(); 
  const fullNameRef = useRef();
  const emailRef = useRef();
  const contactRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const postUser = async (newUser) => {
    await axios.post(usersURL, newUser);
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    const name = fullNameRef.current.value;
    const email = emailRef.current.value;
    const contact = contactRef.current.value;
    const password = passwordRef.current.value;
    // const confirmPassword = confirmPasswordRef.current.value;

    await postUser({name, email, contact, password})

    navigate('/login'); 
  };

  return (
    <div
      className="signup-container"
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
      <div className="signup-box">
        <h1>Create an Account</h1>
        <form onSubmit={handleSignUp}> {/* Handle form submission */}
          <label>Full Name</label>
          <input type="text" ref={fullNameRef} placeholder="Enter your full name" required />
          
          <label>Email</label>
          <input type="email" ref={emailRef} placeholder="Enter your email" required />

          <label>Contact Number</label>
          <input type="text" ref={contactRef} placeholder="Enter your contact number" required />

          <label>Password</label>
          <div className="password-container">
            <input type="password" ref={passwordRef} placeholder="Enter your password" required />
            <span className="toggle-password"></span>
          </div>

          <label>Confirm Password</label>
          <div className="password-container">
            <input type="password" ref={confirmPasswordRef} placeholder="Confirm your password" required />
            <span className="toggle-password"></span>
          </div>

          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
