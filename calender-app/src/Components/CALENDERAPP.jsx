import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

const CALENDERAPP = () => {
  const daysofWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Use a stable reference for "today" to avoid hydration mismatches or stale state if left open overnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appRef = useRef(null);
  const gridRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  const [showEventPopup, setShowEventPopup] = useState(false);
  const [eventText, setEventText] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Framer Motion Value for Swipe
  const x = useMotionValue(0);

  // Time Picker State (UI only)
  const [timeHours, setTimeHours] = useState("12");
  const [timeMinutes, setTimeMinutes] = useState("00");
  const [timePeriod, setTimePeriod] = useState("AM");

  // History & Notification State
  const [past, setPast] = useState([]);
  // Future state reserved for potential Redo functionality
  // eslint-disable-next-line no-unused-vars
  const [future, setFuture] = useState([]);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

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

  // Measure grid height for smooth transition
  useEffect(() => {
    if (gridRef.current) {
      setContainerHeight(`${gridRef.current.scrollHeight}px`);
    }
  }, [currentDate, view, isAnimating]);

  // Toast Timer Management
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper: Format 24h to 12h for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [h, m] = timeString.split(':');
    let hours = parseInt(h);
    const minutes = m;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Helper: Parse 24h to UI state
  const parseTimeForUI = (timeString) => {
    const [h, m] = timeString.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    setTimeHours(hours.toString().padStart(2, '0'));
    setTimeMinutes(m);
    setTimePeriod(ampm);
  };

  // Core State Manager with History
  const saveEvents = (newEvents) => {
    setPast(prev => [...prev, events]);
    setEvents(newEvents);
    setFuture([]);
  };

  // Notification Permission Request
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setToast({ message: "Notifications enabled!", visible: true });
      new Notification("Calendar App", { body: "You will now receive alerts for upcoming events." });
    } else {
      setToast({ message: "Permission denied", visible: true });
    }
  };

  // Notification Checker Effect
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const checkEvents = () => {
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        // Skip if already notified
        if (event.notified) return false;

        const eventDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':').map(Number);
        eventDate.setHours(hours, minutes, 0, 0);

        const timeDiff = eventDate.getTime() - now.getTime();
        // Notify if within 10 minutes (600000 ms) and in the future
        return timeDiff > 0 && timeDiff <= 600000;
      });

      if (upcomingEvents.length > 0) {
        upcomingEvents.forEach(event => {
          new Notification("Upcoming Event", {
            body: `${event.text} at ${formatTime(event.time)}`,
            icon: "/favicon.ico"
          });
        });

        setEvents(prevEvents => 
          prevEvents.map(ev => 
            upcomingEvents.find(up => up.id === ev.id) 
              ? { ...ev, notified: true } 
              : ev
          )
        );
      }
    };

    const intervalId = setInterval(checkEvents, 60000); // Check every minute
    checkEvents(); // Initial check

    return () => clearInterval(intervalId);
  }, [events]);

  const handleUndo = () => {
    if (past.length === 0) return;
    const previousEvents = past[past.length - 1];
    const newPast = past.slice(0, -1);
    setPast(newPast);
    setEvents(previousEvents);
    setToast(null);
  };

  const changeDate = (amount) => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (amount * 7)));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + amount));
    }
  };

  const getPrevDate = (date) => {
    if (view === 'month') return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    if (view === 'week') {
        const d = new Date(date);
        d.setDate(d.getDate() - 7);
        return d;
    }
    return date;
  };
  
  const getNextDate = (date) => {
    if (view === 'month') return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    if (view === 'week') {
        const d = new Date(date);
        d.setDate(d.getDate() + 7);
        return d;
    }
    return date;
  };

  const handlePrev = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const width = gridRef.current?.offsetWidth || 0;
    await animate(x, width, { type: "spring", stiffness: 300, damping: 30 });
    changeDate(-1);
    x.set(0);
    setIsAnimating(false);
  };

  const handleNext = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const width = gridRef.current?.offsetWidth || 0;
    await animate(x, -width, { type: "spring", stiffness: 300, damping: 30 });
    changeDate(1);
    x.set(0);
    setIsAnimating(false);
  };

  const handleDragEnd = async (event, info) => {
    const width = gridRef.current?.offsetWidth || 0;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Threshold: 50% of width or fast swipe
    const threshold = width / 2;
    const isSwipeLeft = offset < -threshold || (offset < 0 && velocity < -500);
    const isSwipeRight = offset > threshold || (offset > 0 && velocity > 500);

    if (isSwipeLeft) {
        await animate(x, -width, { type: "spring", stiffness: 300, damping: 30 });
        changeDate(1);
        x.set(0);
    } else if (isSwipeRight) {
        await animate(x, width, { type: "spring", stiffness: 300, damping: 30 });
        changeDate(-1);
        x.set(0);
    } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const handleGotoToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (clickedDate, e) => {
    // Normalize clicked date to midnight for comparison
    const normalizedDate = new Date(clickedDate);
    normalizedDate.setHours(0, 0, 0, 0);

    if (normalizedDate < today) return;

    // Calculate transform origin for popup
    if (appRef.current && e.target) {
        const appRect = appRef.current.getBoundingClientRect();
        const cellRect = e.target.getBoundingClientRect();
        const x = cellRect.left - appRect.left + (cellRect.width / 2);
        const y = cellRect.top - appRect.top + (cellRect.height / 2);
        setPopupPosition({ x, y });
    }

    setSelectedDate(normalizedDate);
    setShowEventPopup(true);
    // Reset time picker to default 12:00 AM
    setTimeHours("12");
    setTimeMinutes("00");
    setTimePeriod("AM");
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

  const handleTimeBlur = () => {
    let h = parseInt(timeHours) || 12;
    if (h < 1) h = 1;
    if (h > 12) h = 12;
    setTimeHours(h.toString().padStart(2, '0'));

    let m = parseInt(timeMinutes) || 0;
    if (m < 0) m = 0;
    if (m > 59) m = 59;
    setTimeMinutes(m.toString().padStart(2, '0'));
  };

  const handleEventSubmit = () => {
    if (!eventText) return;

    // Convert UI 12h time to 24h for storage
    let h = parseInt(timeHours);
    if (timePeriod === 'PM' && h !== 12) h += 12;
    if (timePeriod === 'AM' && h === 12) h = 0;
    const time24 = `${h.toString().padStart(2, '0')}:${timeMinutes}`;

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: time24,
      text: eventText,
      notified: false // Reset notification status on create/update
    }

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    saveEvents(updatedEvents);
    setShowEventPopup(false);
    setEventText("");
    setEditingEvent(null);
  }

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    parseTimeForUI(event.time);
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
    setPopupPosition({ x: 0, y: 0 }); 
  }

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    const newEvents = events.filter(event => event.id !== eventId);
    saveEvents(newEvents);
    
    setToast({
      message: `${eventToDelete?.text || 'Event'} deleted`,
      visible: true
    });
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "calendar_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedEvents = JSON.parse(event.target.result).map(ev => ({
          ...ev,
          date: new Date(ev.date)
        }));
        saveEvents(importedEvents);
        setShowSettings(false);
        alert("Calendar restored successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to restore backup. Invalid file.");
      }
    };
    reader.readAsText(file);
  };

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
    let filtered = [];
    if (view === 'day') {
      filtered = events.filter(event => isSameDay(event.date, currentDate));
    } else {
      filtered = [...events];
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.time.localeCompare(b.time);
    });
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

  const renderMonthGrid = (date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    return (
      <div className="days">
        {[...Array(firstDayOfMonth).keys()].map((_, index) => (
          <span key={`empty-${index}`}></span>
        ))}
        {[...Array(daysInMonth).keys()].map((day) => {
          const d = new Date(date.getFullYear(), date.getMonth(), day + 1);
          const isCurrentDay = isSameDay(d, today);
          const hasEvent = eventsByDay[d.toDateString()];
          const isPast = d < today;
          return (
            <span
              key={day + 1}
              className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''} ${isPast ? 'inactive' : ''}`}
              onClick={(e) => handleDateClick(d, e)}
            >
              {day + 1}
            </span>
          );
        })}
      </div>
    );
  };

  const renderWeekGrid = (date) => {
    const weekDays = getWeekDays(date);
    return (
      <div className="days">
        {weekDays.map((day, index) => {
          const isCurrentDay = isSameDay(day, today);
          const hasEvent = eventsByDay[day.toDateString()];
          const isPast = day < today;
          return (
            <span
              key={index}
              className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''} ${isPast ? 'inactive' : ''}`}
              onClick={(e) => handleDateClick(day, e)}
            >
              {day.getDate()}
            </span>
          );
        })}
      </div>
    );
  };

  const renderGrid = (date) => {
    if (view === 'month') return renderMonthGrid(date);
    if (view === 'week') return renderWeekGrid(date);
    return null;
  };

  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  return (
    <div className={`calender-app ${view}-view`} ref={appRef}>
      <div className="calender">
        <div className="calender-header">
          <h1 className="heading">
            <i className="bx bxs-calendar-check"></i> Calendar
          </h1>
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="Data Management">
            <i className='bx bx-cog'></i>
          </button>
        </div>
        
        <div className="calender-header">
           <div className="view-switcher">
            <button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>
                <i className="bx bx-calendar"></i> Month
            </button>
            <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>
                <i className="bx bx-calendar-week"></i> Week
            </button>
            <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>
                <i className="bx bx-calendar-event"></i> Day
            </button>
          </div>
        </div>

        <div className="nevigate-date">
          <h2>{renderHeader()}</h2>
          {!isCurrentMonth && (
             <button className="goto-today-btn" onClick={handleGotoToday}>
                <i className='bx bx-calendar'></i> Today
             </button>
          )}
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
            <div className="calendar-grid-wrapper" style={{ height: containerHeight }}>
                <div className="swipe-overlay"></div>
                <motion.div 
                    className="calendar-track"
                    drag="x"
                    dragConstraints={{ left: -1000, right: 1000 }}
                    style={{ x, marginLeft: "-100%" }}
                    onDragEnd={handleDragEnd}
                >
                    <div className="days-grid-slide">
                        {renderGrid(getPrevDate(currentDate))}
                    </div>
                    <div className="days-grid-slide" ref={gridRef}>
                        {renderGrid(currentDate)}
                    </div>
                    <div className="days-grid-slide">
                        {renderGrid(getNextDate(currentDate))}
                    </div>
                </motion.div>
            </div>
          </>
        )}
      </div>

      <div className="events">
        {showEventPopup && (
          <div 
            className="event-popup" 
            style={popupPosition.x !== 0 ? { transformOrigin: `${popupPosition.x}px ${popupPosition.y}px` } : {}}
          >
            <div className="time-input">
              <div className="event-popup-time">
                  <i className="bx bx-time-five"></i>
              </div>
              {/* Custom 12-Hour Time Picker */}
              <input 
                type="number" 
                min="1" max="12" 
                value={timeHours} 
                onChange={(e) => setTimeHours(e.target.value)} 
                onBlur={handleTimeBlur}
                placeholder="HH"
              />
              <span>:</span>
              <input 
                type="number" 
                min="0" max="59" 
                value={timeMinutes} 
                onChange={(e) => setTimeMinutes(e.target.value)} 
                onBlur={handleTimeBlur}
                placeholder="MM"
              />
              <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <textarea 
              placeholder="Enter Event Text (Maximum 60 characters)" 
              value={eventText} 
              maxLength={60}
              onChange={(e) => setEventText(e.target.value)} 
            ></textarea>
            <button className="event-popup-btn" onClick={handleEventSubmit}>
              <i className={`bx ${editingEvent ? 'bxs-edit' : 'bx-plus'}`}></i>
              {editingEvent ? 'Update Event' : 'Add Event'}
            </button>
            <button className="close-event-popup" onClick={() => setShowEventPopup(false)} >
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
        
        {filteredEvents.length === 0 ? (
            <div className="empty-state">
                <i className="bx bx-calendar-edit"></i>
                <p>No events found</p>
            </div>
        ) : (
            filteredEvents.map((event) => (
            <div className="event" key={event.id}>
                <div className="event-date-wrapper">
                <div className="event-date">
                    {`${monthsOfYear[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`}
                </div>
                <div className="event-time">{formatTime(event.time)}</div>
                </div>
                <div className="event-text">{event.text}</div>
                <div className="event-buttons">
                <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
                <i className="bx bxs-message-alt-x" onClick={() => handleDeleteEvent(event.id)}></i>
                </div>
            </div>
            ))
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span>{toast.message}</span>
          <button className="toast-undo-btn" onClick={handleUndo}>UNDO</button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-modal">
            <h2>Data Management</h2>
            <div className="saved-indicator">
              <i className='bx bx-check-circle'></i> Saved to browser
            </div>
            <div className="settings-actions">
              <button className="settings-btn-action" onClick={requestNotificationPermission}>
                <i className='bx bxs-bell-ring'></i> Enable Notifications
              </button>
              <button className="settings-btn-action" onClick={handleExport}>
                <i className='bx bxs-download'></i> Download Calendar (.json)
              </button>
              <label className="settings-btn-action">
                <i className='bx bxs-file-import'></i> Restore from Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            <button className="settings-close" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CALENDERAPP;
