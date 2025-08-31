import './auth.css';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = () => {
    // Placeholder for register logic
    console.log('Register button clicked');
    // After submit, navigate to verify
    navigate('/verify');
  };

  return (
    <div className="App">
      {/* Top bar */}
      <div className="top_bar">
        <button className='button'>View Groups</button>
        <button className='button'>Create Group</button>
      </div>

      {/* Register Form */}
      <div className="form-container">
        <h2>Register for VoxPlatform</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
        />
        <button className="submit-button" onClick={handleRegister}>
          Register
        </button>
        <p>
          Already have an account? <Link to="/login" className="button">Login</Link>
        </p>
      </div>
    </div>
  );
}