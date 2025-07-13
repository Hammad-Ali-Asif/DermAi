import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import backgroundImage from "./assets/login-background.jpg"; // Ensure the image is in the correct location

const usersURL = 'https://haseeb-283f2-default-rtdb.firebaseio.com/users.json'

function LoginPage({ setUserName }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate Email Format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate Password Strength
  const isValidPassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  };

  const fetchUsers = async () => {
    const users = await axios.get(usersURL);
    return users.data;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    
    let found = false;
    const users = await fetchUsers();
    let finalUserId = null;
    for (const userId in users) {
      const user = users[userId];
      if(user.email === email && user.name === name && user.password === password) {
        found = true;
        finalUserId = userId;
      }

      console.log(user);
    }

    if(found) {
      console.log("User Found");
    } else {
      console.log("User NOT Found");
      newErrors.notFound = "User not Found";
    }

    // ✅ Proceed only if no errors
    if (Object.keys(newErrors).length === 0) {
      setUserName(name);
      localStorage.setItem("userId", finalUserId); // This must be the unique Firebase key for the user
      navigate("/profile");
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-box">
        <h1>Welcome Back!</h1>
        <form onSubmit={handleLogin}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button type="submit" disabled={!name || !email || !password}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
