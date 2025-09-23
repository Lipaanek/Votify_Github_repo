import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/voxplatform_logo.png';
import './dashboard.css';

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
}

interface Poll {
  id: number;
  title: string;
  end: string;
  votes: number;
  options: any[];
  alreadyVoted: string[];
}

export default function GroupPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
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
          setEmail(data.email);
          // Check membership and fetch group
          checkMembershipAndFetchGroup(data.email);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate, groupId]);

  const checkMembershipAndFetchGroup = (userEmail: string) => {
    if (!groupId) return;

    // First, get user groups to check membership
    fetch(`http://localhost:3000/api/info/groups?email=${encodeURIComponent(userEmail)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.userGroups) {
          const userGroup = data.userGroups.find((g: any) => g.id === parseInt(groupId));
          if (userGroup) {
            setIsMember(true);
            setGroup({
              id: userGroup.id,
              name: userGroup.name,
              description: userGroup.description || '',
              members: 0 // Placeholder
            });
            fetchPolls();
          } else {
            setIsMember(false);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching group:', err);
        setLoading(false);
      });
  };

  const fetchPolls = () => {
    if (!groupId) return;
    fetch(`http://localhost:3000/api/group/${groupId}/polls`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.polls) {
          setPolls(data.polls);
        }
      })
      .catch(err => {
        console.error('Error fetching polls:', err);
      });
  };

  if (!authenticated || loading) {
    return <div>Loading...</div>;
  }

  if (!isMember) {
    return (
      <div className="App">
        <div className="top_bar">
          <div className="logo">
            <img src={logo} alt="VoxPlatform Logo" />
          </div>
          <div className="nav-buttons">
            <button onClick={() => navigate('/dashboard')} className="button2">Dashboard</button>
            <button onClick={() => navigate('/login')} className="button2">Logout</button>
          </div>
        </div>
        <div className="main-content">
          <h2>Access Denied</h2>
          <p>You are not a member of this group.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Top bar */}
      <div className="top_bar">
        <div className="logo">
          <img src={logo} alt="VoxPlatform Logo" />
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/dashboard')} className="button2">Dashboard</button>
          <button onClick={() => navigate('/login')} className="button2">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Group Info */}
        <div className="dashboard-section">
          <h2>{group?.name}</h2>
          <p>{group?.description}</p>
          <p>Members: {group?.members}</p>
        </div>

        {/* Polls */}
        <div className="dashboard-section">
          <h2>Polls</h2>
          <div className="group-polls-list">
            {polls.length === 0 ? (
              <div className="no-data">
                <h3>No Polls</h3>
                <p>Create a poll to get started!</p>
              </div>
            ) : (
              polls.map(poll => (
                <div key={poll.id} className="group-poll-card">
                  <div className="card-top">
                    <h3>{poll.title}</h3>
                    <p className="poll-end-date">Ends: {new Date(poll.end).toLocaleDateString()}</p>
                  </div>
                  <div className="card-bottom">
                    <button className="enter-button poll-enter" onClick={() => navigate(`/view-poll/${poll.id}`)}>Enter</button>
                    <p>{poll.votes} votes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}