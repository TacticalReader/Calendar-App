
# 📅 Calendar App

> A modern, feature-rich calendar application built with React and Vite, offering comprehensive event management with recurring events, browser notifications, and seamless user experience.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visitct](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&FF?style=for-the-badge&logo=vite&logo<div align="center">
  <img src="https://opengraph.githubassets.com/ef74d8bbaea4b3fa74497bb9b4d31c65cac7deb7c7021312b21b2f018c95508b/TacticalReader/Calendar-App" alt="Calendar App Preview" width="600px">
</div>

***

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Usage](#-usage)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [API & Components](#-api--components)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

***

## 🌟 Overview

Calendar App is a client-side calendar application that provides a complete event management solution without requiring a backend. Built with modern web technologies, it offers intuitive navigation, powerful recurring event capabilities, and persistent data storage using browser localStorage.

### Key Highlights

✅ **No Backend Required** - Fully client-side application  
✅ **Offline Capable** - Works without internet connection  
✅ **Auto-Deploy** - Continuous deployment via GitHub Actions  
✅ **Mobile Responsive** - Optimized for all screen sizes  
✅ **Data Export/Import** - Backup and restore capabilities

***

## ✨ Features

### 🗓️ Calendar Views
- **Month View**: Traditional monthly calendar grid with event indicators
- **Week View**: Focus on a 7-day week with all events visible
- **Day View**: Detailed view of events for a single day
- **Swipe Navigation**: Touch-friendly gesture controls for quick date switching
- **Jump to Today**: Quick navigation to current date

### 📝 Event Management
- **Create Events**: Add events with title, date, and time
- **Edit Events**: Modify existing events with ease
- **Delete Events**: Remove events with undo functionality
- **Time Picker**: 12-hour format (AM/PM) time selection
- **Character Limit**: Event titles up to 60 characters
- **Visual Indicators**: Calendar dates highlight when events are present

### 🔄 Recurring Events (Advanced)
- **Recurrence Types**:
  - Daily (every X days)
  - Weekly (every X weeks on the same day)
  - Monthly (same date or same day of week)
  - Yearly (anniversary events)
  
- **Flexible Intervals**: Custom frequency (e.g., every 3 days, every 2 weeks)

- **Monthly Options**:
  - **Same Date**: Occurs on the 15th of every month
  - **Same Day**: Occurs on 1st Monday of every month

- **End Conditions**:
  - Never (infinite recurrence)
  - On specific date
  - After X occurrences

### 🔔 Notifications & Reminders
- **Browser Notifications**: Desktop alerts for upcoming events
- **Reminder Options**:
  - At time of event
  - 5, 10, 15, 30 minutes before
  - 1 hour before
  - 1 day before
- **Permission Management**: Simple one-click notification setup

### 💾 Data Management
- **LocalStorage Persistence**: Automatic saving of all events
- **Export to JSON**: Download complete calendar backup
- **Import from JSON**: Restore calendar from backup file
- **Undo Function**: Revert accidental deletions
- **Toast Notifications**: Visual feedback for all actions

### 🎨 User Experience
- **Smooth Animations**: Framer Motion-powered transitions
- **Past Date Styling**: Automatic visual distinction for past dates
- **Empty States**: Helpful messages when no events exist
- **Settings Panel**: Centralized data management interface
- **Responsive Design**: Adapts to desktop, tablet, and mobile screens

***

## 🚀 Demo

### Live Application
🔗 **[https://tacticalreader.github.io/Calendar-App/](https://tacticalreader.github.io/Calendar-App/)**

### Features Showcase
- Create a sample event to test the interface
- Try swipe gestures on mobile/tablet
- Enable notifications to receive event reminders
- Export your calendar and re-import it

***

## 📦 Installation

### Prerequisites
Ensure you have the following installed:
- **Node.js**: v14.0 or higher
- **npm**: v6.0 or higher (comes with Node.js)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TacticalReader/Calendar-App.git
   cd Calendar-App
   ```

2. **Navigate to project directory**
   ```bash
   cd calender-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run deploy` | Deploy to GitHub Pages |

***

## 📚 Usage

### Adding an Event

1. **Click** on any date in the calendar
2. **Set time** using the hour/minute picker and AM/PM selector
3. **Enter event description** (maximum 60 characters)
4. **(Optional)** Configure recurrence settings
5. **(Optional)** Set reminder time
6. **Click** "Add Event" button

### Editing an Event

1. **Click** the edit icon (✏️) on any event card
2. **Modify** event details as needed
3. **Click** "Update Event" to save changes

> **Note**: Editing a recurring event updates the entire series

### Deleting an Event

1. **Click** the delete icon (❌) on any event card
2. **Undo** deletion using the toast notification if needed

### Setting Up Recurring Events

**Example 1: Weekly Team Meeting**
```
Repeat: Weekly
Interval: 1
Ends: Never
```

**Example 2: Monthly Payment (15th of every month)**
```
Repeat: Monthly
Interval: 1
On: Same date (15th)
Ends: Never
```

**Example 3: First Monday Project Review**
```
Repeat: Monthly
Interval: 1
On: Same day (1st Monday)
Ends: After 12 occurrences
```

### Enabling Browser Notifications

1. **Click** the settings icon (⚙️) in the header
2. **Click** "Enable Notifications"
3. **Allow** browser permission when prompted
4. Notifications will appear based on your reminder settings

### Backup & Restore

**To Backup:**
1. Open Settings (⚙️)
2. Click "Download Calendar (.json)"
3. Save the file to a safe location

**To Restore:**
1. Open Settings (⚙️)
2. Click "Restore from Backup"
3. Select your `.json` backup file
4. Confirm restoration

***

## 🛠️ Technology Stack

### Frontend Framework & Build Tools
- **[React](https://reactjs.org/)** (v19.1.1) - UI library for building interactive interfaces
- **[Vite](https://vitejs.dev/)** (v7.1.6) - Next-generation frontend build tool
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animation library

### Development Tools
- **[ESLint](https://eslint.org/)** (v9.35.0) - JavaScript linting utility
- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** (v5.0.2) - Official React plugin for Vite

### Deployment & CI/CD
- **[GitHub Actions](https://github.com/features/actions)** - Automated workflows
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting
- **[gh-pages](https://www.npmjs.com/package/gh-pages)** (v6.1.1) - Deployment utility

### Browser APIs Used
- **LocalStorage API** - Client-side data persistence
- **Notification API** - Browser notifications for reminders
- **Date API** - Date and time manipulation

***

## 📁 Project Structure

```
Calendar-App/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
│
├── calender-app/                   # Main application directory
│   ├── src/
│   │   ├── Components/
│   │   │   ├── CALENDERAPP.jsx    # Main calendar component (990 lines)
│   │   │   └── CALENDERAPP.css    # Component-specific styles
│   │   │
│   │   ├── utils/
│   │   │   └── recurrence.js      # Recurring event logic & calculations
│   │   │
│   │   ├── App.jsx                # Root application component
│   │   ├── App.css                # Global application styles
│   │   ├── main.jsx               # React entry point (ReactDOM.render)
│   │   └── index.css              # Base CSS reset & global styles
│   │
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration
│   ├── eslint.config.js           # ESLint rules & configuration
│   ├── package.json               # Dependencies & scripts
│   └── package-lock.json          # Locked dependency versions
│
├── LICENSE                        # Apache 2.0 License
└── README.md                      # Project documentation
```

### Key Files Explained

- **`CALENDERAPP.jsx`**: Core calendar logic including state management, event CRUD operations, recurrence handling, and UI rendering
- **`recurrence.js`**: Utility functions for calculating recurring event occurrences within date ranges
- **`deploy.yml`**: Automated deployment workflow that builds and publishes to GitHub Pages on every push to main branch
- **`vite.config.js`**: Configures base path for GitHub Pages deployment

***

## 🔧 API & Components

### Main Component: `CALENDERAPP`

**State Management:**
```javascript
- currentDate: Currently displayed date
- selectedDate: User-selected date for event creation
- view: 'month' | 'week' | 'day'
- events: Array of event objects
- showEventPopup: Boolean for event form visibility
- recurrence settings: Type, interval, end conditions
- reminder: Minutes before event to notify
```

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `handleDateClick()` | Opens event creation popup for selected date |
| `handleEventSubmit()` | Saves new or edited event with recurrence data |
| `handleDeleteEvent()` | Removes event and shows undo toast |
| `changeDate()` | Navigates between months/weeks/days |
| `getOccurrences()` | Expands recurring events for display |
| `requestNotificationPermission()` | Enables browser notifications |

### Utility Module: `recurrence.js`

**Functions:**
```javascript
getOccurrences(events, startDate, endDate)
// Expands recurring events into individual occurrences

getNextOccurrence(event, fromDate)
// Finds next occurrence after given date
```

***

## 🚀 Deployment

### Automated Deployment (GitHub Actions)

The project uses GitHub Actions for continuous deployment:

1. **Trigger**: Push to `main` branch
2. **Build**: Installs dependencies and builds production bundle
3. **Deploy**: Publishes to GitHub Pages automatically

**Workflow File:** `.github/workflows/deploy.yml`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Deployment Configuration

**vite.config.js:**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Calendar-App/', // GitHub Pages base path
})
```

**package.json:**
```json
{
  "homepage": "https://tacticalreader.github.io/Calendar-App/"
}
```

***

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update README if adding new features
- Ensure ESLint passes: `npm run lint`

### Areas for Contribution

- [ ] Add drag-and-drop event rescheduling
- [ ] Implement event categories/tags with color coding
- [ ] Add calendar sharing functionality
- [ ] Create dark mode theme
- [ ] Support for all-day events
- [ ] Multiple calendar views (agenda, timeline)
- [ ] Export to iCal/Google Calendar format

***

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for full details.

```
Copyright 2024 TacticalReader

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
```

***

## 👤 Contact

**TacticalReader**

- GitHub: [@TacticalReader](https://github.com/TacticalReader)
- Repository: [Calendar-App](https://github.com/TacticalReader/Calendar-App)
- Issues: [Report a bug](https://github.com/TacticalReader/Calendar-App/issues)

***

## 🙏 Acknowledgments

- **React Team** - For the incredible UI library
- **Vite Team** - For blazing fast build tooling
- **Framer Motion** - For smooth animations
- **Boxicons** - For beautiful icons
- **GitHub** - For hosting and CI/CD infrastructure

***

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/TacticalReader/Calendar-AppTacticalReader/Calendar-App

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by TacticalReader**

[🔝 Back to Top](#-calendar-app)


