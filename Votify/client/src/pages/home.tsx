import './home.css'
import logo from '../assets/voxplatform_logo.png';
import { Link } from 'react-router-dom';

export default function HomePage() {
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
      </div>

      {/* Top bar */}
      <div className="top_bar">
        <button className='button'>View Groups</button>
        <button className='button'>Create Group</button>
      </div>

      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="VoxPlatform Logo" />
      </div>

      {/* Main Heading */}
      <h1>VoxPlatform</h1>
      <p>
        VoxPlatform, the best online voting service under the sun. Try now for free.
      </p>

      {/* Action buttons */}
      <div className="action_selection">
        <Link to="/login" className='button'>Login</Link>
        <Link to="/register" className='button'>Create Account</Link>
      </div>
    </div>
  );
}