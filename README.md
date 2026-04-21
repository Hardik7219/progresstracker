# 📈 Progress Tracker

A cross-platform productivity app for tracking tasks, daily streaks, and personal progress — available as a web app, Android app (Capacitor), and desktop app (Electron).

---

## ✨ Features

### ✅ Task Management
- Create **one-time**, **daily**, and **weekly** tasks
- Tasks auto-reset daily/weekly without breaking streak history
- Full-text search and filter by type or completion status
- Tasks older than 30 days are flagged for archiving

### 📊 Progress Analytics
- **Progress Score** (0–100) based on completion rate, streak bonus, and consistency
- Daily and weekly completion trend charts (Line + Bar via Chart.js)
- Activity heatmap (GitHub-style calendar view)
- Improvement trend detection (improving / stable / declining)
- Permanent **completion log** — analytics history never resets

### 🔥 Streaks
- Task streak: consecutive days with at least one completed task
- Photo streak: consecutive days with at least one uploaded photo
- Animated streak counters
- Streak survives task resets and archiving (powered by the completion log)

### 📸 Photo Journal
- Upload a daily photo to document your progress
- Calendar view shows which days have photos
- Photo viewer with update and delete support

### 👥 Friend / Partner System
- Link with a friend by username
- View a friend's analytics dashboard (score, stats, charts)

### 🔔 Notifications
- Schedule reminders by title and time (Capacitor LocalNotifications on Android, Web Notifications API on web)
- View upcoming and past notifications
- Delete individual notifications

### 📤 Data Export
- **JSON** — full data export (tasks, photos, settings, completion log)
- **CSV** — spreadsheet-compatible task list
- **PDF** — professional progress report (jsPDF + AutoTable)
- **Archived JSON** — export archived tasks separately

### 🌗 Theming
- Dark and light mode with one-click toggle
- Persisted to settings

### 📱 Responsive / Cross-Platform
- Mobile-friendly sidebar with overlay navigation
- Android app via **Capacitor**
- Desktop app via **Electron** (with native Save dialog for file exports)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Charts | Chart.js + react-chartjs-2 |
| Date utilities | date-fns |
| Icons | lucide-react |
| PDF export | jsPDF + jspdf-autotable |
| Mobile | Capacitor (Android), LocalNotifications |
| Desktop | Electron, electron-builder |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (localStorage), bcrypt |
| Email | Nodemailer (Resend-compatible) |
| Validation | validator.js |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd progress-tracker
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:4000

# Optional — for email features
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Create `.env` (frontend root, optional):

```env
VITE_API_URL=http://localhost:4000
```

### 5. Run the development servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
# from project root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🖥️ Electron (Desktop)

```bash
# Run in dev mode
npm run electron:dev

# Build distributable
npm run electron:build
```

Builds are output to the `release/` directory. Supports Windows (NSIS), Linux (AppImage), and macOS (DMG).

---

## 📱 Android (Capacitor)

```bash
# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 📁 Project Structure

```
progress-tracker/
├── backend/                  # Express API server
│   ├── models/               # Mongoose models (User, Analytics)
│   ├── mailer.js             # Email utility
│   └── index.js              # Entry point, all routes
│
├── electron/
│   ├── main.js               # Electron main process
│   └── preload.cjs           # Context bridge (saveFile IPC)
│
├── src/
│   ├── components/           # React UI components
│   │   ├── Dashboard.jsx
│   │   ├── TaskManager.jsx
│   │   ├── ProgressAnalytics.jsx
│   │   ├── PhotoJournal.jsx
│   │   ├── FriendData.jsx
│   │   ├── NotificationSettings.jsx
│   │   ├── ExportData.jsx
│   │   ├── CalendarHeatmap.jsx
│   │   ├── StreakCounter.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TaskForm.jsx
│   │   └── ThemeToggle.jsx
│   │
│   ├── services/             # Business logic & data layer
│   │   ├── storageService.js      # localStorage CRUD (tasks, photos, settings)
│   │   ├── analyticsService.js    # Stats, scores, trends, insights
│   │   ├── streakService.js       # Streak + heatmap calculations
│   │   ├── exportService.js       # JSON / CSV / PDF export
│   │   └── notificationService.js # Capacitor + Web Notifications
│   │
│   ├── App.jsx               # Root component, routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Design system & global styles
│
├── capacitor.config.ts       # Capacitor configuration
├── vite.config.js            # Vite + Tailwind config
└── package.json
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/create` | Register a new user |
| POST | `/login` | Login and receive JWT |
| POST | `/logout` | Clear auth cookie |
| GET | `/me` | Get current user from JWT |
| GET | `/verify/:token` | Verify email address |
| POST | `/forgot-password` | Request a password reset email |
| POST | `/reset-password/:token` | Submit new password |
| POST | `/analys` | Upsert analytics data for a user |
| POST | `/friend` | Link two users as partners |
| GET | `/analysFriend/:id` | Get a user's partner's analytics |

---

## 💾 Local Data Storage

All task and analytics data is stored in the browser's `localStorage` using the following keys:

| Key | Contents |
|---|---|
| `pt_tasks` | Active tasks |
| `pt_archived_tasks` | Tasks archived after 30 days |
| `pt_completion_log` | Permanent completion history (never auto-deleted) |
| `pt_photos` | Photo journal entries (base64) |
| `pt_settings` | User preferences (theme, etc.) |

The **completion log** is the source of truth for all streaks and analytics. It is never cleared by task resets, archiving, or deletion.

---

## 📄 License

ISC
