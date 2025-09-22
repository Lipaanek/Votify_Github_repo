import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../assets/voxplatform_logo.png';
import './dashboard.css';

interface ActivePoll {
  id: number;
  groupName: string;
  votes: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
}


export default function DashboardPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [activePolls, setActivePolls] = useState<ActivePoll[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);

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
          // Fetch dashboard data
          fetchActivePolls();
          fetchJoinedGroups(data.email);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchActivePolls = () => {
    // For now, mock data since polls are not implemented
    setActivePolls([
      { id: 1, groupName: 'School Council', votes: 15 },
      { id: 2, groupName: 'Company Board', votes: 8 },
      { id: 3, groupName: 'Company Board', votes: 8 },
      { id: 4, groupName: 'Company Board', votes: 8 },
    ]);
  };

  const fetchJoinedGroups = (userEmail: string) => {
    fetch(`http://localhost:3000/api/info/groups?email=${encodeURIComponent(userEmail)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.userGroups) {
          setJoinedGroups(data.userGroups.map((group: any, index: number) => ({
            id: group.id || index,
            name: group.name,
            description: group.description || '',
            members: group.members || 0
          })));
        } else {
          setJoinedGroups([]);
        }
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
        setJoinedGroups([]);
      });
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }


  return (
    <div className="App">
      {/* Top bar */}
      <div className="top_bar">
        <div className="logo">
          <img src={logo} alt="VoxPlatform Logo" />
        </div>
        <div className="nav-buttons">
          <Link to="/dashboard" className="button2">Dashboard</Link>
          <Link to="/login" className="button2">Logout</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Active Polls */}
        <div className="dashboard-section">
          <h2>Active polls</h2>
          <div className="active-polls-list">
            {activePolls.length === 0 ? (
              <div className="no-data">
                <h3>No Active Polls</h3>
                <p>Join groups to participate in polls!</p>
              </div>
            ) : (
              activePolls.map(poll => (
                <div key={poll.id} className="poll-card">
                  <div className="card-top">
                    <h3>{poll.groupName.toUpperCase()}</h3>
                  </div>
                  <div className="card-bottom">
                    <button className="enter-button poll-enter">Enter</button>
                    <p>{poll.votes} votes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Joined Groups */}
        <div className="dashboard-section">
          <h2>Joined groups</h2>
          <div className="joined-groups-list">
            {joinedGroups.length === 0 ? (
              <div className="no-data">
                <h3>No Groups</h3>
                <p>Join groups now!</p>
              </div>
            ) : (
              joinedGroups.map(group => (
                <div key={group.id} className="group-card">
                  <div className="card-top">
                    <h3>{group.name.toUpperCase()}</h3>
                  </div>
                  <div className="card-bottom">
                    <button className="enter-button group-enter" onClick={() => navigate(`/group/${group.id}`)}>Enter</button>
                    <p>{group.members} members</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dashboard-buttons">
          <Link to="/create-group" className="action-button">Create group</Link>
          <Link to="/create-poll" className="action-button">Create poll</Link>
          <button className="action-button">Join group</button>
        </div>
      </div>
    </div>
  );
}