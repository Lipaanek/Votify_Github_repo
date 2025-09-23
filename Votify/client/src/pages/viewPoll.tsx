import './login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import logo from '../assets/voxplatform_logo.png';

interface Option {
  optionName: string;
  votes: number;
  optionDescription?: string;
}

interface Poll {
  title: string;
  options: Option[];
  end: string;
  votes: number;
  alreadyVoted: string[];
}

export default function ViewPollPage() {
  const navigate = useNavigate();
  const { pollId } = useParams<{ pollId: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    fetch('http://localhost:3000/api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          fetchPoll();
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate, pollId]);

  const fetchPoll = () => {
    if (!pollId) return;
    fetch(`http://localhost:3000/api/poll/${pollId}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.poll) {
          setPoll(data.poll);
        } else {
          alert('Poll not found');
          navigate('/dashboard');
        }
      })
      .catch(err => {
        console.error('Error fetching poll:', err);
        alert('Error loading poll');
      })
      .finally(() => setLoading(false));
  };

  if (!authenticated || loading) {
    return <div>Loading...</div>;
  }

  if (!poll) {
    return <div>Poll not found</div>;
  }

  return (
    <div className="App">
      <div className="top_bar">
        <div className="logo">
          <img src={logo} alt="VoxPlatform Logo" />
        </div>
        <div className="nav-buttons">
          <Link to="/dashboard" className="button2">Dashboard</Link>
          <Link to="/login" className="button2">Logout</Link>
        </div>
      </div>

      <div className="login-main">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <img src={logo} alt="VoxPlatform Logo" className="login-logo" />
            </div>
            <h1 className="login-title">{poll.title}</h1>
            <p className="login-subtitle">Ends on {new Date(poll.end).toLocaleString()}</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Options</h2>
            <div className="options-list">
              {poll.options.length === 0 ? (
                <p>No options yet. Add some!</p>
              ) : (
                poll.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <h3>{option.optionName}</h3>
                    {option.optionDescription && <p>{option.optionDescription}</p>}
                    <p>Votes: {option.votes}</p>
                  </div>
                ))
              )}
            </div>
            <div className="form-group">
              <button
                className="button login-button"
                onClick={() => navigate(`/add-option/${pollId}`)}
              >
                Add Option
              </button>
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              <Link to="/dashboard" className="signup-link">Back to Dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}