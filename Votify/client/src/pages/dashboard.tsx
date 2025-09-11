import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/voxplatform_logo.png';
import './dashboard.css';

interface Voting {
  id: number;
  title: string;
  status: string;
  endDate: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
}

interface CalendarVoting {
  id: number;
  title: string;
  date: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [votings, setVotings] = useState<Voting[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [calendarVotings, setCalendarVotings] = useState<CalendarVoting[]>([]);

  useEffect(() => {
    // Check authentication
    fetch('http://localhost:3000/api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          // Fetch dashboard data
          fetchVotings();
          fetchGroups();
          fetchCalendarVotings();
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchVotings = () => {
    // Placeholder: fetch from /api/dashboard/votings
    // For now, mock data
    setVotings([
      { id: 1, title: 'School Council Election', status: 'In Progress', endDate: '2023-10-01' },
      { id: 2, title: 'Company Policy Vote', status: 'In Progress', endDate: '2023-10-05' }
    ]);
  };

  const fetchGroups = () => {
    // Placeholder: fetch from /api/dashboard/groups
    setGroups([
      { id: 1, name: 'School Council', description: 'Student representatives', members: 25 },
      { id: 2, name: 'Company Board', description: 'Executive decisions', members: 10 },
      { id: 3, name: 'Community Group', description: 'Local initiatives', members: 50 }
    ]);
  };

  const fetchCalendarVotings = () => {
    // Placeholder: fetch from /api/dashboard/calendar
    setCalendarVotings([
      { id: 1, title: 'School Council Election', date: '2023-09-15' },
      { id: 2, title: 'Company Policy Vote', date: '2023-09-18' }
    ]);
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  // Get current week dates
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const week = getCurrentWeek();

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
        {/* Votings in Progress */}
        <div className="dashboard-section">
          <h2>Votings in Progress</h2>
          <div className="votings-list">
            {votings.map(voting => (
              <div key={voting.id} className="voting-card">
                <h3>{voting.title}</h3>
                <p>Status: {voting.status}</p>
                <p>Ends: {voting.endDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Groups List */}
        <div className="dashboard-section">
          <h2>Groups</h2>
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group.id} className="group-card">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                <p>Members: {group.members}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="dashboard-section">
          <h2>Weekly Votings</h2>
          <div className="calendar">
            {week.map((date, index) => (
              <div key={index} className="calendar-day">
                <h4>{date.toDateString()}</h4>
                <div className="day-votings">
                  {calendarVotings
                    .filter(v => new Date(v.date).toDateString() === date.toDateString())
                    .map(v => (
                      <div key={v.id} className="calendar-voting">
                        {v.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}