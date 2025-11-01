import './login.css';
import logo from '../assets/voxplatform_logo.png';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Group {
  id: number;
  name: string;
  description: string;
}

export default function JoinGroupPage() {
  const navigate = useNavigate();
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [groupId, setGroupId] = useState(urlGroupId || '');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    fetch('http://voxplatform.fit.vutbr.cz:3000/api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          // Auto-search if groupId is in URL
          if (urlGroupId) {
            handleSearch(urlGroupId);
          }
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate, urlGroupId]);

  const handleSearch = (searchGroupId?: string) => {
    const idToSearch = searchGroupId || groupId.trim();
    if (!idToSearch) {
      setError('Please enter a group ID');
      return;
    }

    setLoading(true);
    setError('');
    setGroup(null);

    fetch(`http://voxplatform.fit.vutbr.cz:3000/api/group/${idToSearch}/public`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.group) {
          setGroup(data.group);
        } else {
          setError('Group not found');
        }
      })
      .catch(err => {
        console.error('Error searching group:', err);
        setError('Error searching for group');
      })
      .finally(() => setLoading(false));
  };

  const handleJoin = () => {
    if (!group) return;

    setLoading(true);
    fetch(`http://voxplatform.fit.vutbr.cz:3000/api/group/${group.id}/join`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate(`/group/${group.id}`);
        } else {
          setError(data.error || 'Error joining group');
        }
      })
      .catch(err => {
        console.error('Error joining group:', err);
        setError('Error joining group');
      })
      .finally(() => setLoading(false));
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
            <h1 className="login-title">Join Group</h1>
            <p className="login-subtitle">Enter a group ID to join an existing group</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Find Group</h2>
            <div className="form-group">
              <label htmlFor="groupId">Group ID</label>
              <input
                type="text"
                id="groupId"
                name="groupId"
                placeholder="Enter group ID"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <button
                className="button login-button"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Group'}
              </button>
            </div>

            {group && (
              <>
                <div className="divider">
                  <span>Group Found</span>
                </div>
                <div className="group-preview">
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                  <p><strong>Group ID:</strong> {group.id}</p>
                </div>
                <div className="form-group">
                  <button
                    className="button login-button"
                    onClick={handleJoin}
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join Group'}
                  </button>
                </div>
              </>
            )}

            <div className="divider">
              <span>or</span>
            </div>
            <p className="signup-prompt">
              Want to create a new group? <Link to="/create-group" className="signup-link">Create Group</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
