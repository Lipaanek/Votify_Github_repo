import './home.css';
import logo from '../assets/voxplatform_logo.png';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function VerifyPage() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits

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

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setMessage('Please enter a valid 6-digit code');
      setMessageType('error');
      return;
    }

    // Placeholder for verify logic
    console.log('Verify button clicked');
    // Simulate success
    setMessage('Verification successful!');
    setMessageType('success');
  };

  const handleResend = () => {
    // Placeholder for resend logic
    console.log('Resend button clicked');
    setMessage('Code resent to your email');
    setMessageType('success');
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
        {/* Verify Form */}
        <div className="form-container">
          <h2 className="hero-title">Verify Your Email</h2>
          <p className="hero-subtitle">Enter the 6-digit verification code sent to your email.</p>
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
          <button className="button" onClick={handleVerify}>
            Verify Code
          </button>
          <p>
            Didn't receive the code? <button className="link" onClick={handleResend}>Resend</button>
          </p>
        </div>
      </div>
    </div>
  );
}