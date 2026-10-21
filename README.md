# Pipeline — AI Job Tracker

Track every job application from first click to offer. A full-stack MERN app with JWT authentication, email verification, password reset, brute-force protection, automated follow-up reminders, and a Kanban-style application board.

**License:** MIT — see [LICENSE](./LICENSE)

## Before you push this to GitHub

Two placeholders need your real info — search the project for `YOUR_NAME_HERE` and replace it in:
- `LICENSE` (copyright line)
- `backend/package.json` (`author` field)
- `frontend/package.json` (`author` field)

Also set your git identity for this repo before committing, so commits are credited to your GitHub account:
```bash
git config user.name "Your Name"
git config user.email "your-github-email@example.com"
```

## Stack

- **Frontend:** React 19, Vite, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Email:** Nodemailer (Gmail SMTP) — welcome, verification, password reset, stale-application reminders
- **Security:** express-validator (input validation), express-rate-limit (brute-force/abuse protection), account lockout after repeated failed logins
- **Automation:** node-cron — daily job that emails users about applications stuck in "Applied" for 7+ days

## Project structure

```
ai-job-tracker/
├── backend/
│   ├── jobs/             # node-cron scheduled tasks (stale application reminders)
│   ├── middleware/        # auth (JWT), validators (express-validator), rate limiters
│   ├── models/             # Mongoose schemas (User, Job)
│   ├── routes/              # /api/auth, /api/jobs
│   ├── utils/                # email.js — Nodemailer templates and sending
│   └── server.js
└── frontend/
    └── src/
        ├── api/             # Axios client (attaches JWT, handles 401s)
        ├── components/       # JobCard, JobModal, ConfirmDialog, StatsPanel, FilterBar, VerifyBanner
        ├── context/            # Auth + Toast providers
        ├── hooks/               # useAuth, useToast
        └── pages/                # Landing, Login, Register, ForgotPassword, ResetPassword,
                                    # VerifyEmail, Dashboard
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database — local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- A Gmail account, for sending real emails (optional — the app runs fine without it, it just skips sending and logs to the console instead)

## Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/aijobtracker
JWT_SECRET=<a long random string>
PORT=5000
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Set up Gmail for sending emails (optional but recommended)

The app sends real emails for: welcome message, email verification, password reset, and weekly stale-application reminders.

1. Use a Gmail account (a dedicated one is fine — don't use your main personal password here).
2. Turn on **2-Step Verification**: [myaccount.google.com/security](https://myaccount.google.com/security)
3. Generate an **App Password**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → choose "Mail" → copy the 16-character code.
4. Put your Gmail address as `EMAIL_USER` and the 16-character code (no spaces) as `EMAIL_PASS` in `backend/.env`.

If you skip this, the app still works fully — it just logs `[email] Skipped sending...` to the console instead of actually sending, so you can develop without an email account.

### 4. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 5. Run it

Two terminals:

```bash
# Terminal 1
cd backend
npm run dev
```
```bash
# Terminal 2
cd frontend
npm run dev
```

Open the printed frontend URL (typically `http://localhost:5173`).

## Features

**Authentication & security**
- Register / log in with JWT, stored client-side and sent as `x-auth-token`
- Passwords hashed with bcrypt (cost factor 12)
- Server-side validation on every input (email format, password strength, field lengths)
- Account lockout after 5 failed login attempts (15-minute cooldown)
- Rate limiting on login, registration, and password-reset requests
- Email verification flow (banner + resend option for unverified accounts)
- Forgot-password / reset-password flow with time-limited, single-use tokens
- Login/registration responses never reveal whether an email exists in the system

**Job tracking**
- Kanban-style board: Applied → Interviewing → Offer → Rejected
- Add / edit / delete applications, with notes and listing links
- Change status inline from each card
- Search by company or role, filter by status, sort by date/company/recently updated
- Stats panel: total applications, response rate, offer rate, average days to response, stale-application count
- CSV export of your full application history

**Automated email reminders**
- A daily scheduled job checks for applications sitting in "Applied" for 7+ days with no status change, and emails a digest of which ones need a follow-up (capped at once per week per user, only sent to verified emails)

**UX details**
- Toast notifications for every action (add/update/delete/status change)
- Loading skeletons instead of blank screens
- Optimistic UI updates with rollback on failure
- Empty/no-results states with a way to clear filters

## API reference

| Method | Route                          | Auth | Description                                  |
|--------|---------------------------------|------|------------------------------------------------|
| POST   | `/api/auth/register`             | No   | Create an account, sends welcome + verification email |
| POST   | `/api/auth/login`                 | No   | Log in, returns a token                        |
| GET    | `/api/auth/me`                     | Yes  | Get the current user                           |
| GET    | `/api/auth/verify-email/:token`     | No   | Verify email from emailed link                 |
| POST   | `/api/auth/resend-verification`      | Yes  | Resend the verification email                  |
| POST   | `/api/auth/forgot-password`           | No   | Request a password reset email                 |
| POST   | `/api/auth/reset-password/:token`      | No   | Set a new password using the emailed token      |
| GET    | `/api/jobs`                              | Yes  | List applications (supports `?search=&status=&sort=`) |
| GET    | `/api/jobs/stats`                         | Yes  | Get stats summary                               |
| GET    | `/api/jobs/export`                         | Yes  | Download all applications as CSV                |
| POST   | `/api/jobs`                                 | Yes  | Create an application                           |
| GET    | `/api/jobs/:id`                              | Yes  | Get one application                             |
| PUT    | `/api/jobs/:id`                               | Yes  | Update an application                           |
| DELETE | `/api/jobs/:id`                                | Yes  | Delete an application                           |
| GET    | `/api/health`                                   | No   | Health check (server + DB connection status)    |

Authenticated requests must include header: `x-auth-token: <jwt>`

## Testing

The backend has a Jest + Supertest suite covering auth (registration, login, lockout, password reset) and job CRUD (ownership isolation, validation, search/filter, stats, CSV export), using an in-memory MongoDB instance so no real database is needed to run them.

```bash
cd backend
npm test              # run once
npm run test:watch     # watch mode
npm run test:coverage   # with coverage report
```

## Building for production

```bash
cd frontend
npm run build      # outputs to frontend/dist
```

Serve `frontend/dist` with any static host (Vercel, Netlify), and deploy `backend/` to any Node host (Render, Railway, Fly.io) with the same environment variables. In production, also set `CLIENT_URL` to your real frontend domain — it's used both to build links in emails and to restrict CORS.

## Notes

- Never commit a real `.env` file — `.gitignore` already excludes it. Only `.env.example` files are committed.
- The reminder scheduler runs daily at 09:00 server time; adjust the cron expression in `backend/jobs/reminderScheduler.js` if needed.
- If `EMAIL_USER`/`EMAIL_PASS` aren't set, email sending is silently skipped (logged to console) rather than throwing — the app remains fully usable without email configured.

## Authentication & validation

- **Passwords** must be 8–72 characters with an uppercase letter, a lowercase letter, a number and a special character. Enforced on the server (`backend/middleware/validators.js`) and mirrored in the UI (`frontend/src/utils/validation.ts`) with a live strength meter and checklist.
- **Names** may contain letters (including accented), spaces, hyphens, apostrophes and periods — no numbers or symbols.
- Passwords are hashed with bcrypt (cost 12); sign-in is rate limited and accounts lock for 15 minutes after 5 failed attempts.
- Show/hide password toggle, inline field errors, and screen-reader friendly announcements.
