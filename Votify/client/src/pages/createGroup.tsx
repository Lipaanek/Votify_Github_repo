import './login.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    fetch('http://voxplatform.fit.vutbr.cz:3000/api/auth/check', {
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

  const handleCreateGroup = () => {
    let valid = true;
    setNameError('');

    if (!name.trim()) {
      setNameError('Group name is required');
      valid = false;
    }

    if (valid) {
      setLoading(true);
      fetch('http://voxplatform.fit.vutbr.cz:3000/api/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      })
        .then(res => {
          console.log('Response status:', res.status);
          console.log('Response headers:', res.headers);
          return res.json();
        })
        .then(data => {
          console.log('Response data:', data);
          if (data.groupId) {
            navigate('/dashboard');
          } else {
            alert('Error creating group: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          console.error('Error creating group:', err);
          alert('Error creating group: ' + err.message);
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
            <h1 className="login-title">Create New Group</h1>
            <p className="login-subtitle">Start your own voting group for secure democratic decisions</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Group Details</h2>
            <p className="form-description">Enter the details for your new group</p>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
              <div className="form-group">
                <label htmlFor="name">Group Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {nameError && <p className="error-message">{nameError}</p>}
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className='form-group'>
                <button type="submit" className="button login-button" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              Want to join an existing group? <Link to="/dashboard" className="signup-link">Go to Dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
