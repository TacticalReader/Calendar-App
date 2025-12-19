import { useState, useEffect, useMemo } from "react";

const CALENDERAPP = () => {
  const daysofWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [eventTime, setEventTime] = useState("00:00");
  const [eventText, setEventText] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        return JSON.parse(savedEvents).map(event => ({
          ...event,
          date: new Date(event.date),
        }));
      }
    } catch (error) {
      console.error("Failed to parse events from localStorage", error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
    }
  };

  const handleDateClick = (clickedDate) => {
    if (clickedDate < new Date(today.toDateString())) return;

    setSelectedDate(clickedDate);
    setShowEventPopup(true);
    setEventTime("00:00");
    setEventText("");
    setEditingEvent(null);
  }

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  const handleEventSubmit = () => {
    if (!eventText) return;
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: eventTime,
      text: eventText
    }

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    updatedEvents.sort((a, b) => new Date(a.date).setHours(a.time.split(':')[0], a.time.split(':')[1]) - new Date(b.date).setHours(b.time.split(':')[0], b.time.split(':')[1]));

    setEvents(updatedEvents);
    setShowEventPopup(false);
    setEventText("");
    setEditingEvent(null);
  }

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    setEventTime(event.time);
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  }

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  }

  const handleTimeChange = (e) => {
    setEventTime(e.target.value);
  }

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const filteredEvents = useMemo(() => {
    if (view === 'day') {
      return events.filter(event => isSameDay(event.date, currentDate));
    }
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [view, events, currentDate]);

  const renderHeader = () => {
    if (view === 'month') {
      return `${monthsOfYear[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    }
    if (view === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      const dateKey = event.date.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  const renderMonthView = () => (
    <>
      {[...Array(firstDayOfMonth).keys()].map((_, index) => (
        <span key={`empty-${index}`}></span>
      ))}
      {[...Array(daysInMonth).keys()].map((day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
        const isCurrentDay = isSameDay(date, today);
        const hasEvent = eventsByDay[date.toDateString()];
        return (
          <span
            key={day + 1}
            className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''}`}
            onClick={() => handleDateClick(date)}
          >
            {day + 1}
          </span>
        );
      })}
    </>
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    return weekDays.map((day, index) => {
      const isCurrentDay = isSameDay(day, today);
      const hasEvent = eventsByDay[day.toDateString()];
      return (
        <span
          key={index}
          className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day.getDate()}
        </span>
      );
    });
  };

  return (
    <div className={`calender-app ${view}-view`}>
      <div className="calender">
        <div className="calender-header">
          <h1 className="heading">Calendar</h1>
          <div className="view-switcher">
            <button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>Month</button>
            <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>Week</button>
            <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>Day</button>
          </div>
        </div>
        <div className="nevigate-date">
          <h2>{renderHeader()}</h2>
          <div className="buttons">
            <i className="bx bx-chevron-left" onClick={handlePrev}></i>
            <i className="bx bx-chevron-right" onClick={handleNext}></i>
          </div>
        </div>
        {view !== 'day' && (
          <>
            <div className="weekdays">
              {daysofWeek.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="days">
              {view === 'month' ? renderMonthView() : renderWeekView()}
            </div>
          </>
        )}
      </div>

      <div className="events">
        {showEventPopup && (
          <div className="event-popup">
            <div className="time-input">
              <div className="event-popup-time">Time</div>
              <input 
                type="time" 
                name="time" 
                className="event-time-input" 
                value={eventTime} 
                onChange={handleTimeChange} 
                aria-label="Event Time"
              />
            </div>
            <textarea 
              placeholder="Enter Event Text (Maximum 60 characters)" 
              value={eventText} 
              maxLength={60}
              onChange={(e) => setEventText(e.target.value)} 
            ></textarea>
            <button className="event-popup-btn" onClick={handleEventSubmit}>
              {editingEvent ? 'Update Event' : 'Add Event'}
            </button>
            <button className="close-event-popup" onClick={() => setShowEventPopup(false)} >
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
        {filteredEvents.map((event) => (
          <div className="event" key={event.id}>
            <div className="event-date-wrapper">
              <div className="event-date">
                {`${monthsOfYear[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`}
              </div>
              <div className="event-time">{event.time}</div>
            </div>
            <div className="event-text">{event.text}</div>
            <div className="event-buttons">
              <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
              <i className="bx bxs-message-alt-x" onClick={() => handleDeleteEvent(event.id)}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CALENDERAPP;
