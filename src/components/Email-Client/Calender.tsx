import { useState } from 'react';
import styles from './EmailClient.module.scss';

const Calendar = () => {
  const todayDate = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
  const [view, setView] = useState('day'); // "day" or "month"
  const [selectedDate, setSelectedDate] = useState(todayDate); // Initially set to today
  const [showCustomDate, setShowCustomDate] = useState(false); // Track custom date mode

  // Example events for various dates
  const eventsByDate = {
    '2024-10-01': [
      { time: '09:00 AM', description: 'Project Kickoff' },
      { time: '12:00 PM', description: 'Client Lunch' },
    ],
    '2024-10-03': [
      { time: '10:00 AM', description: 'Sales Meeting' },
      { time: '02:00 PM', description: 'Design Review' },
    ],
    '2024-10-05': [
      { time: '11:00 AM', description: 'Development Sprint' },
    ],
  };

  const dayEvents = eventsByDate[selectedDate] || [];

  // Month events
  const monthEvents = [
    { date: 'October 1', description: 'Team Building Event' },
    { date: 'October 3', description: 'Client Onboarding Meeting' },
    { date: 'October 5', description: 'Product Launch Planning' },
    { date: 'October 10', description: 'Sales Pitch Presentation' },
    { date: 'October 15', description: 'Monthly Review Meeting' },
    { date: 'October 20', description: 'Project Handover' },
    { date: 'October 25', description: 'Team Outing' },
    { date: 'October 30', description: 'Year-End Wrap-up' },
  ];

  const handleToggleView = (newView) => {
    setView(newView);
    setShowCustomDate(false); // Reset to not show custom date when switching views
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setShowCustomDate(true); // Show activities for the chosen date
  };

  const handleTodayClick = () => {
    setSelectedDate(todayDate); // Reset to today
    setShowCustomDate(true); // Show today's activities
  };

  const renderDayView = () => (
    <div className={styles['calendar-events']}>
      {dayEvents.length > 0 ? (
        dayEvents.map((event, index) => (
          <div key={index} className={styles['calendar-event']}>
            <strong>{event.time}</strong>
            <p>{event.description}</p>
          </div>
        ))
      ) : (
        <p>No events for this day.</p>
      )}
    </div>
  );

  const renderMonthView = () => (
    <div className={styles['calendar-events']}>
      {monthEvents.map((event, index) => (
        <div key={index} className={styles['calendar-event']}>
          <strong>{event.date}</strong>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles['calendar']}>
      <div className={styles['calendar-header']}>
        <button
          className={view === 'day' && !showCustomDate ? `${styles['calendar-button']} ${styles['active']}` : styles['calendar-button']}
          onClick={() => handleToggleView('day')}
        >
          Day
        </button>
        <button
          className={view === 'month' ? `${styles['calendar-button']} ${styles['active']}` : styles['calendar-button']}
          onClick={() => handleToggleView('month')}
        >
          Month
        </button>

        {/* Date Picker for custom day */}
        <input
          type="date"
          className={styles['calendar-button']}
          value={selectedDate}
          onChange={handleDateChange}
        />

        {/* Today Button */}
        <button
          className={styles['calendar-button']}
          onClick={handleTodayClick}
        >
          Today
        </button>
      </div>

      {/* Render based on selected view */}
      {view === 'day' && showCustomDate ? renderDayView() : view === 'day' ? renderDayView() : renderMonthView()}
    </div>
  );
};

export default Calendar;

