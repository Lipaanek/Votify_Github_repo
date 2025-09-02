import './home.css';
import logo from '../assets/voxplatform_logo.png';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="App">
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
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">VoxPlatform</h1>
          <p className="hero-subtitle">Your Voice, Your Vote, Your Impact.</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/login" className="button">Login</Link>
          <Link to="/register" className="button secondary">Create Account</Link>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🏫</div>
            <h3 className="feature-title">For Schools</h3>
            <p className="feature-description">
              Empower student councils and democratic processes with secure online voting.
            </p>
            <Link className='pricing' to="/login">FREE</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">For Individuals</h3>
            <p className="feature-description">
              Participate in community decisions and make your voice heard.
            </p>
            <Link className='pricing' to="/login">FREE</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3 className="feature-title">For Companies</h3>
            <p className="feature-description">
              Streamline corporate voting and governance with our trusted platform.
            </p>
            <Link className='pricing' to="/login">FREE</Link>
          </div>
        </div>
      </div>
    </div>
  );
}