<h1 align="center">📋 Job Application Tracker</h1>

<p align="center">
  A full-stack Kanban-style tracker to organize every job application in one clear pipeline.
</p>

<p align="center">
  <a href="https://job-application-tracker-ten-pi.vercel.app"><img src="https://img.shields.io/badge/🌐%20Live%20Demo-Open%20Site-000000?style=for-the-badge&logo=vercel" /></a>
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
</p>

## 🌐 Live Demo

**👉 [https://job-application-tracker-ten-pi.vercel.app](https://job-application-tracker-ten-pi.vercel.app)**

> ⏳ The backend runs on a free Render instance, so the **first load may take about a minute** while the server wakes up. After that, it is fast.

---

## ✨ Features

- 🔐 Secure register and login with JWT authentication
- 🗂️ Kanban board to move applications through stages
- 🔍 Search and filter applications by company, role, or status
- 📊 Stats overview of your job search progress
- ➕ Add, edit, and delete applications
- 📱 Responsive design for desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| Deployment | Vercel (frontend), Render (backend) |

---

## ⚙️ Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/Pritihambarde/Job-Application-Tracker.git
cd Job-Application-Tracker
```

### 2. Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000
```
Start the server:
```bash
npm start
```

### 3. Frontend
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the app:
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🌍 Deployment

- **Frontend (Vercel):** set `VITE_API_URL` to your Render backend URL followed by `/api`
- **Backend (Render):** set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, and `CLIENT_URL` (your Vercel URL, no trailing `/`)

---

## 🚧 Future Improvements

- 📅 Interview reminders and follow-up dates
- 📎 Resume and document attachments
- 🌙 Dark and light theme toggle

---

## 👩‍💻 Author

**Priti Hambarde**
[GitHub](https://github.com/Pritihambarde) · [Email](mailto:pritihambarde14@gmail.com)

⭐ If you like this project, give it a star!
