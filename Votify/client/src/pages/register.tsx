import './login.css';
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
      fetch("http://voxplatform.fit.vutbr.cz:3000/api/register?email=" + encodeURIComponent(email), {
        credentials: 'include'
      }).catch(err => {
        console.error('Error sending registration request:', err);
      });
      navigate('/verify', { state: { email } });
    }
  };

  return (
    <div className="App">
      <div className="top_bar">
        <div className="logo">
          <img src={logo} alt="VoxPlatform Logo" />
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="button2">View Groups</Link>
          <Link to="/register" className="button2">Create Group</Link>
          <Link to="/login" className="button2">Login</Link>
        </div>
      </div>

      <div className="login-main">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <img src={logo} alt="VoxPlatform Logo" className="login-logo" />
            </div>
            <h1 className="login-title">Join VoxPlatform</h1>
            <p className="login-subtitle">Create your account and start participating in secure online voting</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Create Account</h2>
            <p className="form-description">Enter your email address and we'll send you a registration code</p>
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {emailError && <p className="error-message">{emailError}</p>}
              <button type="submit" className="button login-button">
                Send Registration Code
              </button>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
