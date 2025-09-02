import './home.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    let valid = true;
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      valid = false;
    }

    if (valid) {
      // Placeholder for register logic
      console.log('Register button clicked');
      // After submit, navigate to verify
      navigate('/verify');
    }
  };

  return (
    <div className="App">
      {/* Background animation */}
      <div className="vote-bars-background">
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
        <div className="vote-bar"></div>
      </div>

      {/* Top bar */}
      <div className="top_bar">
        <Link to="/login" className="button">View Groups</Link>
        <Link to="/register" className="button">Create Group</Link>
        <Link to="/login" className="button">Login</Link>
      </div>

      {/* Logo outside top bar */}
      <div className="logo-outside">
        <img src={logo} alt="VoxPlatform Logo" />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Register Form */}
        <div className="form-container">
          <h2 className="hero-title">Register for VoxPlatform</h2>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="error-message">{emailError}</p>}
          <button className="button" onClick={handleRegister}>
            Send Registration Code
          </button>
          <p>
            Already have an account? <Link to="/login" className="link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}