import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/voxplatform_logo.png';
import './calendar.css';
import '../pages/auth.css'; // For shared styles like top_bar

interface Voting {
  id: number;
  title: string;
  date: string;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [votings, setVotings] = useState<Voting[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Check authentication
    fetch('http://localhost:3000/api/auth/check', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          fetchMonthlyVotings(currentDate.getFullYear(), currentDate.getMonth());
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate, currentDate]);

  const fetchMonthlyVotings = (year: number, month: number) => {
    // Placeholder: fetch from /api/calendar/monthly
    // For now, mock data
    setVotings([
      { id: 1, title: 'School Council Election', date: '2023-09-15' },
      { id: 2, title: 'Company Policy Vote', date: '2023-09-18' },
      { id: 3, title: 'Community Meeting', date: '2023-09-22' }
    ]);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getVotingsForDate = (date: Date) => {
    return votings.filter(v => new Date(v.date).toDateString() === date.toDateString());
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString('en', { month: 'long' });

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
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

      {/* Calendar Content */}
      <div className="calendar-content">
        {/* Left Sidebar - Mini Calendar */}
        <div className="mini-calendar">
          <div className="mini-header">
            <button onClick={() => changeMonth(-1)}>&larr;</button>
            <h3>{monthName} {year}</h3>
            <button onClick={() => changeMonth(1)}>&rarr;</button>
          </div>
          <div className="mini-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="mini-day-header">{day}</div>
            ))}
            {Array.from({ length: 42 }, (_, i) => {
              const day = i - firstDay + 1;
              const isCurrentMonth = day > 0 && day <= daysInMonth;
              const date = isCurrentMonth ? new Date(year, month, day) : null;
              const hasEvent = date && getVotingsForDate(date).length > 0;
              return (
                <div key={i} className={`mini-day ${isCurrentMonth ? '' : 'other-month'}`}>
                  {isCurrentMonth && (
                    <>
                      <span className="mini-day-number">{day}</span>
                      {hasEvent && <div className="mini-event-indicator"></div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Calendar */}
        <div className="main-calendar">
          <div className="main-header">
            <h2>{monthName} {year}</h2>
          </div>
          <div className="calendar-grid">
            {/* Days of week header */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="grid-header">{day}</div>
            ))}

            {/* Calendar cells */}
            {calendarDays.map((day, index) => {
              const date = day ? new Date(year, month, day) : null;
              const dayVotings = date ? getVotingsForDate(date) : [];
              return (
                <div key={index} className={`calendar-cell ${day ? '' : 'empty'}`}>
                  {day && (
                    <>
                      <div className="cell-date">{day}</div>
                      <div className="cell-events">
                        {dayVotings.map(voting => (
                          <div key={voting.id} className="event-stripe">
                            {voting.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}