import './login.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setMessage('Please enter a valid 6-digit code');
      setMessageType('error');
      return;
    }

    console.log('Verify button clicked');

    try {
      const response = await fetch(`http://localhost:3000/api/login/code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Code verified successfully!');
        setMessageType('success');
        navigate("/dashboard", { state: email });
        
      } else {
        setMessage(data.error || 'Invalid code');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setMessage('Error verifying code. Please try again.');
      setMessageType('error');
    }
  };

  const handleResend = async () => {
    console.log('Resend button clicked');
    try {
      const response = await fetch(`http://localhost:3000/api/login?email=${encodeURIComponent(email)}`, {
        credentials: 'include'
      });
      if (response.ok) {
        setMessage('Code resent to your email');
        setMessageType('success');
      } else {
        setMessage('Error resending code');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setMessage('Error resending code');
      setMessageType('error');
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
            <h1 className="login-title">Verify Your Email</h1>
            <p className="login-subtitle">Enter the 6-digit verification code sent to your email</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Enter Verification Code</h2>
            <div className="code-inputs">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  className="digit-input"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                />
              ))}
            </div>
            {message && <p className={`message ${messageType}`}>{message}</p>}
            <button className="button login-button" onClick={handleVerify}>
              Verify Code
            </button>
            <p className="resend-prompt">
              Didn't receive the code? <button className="link" onClick={handleResend}>Resend</button>
            </p>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              Wrong email? <Link to="/login" className="signup-link">Go back</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}