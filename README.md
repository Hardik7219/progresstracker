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

### ScreenShots 
<div style="display:flex; justify-content:center; align-items:center">
  <img width="550" alt="Screenshot_20260421_183848" src="https://github.com/user-attachments/assets/d4029224-ba28-43ab-9167-ba25b0db7b29" />
  <img width="550" alt="Screenshot_20260421_183824" src="https://github.com/user-attachments/assets/801a10b4-e738-4399-a7cd-6d7d4166238c" />
  <img width="550" alt="Screenshot_20260421_183747" src="https://github.com/user-attachments/assets/40f5830b-10a7-4595-879b-bf95bf1cb079" />
</div>



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

## 📄 License

ISC
