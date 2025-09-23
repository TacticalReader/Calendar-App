# Calendar-App

A React+Vite Calendar Application deployed on GitHub Pages.

## Live Demo

🚀 **[View Live App](https://tacticalreader.github.io/Calendar-App/)**

#Media-Query still in devlopment 1 weeks later 

## Project Structure

```
Calendar-App/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions workflow for automated deployment
├── calender-app/            # Main React+Vite application
│   ├── src/
│   ├── package.json        # Dependencies and scripts
│   ├── vite.config.js      # Vite configuration with GitHub Pages base path
│   └── ...
├── LICENSE
└── README.md
```

## Deployment Guide

This React+Vite app is configured for deployment to GitHub Pages using two methods:

### Method 1: Automated Deployment (Recommended) 🤖

The repository is configured with **GitHub Actions** for automatic deployment:

- **Trigger**: Every push to the `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Process**: Builds the app and deploys to `gh-pages` branch
- **URL**: https://tacticalreader.github.io/Calendar-App/

#### How it Works:
1. Push changes to the `main` branch
2. GitHub Actions automatically triggers the workflow
3. The workflow builds the React+Vite app from `/calender-app/` directory
4. Deploys the built files to the `gh-pages` branch
5. GitHub Pages serves the app from the `gh-pages` branch

### Method 2: Manual Deployment 🛠️

For manual deployment using the `gh-pages` package:

#### Prerequisites
```bash
node -v   # Node.js 18+ required
npm -v    # npm 6+ required
```

#### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/TacticalReader/Calendar-App.git
cd Calendar-App/calender-app

# Install dependencies
npm install

# Install gh-pages globally (optional)
npm install -g gh-pages
```

#### Build and Deploy
```bash
# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

#### Available Scripts
In the `/calender-app/` directory:

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run predeploy  # Build before deploy (runs automatically)
npm run deploy     # Deploy to GitHub Pages
```

## Configuration Files

### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Calendar-App/',  // GitHub Pages base path
})
```

### `package.json` (Key Sections)
```json
{
  "homepage": "https://tacticalreader.github.io/Calendar-App/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.1"
  }
}
```

## GitHub Pages Setup

### Repository Settings
1. Go to **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` (auto-created by deployment)
4. **Folder**: `/ (root)`

### Custom Domain (Optional)
To use a custom domain:
1. Add a `CNAME` file to the `public/` directory
2. Configure DNS settings with your domain provider
3. Update the `homepage` field in `package.json`

## Troubleshooting

### Common Issues

**❌ App shows blank page after deployment**
- Ensure `base: '/Calendar-App/'` is set in `vite.config.js`
- Check that `homepage` in `package.json` matches the repository name

**❌ GitHub Actions workflow fails**
- Verify the workflow file path: `.github/workflows/deploy.yml`
- Check that GitHub Pages is enabled in repository settings
- Ensure the workflow has proper permissions (should be automatic)

**❌ Manual deployment fails**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try deploying again
npm run deploy
```

**❌ Build errors**
```bash
# Check Node.js version
node -v  # Should be 18+

# Update dependencies
npm update

# Clear Vite cache
npx vite --force
```

### Build Process Details

1. **Development**: `npm run dev`
   - Starts Vite dev server at `http://localhost:5173`
   - Hot reload enabled

2. **Production Build**: `npm run build`
   - Creates optimized build in `/dist/` directory
   - Assets are prefixed with `/Calendar-App/` for GitHub Pages

3. **Deployment**: `npm run deploy`
   - Runs `npm run build` automatically
   - Pushes `/dist/` contents to `gh-pages` branch
   - GitHub Pages serves from `gh-pages` branch

## Development

```bash
cd calender-app
npm install
npm run dev
```

## Technologies Used

- **React 19.1.1** - UI library
- **Vite 7.1.6** - Build tool and dev server
- **GitHub Actions** - CI/CD for automated deployment
- **GitHub Pages** - Static site hosting
- **gh-pages** - Manual deployment tool

## License

Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎉**

For issues or questions, please open an issue in this repository.
