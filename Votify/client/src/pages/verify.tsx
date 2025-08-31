import './auth.css';
import { Link } from 'react-router-dom';

export default function VerifyPage() {
  const handleVerify = () => {
    // Placeholder for verify logic
    console.log('Verify button clicked');
  };

  return (
    <div className="App">
      {/* Top bar */}
      <div className="top_bar">
        <button className='button'>View Groups</button>
        <button className='button'>Create Group</button>
      </div>

      {/* Verify Form */}
      <div className="form-container">
        <h2>Verify Your Email</h2>
        <p>Enter the verification code sent to your email.</p>
        <input
          type="text"
          placeholder="Verification Code"
          className="input-field"
        />
        <button className="submit-button" onClick={handleVerify}>
          Verify
        </button>
        <p>
          Didn't receive the code? <button className="button">Resend</button>
        </p>
      </div>
    </div>
  );
}