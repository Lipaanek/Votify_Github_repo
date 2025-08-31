import './auth.css';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const handleLogin = () => {
    // Placeholder for login logic
    console.log('Login button clicked');
  };

  return (
    <div className="App">
      {/* Top bar */}
      <div className="top_bar">
        <button className='button'>View Groups</button>
        <button className='button'>Create Group</button>
      </div>

      {/* Login Form */}
      <div className="form-container">
        <h2>Login to VoxPlatform</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
        />
        <button className="submit-button" onClick={handleLogin}>
          Login
        </button>
        <p>
          Don't have an account? <Link to="/register" className="button">Register</Link>
        </p>
      </div>
    </div>
  );
}