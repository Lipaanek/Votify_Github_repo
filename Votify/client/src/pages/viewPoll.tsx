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
  const [userEmail, setUserEmail] = useState<string>('');
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    fetch('//api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          setUserEmail(data.email);
          fetchPoll();
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate, pollId]);

  const fetchPoll = () => {
    if (!pollId) return;
    fetch(`//api/poll/${pollId}`, {
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

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const voteForOption = (optionName: string) => {
    if (!pollId) return;
    fetch(`//api/poll/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ optionName }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchPoll(); // Refetch to update votes and alreadyVoted
        } else {
          alert('Error voting');
        }
      })
      .catch(err => {
        console.error('Error voting:', err);
        alert('Error voting');
      });
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
                <p style={{ textAlign: 'center' }}>No options yet. Add some!</p>
              ) : (
                shuffleArray(poll.options).map((option, index) => (
                  <div key={index} className="option-item">
                    <h3>{option.optionName}</h3>
                    {option.optionDescription && <p>{option.optionDescription}</p>}
                    <p>Votes: {option.votes}</p>
                    <button
                      className="button login-button"
                      onClick={() => voteForOption(option.optionName)}
                      disabled={poll.alreadyVoted.includes(userEmail) || new Date(poll.end) <= new Date()}
                      style={{ opacity: (poll.alreadyVoted.includes(userEmail) || new Date(poll.end) <= new Date()) ? 0.5 : 1 }}
                    >
                      {new Date(poll.end) <= new Date() ? "Poll Ended" : "Vote"}
                    </button>
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
