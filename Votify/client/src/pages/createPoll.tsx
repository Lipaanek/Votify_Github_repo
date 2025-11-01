import './login.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Group {
  id: number;
  name: string;
  description: string;
}

export default function CreatePollPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId?: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState('');
  const [titleError, setTitleError] = useState('');
  const [groupError, setGroupError] = useState('');
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
          fetchGroups(data.email);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchGroups = (userEmail: string) => {
    fetch(`http://voxplatform.fit.vutbr.cz:3000/api/info/groups?email=${encodeURIComponent(userEmail)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.userGroups) {
          setGroups(data.userGroups);
          if (groupId) {
            const group = data.userGroups.find((g: Group) => g.id === parseInt(groupId));
            if (group) {
              setSelectedGroupId(group.id);
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
      });
  };

  const handleCreatePoll = () => {
    let valid = true;
    setTitleError('');
    setGroupError('');

    if (!selectedGroupId) {
      setGroupError('Please select a group');
      valid = false;
    }

    if (!title.trim()) {
      setTitleError('Poll title is required');
      valid = false;
    }

    if (!endDate) {
      // Maybe add error for end date
      valid = false;
    }

    if (valid) {
      setLoading(true);
      fetch('http://voxplatform.fit.vutbr.cz:3000/api/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: selectedGroupId,
          title: title.trim(),
          end: new Date(endDate).toISOString()
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.pollId) {
            navigate(`/view-poll/${data.pollId}`);
          } else {
            alert('Error creating poll: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          console.error('Error creating poll:', err);
          alert('Error creating poll');
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
            <h1 className="login-title">Create New Poll</h1>
            <p className="login-subtitle">Create a poll for your group to gather opinions</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Poll Details</h2>
            <p className="form-description">Enter the details for your new poll</p>
            <form onSubmit={(e) => { e.preventDefault(); handleCreatePoll(); }}>
              <div className="form-group">
                <label htmlFor="group">Select Group *</label>
                <select
                  id="group"
                  name="group"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value) || '')}
                  required
                >
                  <option value="">Choose a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              {groupError && <p className="error-message">{groupError}</p>}
              <div className="form-group">
                <label htmlFor="title">Poll Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter poll title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              {titleError && <p className="error-message">{titleError}</p>}
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <button type="submit" className="button login-button" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Poll'}
                </button>
              </div>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              Want to go back? <Link to="/dashboard" className="signup-link">Go to Dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
