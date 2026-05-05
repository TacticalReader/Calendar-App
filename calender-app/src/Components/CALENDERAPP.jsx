import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { getOccurrences, getNextOccurrence } from "../utils/recurrence";
import "./CALENDERAPP.css";

const CALENDERAPP = () => {
  const daysofWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
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
  const [conflictEvent, setConflictEvent] = useState(null);

  // Recurrence & Reminder State
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEnd, setRecurrenceEnd] = useState('never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceCount, setRecurrenceCount] = useState(10);
  const [monthlyType, setMonthlyType] = useState('date');
  const [reminder, setReminder] = useState(10);

  // Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerHeight, setContainerHeight] = useState('auto');

  const x = useMotionValue(0);

  // Time Picker State
  const [timeHours, setTimeHours] = useState("12");
  const [timeMinutes, setTimeMinutes] = useState("00");
  const [timePeriod, setTimePeriod] = useState("AM");

  const [past, setPast] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [future, setFuture] = useState([]);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // ── Credit modal delay ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setShowCreditModal(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // ── Persist events ──────────────────────────────────────────────
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('calendarEvents');
      if (saved) {
        return JSON.parse(saved).map(event => ({
          ...event,
          date: new Date(event.date),
        }));
      }
    } catch (err) {
      console.error("Failed to parse events from localStorage", err);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // ── Measure grid height for animation ──────────────────────────
  useEffect(() => {
    const measure = () => {
      if (gridRef.current) {
        setContainerHeight(`${gridRef.current.scrollHeight}px`);
      }
    };
    measure();
    // Re-measure on font load / resize
    const ro = new ResizeObserver(measure);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [currentDate, view, isAnimating]);

  // ── Toast auto-dismiss ─────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Close popup on Escape key ──────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowEventPopup(false);
        setShowSettings(false);
        setShowCreditModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Prevent body scroll when any modal is open ─────────────────
  useEffect(() => {
    const isOpen = showEventPopup || showSettings || showCreditModal;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEventPopup, showSettings, showCreditModal]);

  // ── Helpers ────────────────────────────────────────────────────
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [h, m] = timeString.split(':');
    let hours = parseInt(h);
    const minutes = m;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const parseTimeForUI = (timeString) => {
    const [h, m] = timeString.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setTimeHours(hours.toString().padStart(2, '0'));
    setTimeMinutes(m);
    setTimePeriod(ampm);
  };

  const saveEvents = (newEvents) => {
    setPast(prev => [...prev, events]);
    setEvents(newEvents);
    setFuture([]);
  };

  // ── Notifications ──────────────────────────────────────────────
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
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

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const checkEvents = () => {
      const now = new Date();
      events.forEach(event => {
        const reminderMinutes = event.reminder || 10;
        const nextOccurrence = getNextOccurrence(event, now);
        if (nextOccurrence) {
          const occDate = new Date(nextOccurrence.date);
          const [h, m] = nextOccurrence.time.split(':').map(Number);
          occDate.setHours(h, m, 0, 0);
          const timeDiff = occDate.getTime() - now.getTime();
          const reminderMs = reminderMinutes * 60000;
          if (timeDiff <= reminderMs && timeDiff > (reminderMs - 60000)) {
            new Notification("Upcoming Event", {
              body: `${event.text} in ${reminderMinutes} minutes`,
              icon: "/favicon.ico"
            });
          }
        }
      });
    };
    const id = setInterval(checkEvents, 60000);
    checkEvents();
    return () => clearInterval(id);
  }, [events]);

  // ── Undo ───────────────────────────────────────────────────────
  const handleUndo = () => {
    if (past.length === 0) return;
    const previousEvents = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setEvents(previousEvents);
    setToast(null);
  };

  // ── Navigation ─────────────────────────────────────────────────
  const changeDate = (amount) => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + amount * 7);
        return d;
      });
    } else {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + amount);
        return d;
      });
    }
  };

  const getPrevDate = (date) => {
    if (view === 'month') return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    return d;
  };

  const getNextDate = (date) => {
    if (view === 'month') return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const d = new Date(date);
    d.setDate(d.getDate() + 7);
    return d;
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
    const { x: offset } = info.offset;
    const { x: velocity } = info.velocity;
    const threshold = width / 3; // slightly easier swipe threshold on mobile

    if (offset < -threshold || (offset < 0 && velocity < -400)) {
      await animate(x, -width, { type: "spring", stiffness: 300, damping: 30 });
      changeDate(1);
      x.set(0);
    } else if (offset > threshold || (offset > 0 && velocity > 400)) {
      await animate(x, width, { type: "spring", stiffness: 300, damping: 30 });
      changeDate(-1);
      x.set(0);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const handleGotoToday = () => setCurrentDate(new Date());

  // ── Event Popup ────────────────────────────────────────────────
  const resetPopupForm = () => {
    setTimeHours("12");
    setTimeMinutes("00");
    setTimePeriod("AM");
    setEventText("");
    setEditingEvent(null);
    setConflictEvent(null);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEnd('never');
    setRecurrenceEndDate('');
    setRecurrenceCount(10);
    setMonthlyType('date');
    setReminder(10);
  };

  const handleDateClick = (clickedDate) => {
    const normalizedDate = new Date(clickedDate);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);
    resetPopupForm();
    setShowEventPopup(true);
  };

  const isSameDay = (date1, date2) => (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );

  const handleTimeBlur = () => {
    let h = parseInt(timeHours) || 12;
    h = Math.min(12, Math.max(1, h));
    setTimeHours(h.toString().padStart(2, '0'));
    let m = parseInt(timeMinutes) || 0;
    m = Math.min(59, Math.max(0, m));
    setTimeMinutes(m.toString().padStart(2, '0'));
  };

  const handleEventSubmit = () => {
    if (!eventText.trim()) return;

    let h = parseInt(timeHours);
    if (timePeriod === 'PM' && h !== 12) h += 12;
    if (timePeriod === 'AM' && h === 12) h = 0;
    const time24 = `${h.toString().padStart(2, '0')}:${timeMinutes}`;

    // Conflict detection
    if (!conflictEvent) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const dayEvents = getOccurrences(events, startOfDay, endOfDay);
      const conflict = dayEvents.find(e => {
        if (e.time !== time24) return false;
        if (editingEvent && (e.id === editingEvent.id || e.originalId === editingEvent.id)) return false;
        return true;
      });
      if (conflict) { setConflictEvent(conflict.text); return; }
    }

    const weekDay = selectedDate.getDay();
    const weekDayIndex = Math.floor((selectedDate.getDate() - 1) / 7);

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: time24,
      text: eventText,
      reminder: parseInt(reminder),
      recurrence: {
        type: recurrenceType,
        interval: parseInt(recurrenceInterval),
        end: recurrenceEnd,
        endDate: recurrenceEndDate,
        count: parseInt(recurrenceCount),
        monthlyType,
        weekDay,
        weekDayIndex,
      },
    };

    const updatedEvents = editingEvent
      ? events.map(e => e.id === editingEvent.id ? newEvent : e)
      : [...events, newEvent];

    saveEvents(updatedEvents);
    setShowEventPopup(false);
    resetPopupForm();
  };

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    parseTimeForUI(event.time);
    setEventText(event.text);
    setEditingEvent(event);
    setConflictEvent(null);
    if (event.recurrence) {
      setRecurrenceType(event.recurrence.type || 'none');
      setRecurrenceInterval(event.recurrence.interval || 1);
      setRecurrenceEnd(event.recurrence.end || 'never');
      setRecurrenceEndDate(event.recurrence.endDate || '');
      setRecurrenceCount(event.recurrence.count || 10);
      setMonthlyType(event.recurrence.monthlyType || 'date');
    } else {
      setRecurrenceType('none');
    }
    setReminder(event.reminder || 10);
    setShowEventPopup(true);
  };

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    saveEvents(events.filter(e => e.id !== eventId));
    setToast({ message: `${eventToDelete?.text || 'Event'} deleted`, visible: true });
  };

  // ── Export / Import ────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "calendar_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result).map(ev => ({
          ...ev,
          date: new Date(ev.date),
        }));
        saveEvents(imported);
        setShowSettings(false);
        alert("Calendar restored successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to restore backup. Invalid file.");
      }
    };
    reader.readAsText(file);
  };

  // ── Grid helpers ───────────────────────────────────────────────
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  // ── Visible range for event expansion ─────────────────────────
  const visibleRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [currentDate, view]);

  // ── Filtered / sorted events for display ──────────────────────
  const filteredEvents = useMemo(() => {
    const expanded = getOccurrences(events, visibleRange.start, visibleRange.end);
    const filtered = view === 'day'
      ? expanded.filter(e => isSameDay(e.date, currentDate))
      : expanded;
    return filtered.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return diff !== 0 ? diff : a.time.localeCompare(b.time);
    });
  }, [view, events, currentDate, visibleRange]);

  // ── Event dot indicators for month grid ───────────────────────
  const eventsByDay = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const expanded = getOccurrences(events, start, end);
    return expanded.reduce((acc, event) => {
      const key = event.date.toDateString();
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});
  }, [events, currentDate]);

  // ── Header text ───────────────────────────────────────────────
  const renderHeader = () => {
    if (view === 'month') {
      return `${monthsOfYear[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    }
    if (view === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      });
    }
  };

  // ── Grid renders ──────────────────────────────────────────────
  const renderMonthGrid = (date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return (
      <div className="days">
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <span key={`empty-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(date.getFullYear(), date.getMonth(), i + 1);
          const isCurrentDay = isSameDay(d, today);
          const hasEvent = !!eventsByDay[d.toDateString()];
          const isPast = d < today;
          return (
            <span
              key={i + 1}
              role="button"
              tabIndex={0}
              aria-label={`${monthsOfYear[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}${hasEvent ? ' — has event' : ''}`}
              className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''} ${isPast ? 'inactive' : ''}`}
              onClick={() => handleDateClick(d)}
              onKeyDown={(e) => e.key === 'Enter' && handleDateClick(d)}
            >
              {i + 1}
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
          const hasEvent = !!eventsByDay[day.toDateString()];
          const isPast = day < today;
          return (
            <span
              key={index}
              role="button"
              tabIndex={0}
              aria-label={`${monthsOfYear[day.getMonth()]} ${day.getDate()}${hasEvent ? ' — has event' : ''}`}
              className={`${isCurrentDay ? 'current-day' : ''} ${hasEvent ? 'has-event' : ''} ${isPast ? 'inactive' : ''}`}
              onClick={() => handleDateClick(day)}
              onKeyDown={(e) => e.key === 'Enter' && handleDateClick(day)}
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
    if (view === 'week')  return renderWeekGrid(date);
    return null;
  };

  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* ── Main App Card ────────────────────────────────────── */}
      <div className={`calender-app ${view}-view`} ref={appRef} data-view={view}>

        {/* ── Left / Top: Calendar Panel ──────────────────────── */}
        <div className="calender">
          {/* Row 1: Title + Settings */}
          <div className="calender-header">
            <h1 className="heading">
              <i className="bx bxs-calendar-check" aria-hidden="true"></i> Calendar
            </h1>
            <button
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Data Management"
              aria-label="Open settings"
            >
              <i className='bx bx-cog' aria-hidden="true"></i>
            </button>
          </div>

          {/* Row 2: View Switcher */}
          <div className="calender-header">
            <div className="view-switcher" role="group" aria-label="Calendar view">
              <button
                onClick={() => setView('month')}
                className={view === 'month' ? 'active' : ''}
                aria-pressed={view === 'month'}
              >
                <i className="bx bx-calendar" aria-hidden="true"></i> Month
              </button>
              <button
                onClick={() => setView('week')}
                className={view === 'week' ? 'active' : ''}
                aria-pressed={view === 'week'}
              >
                <i className="bx bx-calendar-week" aria-hidden="true"></i> Week
              </button>
              <button
                onClick={() => setView('day')}
                className={view === 'day' ? 'active' : ''}
                aria-pressed={view === 'day'}
              >
                <i className="bx bx-calendar-event" aria-hidden="true"></i> Day
              </button>
            </div>
          </div>

          {/* Row 3: Month/Date header + Today + Nav arrows */}
          <div className="nevigate-date">
            <h2 aria-live="polite">{renderHeader()}</h2>
            {!isCurrentMonth && (
              <button className="goto-today-btn" onClick={handleGotoToday} aria-label="Go to today">
                <i className='bx bx-calendar' aria-hidden="true"></i> Today
              </button>
            )}
            <div className="buttons">
              <i
                className="bx bx-chevron-left"
                onClick={handlePrev}
                role="button"
                tabIndex={0}
                aria-label="Previous"
                onKeyDown={(e) => e.key === 'Enter' && handlePrev()}
              ></i>
              <i
                className="bx bx-chevron-right"
                onClick={handleNext}
                role="button"
                tabIndex={0}
                aria-label="Next"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              ></i>
            </div>
          </div>

          {/* Grid: only in Month / Week view */}
          {view !== 'day' && (
            <>
              <div className="weekdays" aria-hidden="true">
                {daysofWeek.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="calendar-grid-wrapper" style={{ height: containerHeight }}>
                <div className="swipe-overlay" aria-hidden="true"></div>
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

        {/* ── Right / Bottom: Events Panel ─────────────────────── */}
        <div className="events" role="list" aria-label="Events">
          {filteredEvents.length === 0 ? (
            <div className="empty-state" role="status">
              <i className="bx bx-calendar-edit" aria-hidden="true"></i>
              <p>No events found</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div className="event" key={`${event.id}-${index}`} role="listitem">
                <div className="event-date-wrapper">
                  <div className="event-date">
                    {`${monthsOfYear[event.date.getMonth()].slice(0,3)} ${event.date.getDate()}, ${event.date.getFullYear()}`}
                  </div>
                  <div className="event-time">{formatTime(event.time)}</div>
                </div>
                <div className="event-text">
                  {event.text}
                  {event.recurrence?.type && event.recurrence.type !== 'none' && (
                    <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '0.25rem' }}>
                      <i className='bx bx-revision' aria-hidden="true"></i> {event.recurrence.type}
                    </div>
                  )}
                </div>
                <div className="event-buttons">
                  <i
                    className="bx bxs-edit-alt"
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit ${event.text}`}
                    onClick={() => handleEditEvent(event)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditEvent(event)}
                  ></i>
                  <i
                    className="bx bxs-message-alt-x"
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete ${event.text}`}
                    onClick={() => handleDeleteEvent(event.originalId || event.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeleteEvent(event.originalId || event.id)}
                  ></i>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Event Popup — with backdrop overlay ──────────────────── */}
      {showEventPopup && (
        <div
          className="event-popup-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Add or edit event"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEventPopup(false); }}
        >
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>

            {/* Time Picker */}
            <div className="time-input">
              <div className="event-popup-time" aria-hidden="true">
                <i className="bx bx-time-five"></i>
              </div>
              <input
                type="number"
                min="1" max="12"
                value={timeHours}
                aria-label="Hours"
                onChange={(e) => { setTimeHours(e.target.value); setConflictEvent(null); }}
                onBlur={handleTimeBlur}
                placeholder="HH"
              />
              <span aria-hidden="true">:</span>
              <input
                type="number"
                min="0" max="59"
                value={timeMinutes}
                aria-label="Minutes"
                onChange={(e) => { setTimeMinutes(e.target.value); setConflictEvent(null); }}
                onBlur={handleTimeBlur}
                placeholder="MM"
              />
              <select
                value={timePeriod}
                aria-label="AM or PM"
                onChange={(e) => { setTimePeriod(e.target.value); setConflictEvent(null); }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            {/* Description */}
            <textarea
              placeholder="Enter Event Text (Maximum 60 characters)"
              value={eventText}
              maxLength={60}
              onChange={(e) => { setEventText(e.target.value); setConflictEvent(null); }}
              aria-label="Event description"
            />

            {/* Recurrence */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recurrence-type"><i className='bx bx-revision' aria-hidden="true"></i> Repeat</label>
                <select
                  id="recurrence-type"
                  className="form-select"
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {recurrenceType !== 'none' && (
                <div className="form-group">
                  <label htmlFor="recurrence-interval"><i className='bx bx-time' aria-hidden="true"></i> Interval</label>
                  <input
                    id="recurrence-interval"
                    type="number"
                    min="1"
                    className="form-input"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(e.target.value)}
                  />
                </div>
              )}
            </div>

            {recurrenceType === 'monthly' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monthly-type"><i className='bx bx-calendar' aria-hidden="true"></i> On</label>
                  <select
                    id="monthly-type"
                    className="form-select"
                    value={monthlyType}
                    onChange={(e) => setMonthlyType(e.target.value)}
                  >
                    <option value="date">Same date ({getOrdinal(selectedDate.getDate())})</option>
                    <option value="day">
                      Same day ({getOrdinal(Math.floor((selectedDate.getDate() - 1) / 7) + 1)} {daysofWeek[selectedDate.getDay()]})
                    </option>
                  </select>
                </div>
              </div>
            )}

            {recurrenceType !== 'none' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurrence-end"><i className='bx bx-stop-circle' aria-hidden="true"></i> Ends</label>
                  <select
                    id="recurrence-end"
                    className="form-select"
                    value={recurrenceEnd}
                    onChange={(e) => setRecurrenceEnd(e.target.value)}
                  >
                    <option value="never">Never</option>
                    <option value="date">On Date</option>
                    <option value="count">After Occurrences</option>
                  </select>
                </div>
                {recurrenceEnd === 'date' && (
                  <div className="form-group">
                    <label htmlFor="end-date"><i className='bx bx-calendar-x' aria-hidden="true"></i> End Date</label>
                    <input
                      id="end-date"
                      type="date"
                      className="form-input"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    />
                  </div>
                )}
                {recurrenceEnd === 'count' && (
                  <div className="form-group">
                    <label htmlFor="recurrence-count"><i className='bx bx-hash' aria-hidden="true"></i> Count</label>
                    <input
                      id="recurrence-count"
                      type="number"
                      min="1"
                      className="form-input"
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reminder */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reminder"><i className='bx bx-bell' aria-hidden="true"></i> Reminder</label>
                <select
                  id="reminder"
                  className="form-select"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                >
                  <option value="0">At time of event</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            </div>

            {conflictEvent && (
              <div className="conflict-warning" role="alert">
                <i className='bx bx-error' aria-hidden="true"></i>
                This overlaps with &ldquo;{conflictEvent}&rdquo;. Save anyway?
              </div>
            )}

            <button
              className={`event-popup-btn${conflictEvent ? ' conflict' : ''}`}
              onClick={handleEventSubmit}
            >
              <i className={`bx ${editingEvent ? 'bxs-edit' : 'bx-plus'}`} aria-hidden="true"></i>
              {conflictEvent ? 'Save Anyway' : (editingEvent ? 'Update Event' : 'Add Event')}
            </button>

            <button
              className="close-event-popup"
              onClick={() => setShowEventPopup(false)}
              aria-label="Close event popup"
            >
              <i className="bx bx-x" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span>{toast.message}</span>
          <button className="toast-undo-btn" onClick={handleUndo}>UNDO</button>
        </div>
      )}

      {/* ── Settings Modal ─────────────────────────────────────── */}
      {showSettings && (
        <div
          className="settings-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className="settings-modal">
            <h2>Data Management</h2>
            <div className="saved-indicator">
              <i className='bx bx-check-circle' aria-hidden="true"></i> Saved to browser
            </div>
            <div className="settings-actions">
              <button className="settings-btn-action" onClick={requestNotificationPermission}>
                <i className='bx bxs-bell-ring' aria-hidden="true"></i> Enable Notifications
              </button>
              <button className="settings-btn-action" onClick={handleExport}>
                <i className='bx bxs-download' aria-hidden="true"></i> Download Calendar (.json)
              </button>
              <label className="settings-btn-action">
                <i className='bx bxs-file-import' aria-hidden="true"></i> Restore from Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            <button className="settings-close" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ── Credit Modal ───────────────────────────────────────── */}
      {showCreditModal && (
        <div className="credit-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreditModal(false); }}>
          <div className="credit-modal-box">
            <button
              className="credit-close-btn"
              onClick={() => setShowCreditModal(false)}
              aria-label="Close credits"
            >
              <i className='bx bx-x' aria-hidden="true"></i>
            </button>
            <div className="credit-icon" aria-hidden="true">
              <i className='bx bxs-terminal'></i>
            </div>
            <p className="credit-text">This app has been designed and programmed by</p>
            <h2 className="credit-author">Tanmay Srivastava</h2>
            <a
              href="https://github.com/tacticalreader"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-github"
            >
              <i className='bx bxl-github' aria-hidden="true"></i> tactical reader
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default CALENDERAPP;
