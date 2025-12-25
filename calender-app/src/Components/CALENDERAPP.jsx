import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardContent,
  Stack,
  Divider,
  Tooltip
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  CalendarViewWeek,
  CalendarViewDay,
  Today,
  Settings,
  Add,
  Edit,
  Delete,
  NotificationsActive,
  Download,
  Upload,
  Close,
  AccessTime,
  EventAvailable,
  EditCalendar,
  CheckCircle,
  Event as EventIcon
} from "@mui/icons-material";
import { getOccurrences, getNextOccurrence } from "../utils/recurrence";

// Create a dark theme to match the original aesthetic
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ef9011',
    },
    secondary: {
      main: '#00a3ff',
    },
    background: {
      default: '#0f1319',
      paper: '#1e242d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#78879e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '0.1rem',
    },
    h4: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.8rem',
          textTransform: 'none',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  }
});

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

  // Recurrence & Reminder State
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEnd, setRecurrenceEnd] = useState('never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceCount, setRecurrenceCount] = useState(10);
  const [monthlyType, setMonthlyType] = useState('date'); // 'date' (e.g. 15th) or 'day' (e.g. 1st Monday)
  const [reminder, setReminder] = useState(10); // minutes

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

  useEffect(() => {
    if (gridRef.current) {
      setContainerHeight(`${gridRef.current.scrollHeight}px`);
    }
  }, [currentDate, view, isAnimating]);

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

  const saveEvents = (newEvents) => {
    setPast(prev => [...prev, events]);
    setEvents(newEvents);
    setFuture([]);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setToast({ message: "Notifications enabled!", severity: "success" });
      new Notification("Calendar App", { body: "You will now receive alerts for upcoming events." });
    } else {
      setToast({ message: "Permission denied", severity: "error" });
    }
  };

  // Enhanced Notification Checker for Recurring Events
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

    const intervalId = setInterval(checkEvents, 60000); // Check every minute
    checkEvents();

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

  const handleDateClick = (clickedDate) => {
    const normalizedDate = new Date(clickedDate);
    normalizedDate.setHours(0, 0, 0, 0);

    setSelectedDate(normalizedDate);
    setShowEventPopup(true);
    
    // Reset Form
    setTimeHours("12");
    setTimeMinutes("00");
    setTimePeriod("AM");
    setEventText("");
    setEditingEvent(null);
    
    // Reset Recurrence & Reminder
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEnd('never');
    setRecurrenceEndDate('');
    setRecurrenceCount(10);
    setMonthlyType('date');
    setReminder(10);
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

    let h = parseInt(timeHours);
    if (timePeriod === 'PM' && h !== 12) h += 12;
    if (timePeriod === 'AM' && h === 12) h = 0;
    const time24 = `${h.toString().padStart(2, '0')}:${timeMinutes}`;

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
          monthlyType: monthlyType,
          weekDay: weekDay,
          weekDayIndex: weekDayIndex
      }
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
  }

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    const newEvents = events.filter(event => event.id !== eventId);
    saveEvents(newEvents);
    
    setToast({
      message: `${eventToDelete?.text || 'Event'} deleted`,
      severity: "info"
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
        setToast({ message: "Calendar restored successfully!", severity: "success" });
      } catch (err) {
        console.error(err);
        setToast({ message: "Failed to restore backup. Invalid file.", severity: "error" });
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

  const visibleRange = useMemo(() => {
      let start = new Date(currentDate);
      let end = new Date(currentDate);

      if (view === 'month') {
          start.setDate(1);
          end.setMonth(end.getMonth() + 1);
          end.setDate(0);
      } else if (view === 'week') {
          start.setDate(start.getDate() - start.getDay());
          end.setDate(end.getDate() + (6 - end.getDay()));
      } else {
          // Day view
      }
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return { start, end };
  }, [currentDate, view]);

  const filteredEvents = useMemo(() => {
    const expandedEvents = getOccurrences(events, visibleRange.start, visibleRange.end);

    let filtered = [];
    if (view === 'day') {
      filtered = expandedEvents.filter(event => isSameDay(event.date, currentDate));
    } else {
      filtered = expandedEvents;
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.time.localeCompare(b.time);
    });
  }, [view, events, currentDate, visibleRange]);

  const eventsByDay = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const expanded = getOccurrences(events, startOfMonth, endOfMonth);

    return expanded.reduce((acc, event) => {
      const dateKey = event.date.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events, currentDate]);

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

  const renderMonthGrid = (date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    return (
      <Grid container columns={7} sx={{ width: '100%' }}>
        {[...Array(firstDayOfMonth).keys()].map((_, index) => (
          <Grid item xs={1} key={`empty-${index}`} sx={{ height: '4rem' }} />
        ))}
        {[...Array(daysInMonth).keys()].map((day) => {
          const d = new Date(date.getFullYear(), date.getMonth(), day + 1);
          const isCurrentDay = isSameDay(d, today);
          const hasEvent = eventsByDay[d.toDateString()];
          const isPast = d < today;
          return (
            <Grid item xs={1} key={day + 1}>
              <Box
                onClick={() => handleDateClick(d)}
                sx={{
                  height: '4rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '4rem',
                  margin: '0 auto',
                  position: 'relative',
                  bgcolor: isCurrentDay ? 'primary.main' : 'transparent',
                  color: isCurrentDay ? 'white' : isPast ? 'text.secondary' : 'text.primary',
                  boxShadow: isCurrentDay ? '0 0 1.5rem 0.5rem rgba(239, 144, 17, 0.4)' : 'none',
                  '&:hover': {
                    bgcolor: isCurrentDay ? 'primary.dark' : 'rgba(239, 144, 17, 0.1)',
                    color: isCurrentDay ? 'white' : 'primary.main',
                  },
                  '&::after': hasEvent ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '0.5rem',
                    width: '0.4rem',
                    height: '0.4rem',
                    bgcolor: 'secondary.main',
                    borderRadius: '50%',
                  } : {}
                }}
              >
                {day + 1}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderWeekGrid = (date) => {
    const weekDays = getWeekDays(date);
    return (
      <Grid container columns={7} sx={{ width: '100%' }}>
        {weekDays.map((day, index) => {
          const isCurrentDay = isSameDay(day, today);
          const hasEvent = eventsByDay[day.toDateString()];
          const isPast = day < today;
          return (
            <Grid item xs={1} key={index}>
              <Box
                onClick={() => handleDateClick(day)}
                sx={{
                  height: '4rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '4rem',
                  margin: '0 auto',
                  position: 'relative',
                  bgcolor: isCurrentDay ? 'primary.main' : 'transparent',
                  color: isCurrentDay ? 'white' : isPast ? 'text.secondary' : 'text.primary',
                  boxShadow: isCurrentDay ? '0 0 1.5rem 0.5rem rgba(239, 144, 17, 0.4)' : 'none',
                  '&:hover': {
                    bgcolor: isCurrentDay ? 'primary.dark' : 'rgba(239, 144, 17, 0.1)',
                    color: isCurrentDay ? 'white' : 'primary.main',
                  },
                  '&::after': hasEvent ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '0.5rem',
                    width: '0.4rem',
                    height: '0.4rem',
                    bgcolor: 'secondary.main',
                    borderRadius: '50%',
                  } : {}
                }}
              >
                {day.getDate()}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderGrid = (date) => {
    if (view === 'month') return renderMonthGrid(date);
    if (view === 'week') return renderWeekGrid(date);
    return null;
  };

  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper 
          elevation={10} 
          sx={{ 
            width: '100%', 
            minHeight: '55rem', 
            p: 4, 
            borderRadius: '3rem', 
            border: '1px solid #0f1319',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 5,
            position: 'relative',
            overflow: 'hidden'
          }}
          ref={appRef}
        >
          {/* Left Side: Calendar */}
          <Box sx={{ width: { xs: '100%', md: '40%' } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventAvailable color="primary" fontSize="inherit" /> Calendar
              </Typography>
              <Tooltip title="Settings">
                <IconButton onClick={() => setShowSettings(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
            
            <ButtonGroup variant="contained" sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Button 
                onClick={() => setView('month')} 
                color={view === 'month' ? 'primary' : 'inherit'}
                startIcon={<CalendarMonth />}
              >
                Month
              </Button>
              <Button 
                onClick={() => setView('week')} 
                color={view === 'week' ? 'primary' : 'inherit'}
                startIcon={<CalendarViewWeek />}
              >
                Week
              </Button>
              <Button 
                onClick={() => setView('day')} 
                color={view === 'day' ? 'primary' : 'inherit'}
                startIcon={<CalendarViewDay />}
              >
                Day
              </Button>
            </ButtonGroup>

            <Box display="flex" alignItems="center" justifyContent="space-between" my={4}>
              <Typography variant="h4" color="text.secondary">
                {renderHeader()}
              </Typography>
              <Box display="flex" gap={1}>
                {!isCurrentMonth && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    onClick={handleGotoToday}
                    startIcon={<Today />}
                    sx={{ borderRadius: 4 }}
                  >
                    Today
                  </Button>
                )}
                <IconButton onClick={handlePrev} sx={{ bgcolor: '#2c3542', '&:hover': { bgcolor: 'primary.main' } }}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={handleNext} sx={{ bgcolor: '#2c3542', '&:hover': { bgcolor: 'primary.main' } }}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>

            {view !== 'day' && (
              <>
                <Grid container columns={7} mb={3}>
                  {daysofWeek.map((day) => (
                    <Grid item xs={1} key={day} display="flex" justifyContent="center">
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ overflow: 'hidden', position: 'relative', height: containerHeight, transition: 'height 0.4s ease' }}>
                    <motion.div 
                        style={{ x, display: 'flex', width: '300%', marginLeft: '-100%' }}
                        drag="x"
                        dragConstraints={{ left: -1000, right: 1000 }}
                        onDragEnd={handleDragEnd}
                    >
                        <Box sx={{ width: '33.33%' }}>
                            {renderGrid(getPrevDate(currentDate))}
                        </Box>
                        <Box sx={{ width: '33.33%' }} ref={gridRef}>
                            {renderGrid(currentDate)}
                        </Box>
                        <Box sx={{ width: '33.33%' }}>
                            {renderGrid(getNextDate(currentDate))}
                        </Box>
                    </motion.div>
                </Box>
              </>
            )}
          </Box>

          {/* Right Side: Events */}
          <Box sx={{ width: { xs: '100%', md: '60%' }, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', py: 3 }}>
            {filteredEvents.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2} color="text.secondary">
                    <EditCalendar sx={{ fontSize: '8rem', opacity: 0.2 }} />
                    <Typography variant="h5" sx={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1rem' }}>No events found</Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                  {filteredEvents.map((event, index) => (
                    <Card key={`${event.id}-${index}`} sx={{ bgcolor: 'secondary.main', borderRadius: 2, position: 'relative' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ width: '25%', borderRight: '1px solid rgba(255,255,255,0.5)', pr: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'white', fontFamily: 'Bebas Neue, sans-serif' }}>
                            {`${monthsOfYear[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {formatTime(event.time)}
                          </Typography>
                        </Box>
                        <Box sx={{ width: '65%', pl: 2 }}>
                          <Typography variant="body1" sx={{ color: 'white', wordBreak: 'break-word' }}>
                            {event.text}
                          </Typography>
                          {event.recurrence && event.recurrence.type !== 'none' && (
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <CheckCircle fontSize="small" /> {event.recurrence.type}
                             </Typography>
                          )}
                        </Box>
                        <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleEditEvent(event)} sx={{ color: 'white' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteEvent(event.originalId || event.id)} sx={{ color: 'white' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
            )}
          </Box>
        </Paper>

        {/* Event Dialog */}
        <Dialog open={showEventPopup} onClose={() => setShowEventPopup(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: 'background.paper' } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
            <IconButton onClick={() => setShowEventPopup(false)}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" alignItems="center" gap={1} mb={3} mt={1}>
               <Box sx={{ bgcolor: 'secondary.main', p: 1, borderRadius: 1, color: 'white', display: 'flex' }}>
                 <AccessTime />
               </Box>
               <TextField 
                 type="number" 
                 inputProps={{ min: 1, max: 12 }} 
                 value={timeHours} 
                 onChange={(e) => setTimeHours(e.target.value)} 
                 onBlur={handleTimeBlur}
                 sx={{ width: '4rem' }}
                 variant="standard"
               />
               <Typography>:</Typography>
               <TextField 
                 type="number" 
                 inputProps={{ min: 0, max: 59 }} 
                 value={timeMinutes} 
                 onChange={(e) => setTimeMinutes(e.target.value)} 
                 onBlur={handleTimeBlur}
                 sx={{ width: '4rem' }}
                 variant="standard"
               />
               <Select 
                 value={timePeriod} 
                 onChange={(e) => setTimePeriod(e.target.value)} 
                 variant="standard"
               >
                 <MenuItem value="AM">AM</MenuItem>
                 <MenuItem value="PM">PM</MenuItem>
               </Select>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter Event Text (Maximum 60 characters)"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              inputProps={{ maxLength: 60 }}
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} mb={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Repeat</InputLabel>
                  <Select value={recurrenceType} label="Repeat" onChange={(e) => setRecurrenceType(e.target.value)}>
                    <MenuItem value="none">Does not repeat</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {recurrenceType !== 'none' && (
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    label="Interval" 
                    type="number" 
                    value={recurrenceInterval} 
                    onChange={(e) => setRecurrenceInterval(e.target.value)} 
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              )}
            </Grid>

            {recurrenceType === 'monthly' && (
               <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>On</InputLabel>
                  <Select value={monthlyType} label="On" onChange={(e) => setMonthlyType(e.target.value)}>
                    <MenuItem value="date">Same date ({getOrdinal(selectedDate.getDate())})</MenuItem>
                    <MenuItem value="day">Same day ({getOrdinal(Math.floor((selectedDate.getDate() - 1) / 7) + 1)} {daysofWeek[selectedDate.getDay()]})</MenuItem>
                  </Select>
               </FormControl>
            )}

            {recurrenceType !== 'none' && (
              <Grid container spacing={2} mb={2}>
                <Grid item xs={4}>
                   <FormControl fullWidth size="small">
                      <InputLabel>Ends</InputLabel>
                      <Select value={recurrenceEnd} label="Ends" onChange={(e) => setRecurrenceEnd(e.target.value)}>
                        <MenuItem value="never">Never</MenuItem>
                        <MenuItem value="date">On Date</MenuItem>
                        <MenuItem value="count">After Occurrences</MenuItem>
                      </Select>
                   </FormControl>
                </Grid>
                {recurrenceEnd === 'date' && (
                  <Grid item xs={8}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      type="date" 
                      value={recurrenceEndDate} 
                      onChange={(e) => setRecurrenceEndDate(e.target.value)} 
                    />
                  </Grid>
                )}
                {recurrenceEnd === 'count' && (
                  <Grid item xs={8}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label="Count" 
                      type="number" 
                      value={recurrenceCount} 
                      onChange={(e) => setRecurrenceCount(e.target.value)} 
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                )}
              </Grid>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Reminder</InputLabel>
              <Select value={reminder} label="Reminder" onChange={(e) => setReminder(e.target.value)}>
                <MenuItem value="0">At time of event</MenuItem>
                <MenuItem value="5">5 minutes before</MenuItem>
                <MenuItem value="10">10 minutes before</MenuItem>
                <MenuItem value="15">15 minutes before</MenuItem>
                <MenuItem value="30">30 minutes before</MenuItem>
                <MenuItem value="60">1 hour before</MenuItem>
                <MenuItem value="1440">1 day before</MenuItem>
              </Select>
            </FormControl>

          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              onClick={handleEventSubmit}
              startIcon={editingEvent ? <Edit /> : <Add />}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle>Data Management</DialogTitle>
          <DialogContent>
            <Box display="flex" alignItems="center" gap={1} mb={3} color="text.secondary">
              <CheckCircle color="success" /> Saved to browser
            </Box>
            <Stack spacing={2}>
              <Button variant="outlined" startIcon={<NotificationsActive />} onClick={requestNotificationPermission} fullWidth>
                Enable Notifications
              </Button>
              <Button variant="outlined" startIcon={<Download />} onClick={handleExport} fullWidth>
                Download Calendar (.json)
              </Button>
              <Button variant="outlined" component="label" startIcon={<Upload />} fullWidth>
                Restore from Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar 
          open={Boolean(toast)} 
          autoHideDuration={5000} 
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setToast(null)} 
            severity={toast?.severity || 'info'} 
            sx={{ width: '100%' }} 
            action={
              <Button color="inherit" size="small" onClick={handleUndo}>
                UNDO
              </Button>
            }
          >
            {toast?.message}
          </Alert>
        </Snackbar>

      </Container>
    </ThemeProvider>
  )
}

export default CALENDERAPP;
