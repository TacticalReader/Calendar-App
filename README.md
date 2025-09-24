
# Calendar-App

**A modern, responsive Calendar Application built with React (v19) + Vite, featuring event creation, editing, deletion, and sleek UI. Effortlessly deployed with GitHub Actions to GitHub Pages.**

[🚀 Live Demo](https://tacticalreader.github.io/Calendar-App/)

***

## Features

- **Monthly calendar view** with intuitive day grid
- **Add, edit & delete events** for any date (with time and notes)
- **Navigable months/years** (seamlessly move backwards or forwards)
- **Sorting of events** in chronological order
- **Event popup modal** optimized for accessibility
- **Responsive & modern design:** CSS with custom fonts, flexible layouts, and support for mobile/tablet/desktop
- **State management** with React hooks (`useState`)
- **All client-side, no backend required**
- **Deployed and updated automatically** on push via GitHub Actions

***

## Project Structure

```
Calendar-App/
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions for CI/CD deployment
├── calender-app/            # Main React + Vite application
│   ├── src/
│   │   ├── Components/
│   │   │   ├── CALENDERAPP.jsx
│   │   │   └── CALENDERAPP.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── LICENSE
└── README.md
```

***

## Getting Started

### Prerequisites

- Node.js 18+
- npm 6+

### Clone & Local Development

```bash
git clone https://github.com/TacticalReader/Calendar-App.git
cd Calendar-App/calender-app
npm install
npm run dev  # Local dev server at http://localhost:5173
```

***

## Deployment

### 1. Automated (Recommended)

This repo includes a GitHub Actions workflow that **automatically builds and deploys** the app to GitHub Pages whenever you push to `main`.

#### How it works

- On every push to `main`, `.github/workflows/deploy.yml`:
  - Installs dependencies
  - Builds your app (`/calender-app`)
  - Deploys `dist/` to the `gh-pages` branch
- GitHub Pages serves from `gh-pages` branch ([view live](https://tacticalreader.github.io/Calendar-App/))

### 2. Manual (with gh-pages)

```bash
cd Calendar-App/calender-app
npm install
npm run build         # Builds app to /dist
npm run deploy        # Deploys using gh-pages
```

***

## Configuration

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Calendar-App/', // Required for GitHub Pages
})
```

### package.json (Deployment scripts)

```json
{
  "homepage": "https://tacticalreader.github.io/Calendar-App/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  ...
}
```

***

## Customization & Extending

- **Add features:** Extend `CALENDERAPP.jsx` for reminders, recurring events, or notifications.
- **Styling:** Edit `CALENDERAPP.css` for branding/theme changes.
- **Deployment:** For a custom domain, add a `CNAME` file to `public/` and update `homepage` in `package.json`.

***

## Troubleshooting

- **Blank page after deployment?**
  - Check `base: '/Calendar-App/'` in `vite.config.js`
  - Ensure `homepage` matches repo in `package.json`
- **Workflow fails?**
  - Confirm `.github/workflows/deploy.yml` path
  - GitHub Pages must be enabled in repo Settings
- **Build errors?**
  - Node.js should be v18+; run `node -v`
  - Clear cache: `npm cache clean --force`
  - Reinstall: `rm -rf node_modules package-lock.json && npm install`

***

## Technologies Used

- **React 19.1.1** (UI Library)
- **Vite 7.1.6** (Lightning-fast dev/build)
- **GitHub Actions** (CI/CD for automatic deployment)
- **GitHub Pages** (Static hosting)
- **gh-pages npm package** (Manual deployment support)

***

## License

Apache-2.0 License — see LICENSE file for details.

***

## Contributing

Pull requests and issues are welcome! For major changes, please open an issue first to discuss what you would like to change or improve.

***

## Author

Made by [TacticalReader](https://github.com/TacticalReader)

***

## Screenshots

> _screenshot_

***

**Happy coding!** 🎉

***

[1](https://github.com/TacticalReader/Calendar-App)
[2](https://tacticalreader.github.io/Calendar-App/)
