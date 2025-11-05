import './login.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AddOptionPage() {
  const navigate = useNavigate();
  const { pollId } = useParams<{ pollId: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionDescription, setOptionDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    fetch('//api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleAddOption = () => {
    let valid = true;
    setNameError('');

    if (!optionName.trim()) {
      setNameError('Option name is required');
      valid = false;
    }

    if (valid && pollId) {
      setLoading(true);
      fetch(`//api/poll/${pollId}/option`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          optionName: optionName.trim(),
          optionDescription: optionDescription.trim() || undefined
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            navigate(`/view-poll/${pollId}`);
          } else {
            alert('Error adding option: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          console.error('Error adding option:', err);
          alert('Error adding option');
        })
        .finally(() => setLoading(false));
    }
  };

  if (!authenticated) {
    return <div>Loading...</div>;
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
            <h1 className="login-title">Add Option</h1>
            <p className="login-subtitle">Add a new option to the poll</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Option Details</h2>
            <p className="form-description">Enter the details for the new option</p>
            <form onSubmit={(e) => { e.preventDefault(); handleAddOption(); }}>
              <div className="form-group">
                <label htmlFor="optionName">Option Name *</label>
                <input
                  type="text"
                  id="optionName"
                  name="optionName"
                  placeholder="Enter option name"
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  required
                />
              </div>
              {nameError && <p className="error-message">{nameError}</p>}
              <div className="form-group">
                <label htmlFor="optionDescription">Description (Optional)</label>
                <textarea
                  id="optionDescription"
                  name="optionDescription"
                  placeholder="Describe the option..."
                  value={optionDescription}
                  onChange={(e) => setOptionDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className='form-group'>
                <button type="submit" className="button login-button" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Option'}
                </button>
              </div>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              <Link to={`/view-poll/${pollId}`} className="signup-link">Back to Poll</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
