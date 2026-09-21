# InternHub — Internship Management Portal 🎓💼
Live Demo :https://internship-management-portal-2.onrender.com/
A **complete, deploy-ready full-stack project**: students discover internships and track applications, recruiters post roles and manage applicants through a hiring pipeline, and admins run the whole platform.

**Stack:** React 18 (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT auth · Docker

---

## ✨ Features

### 👩‍🎓 Students
- Register / login with JWT, rich profile (college, skills, bio, links)
- Resume (PDF/DOC) + avatar uploads
- Browse internships with **search, filters** (category, mode, location, stipend), **sorting & pagination**
- **1-click apply** with cover letter, save/bookmark roles
- Application **status tracking + timeline** (Applied → Under Review → Shortlisted → Interview → Selected/Rejected)
- Interview details (date, meeting link) in-app
- Personal dashboard: stats, recent applications, **skill-based recommendations**, profile completion
- In-app **notifications**

### 💼 Recruiters
- Post / edit / close / delete internship listings (draft support)
- Dashboard with applicant **funnel chart**, recent applicants, listing stats
- Applicant management: search, filter by role/status, **rate + private notes**
- Move candidates through the pipeline, **schedule interviews** (auto-notifies student)

### 🛠️ Admins
- Platform analytics (users, listings, applications by status, top roles)
- User management: change roles, block/unblock, delete
- Listing moderation: edit status, edit/delete any listing

### 🔧 Engineering
- RESTful API with validation (`express-validator`), centralized error handling
- Security: `helmet`, CORS allowlist, rate limiting, bcrypt hashing, role-based access
- Pagination, denormalized counters, text search
- Health-check endpoint, request logging
- **Demo mode**: runs with zero setup using in-memory MongoDB + auto seed 🌱
- Seed script with realistic demo data (12 listings, 8 applications)
- Docker + docker-compose, Render blueprint, GitHub Actions CI

---

## 🚀 Quick start (2 minutes, no database needed)

```bash
# 1. Install
cd backend && npm install
cd ../frontend && npm install

# 2. Run backend (auto-starts in-memory demo DB + seeds demo data)
cd ../backend && npm run dev

# 3. In a new terminal, run frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** 🎉

**Demo accounts:**

| Role      | Email                    | Password      |
|-----------|--------------------------|---------------|
| Student   | student@gmail.com        | Student@123   |
| Recruiter | recruiter@technova.io    | Recruiter@123 |
| Admin     | admin@internhub.com      | Admin@123     |

> Demo mode data resets on every restart — perfect for trying things out.

---

## 🗄️ Using a real database (MongoDB Atlas — free)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) → get the connection string.
2. `cd backend && cp .env.example .env` and set:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/internhub
   JWT_SECRET=a-long-random-secret
   FRONTEND_URL=http://localhost:5173
   ```
3. Seed demo data (optional): `npm run seed`
4. Start: `npm run dev` (backend) + `npm run dev` (frontend)

---

## 📁 Project structure

```
internship-portal/
├── backend/                 # Express + Mongoose API
│   ├── config/db.js         # Atlas or in-memory DB connection
│   ├── controllers/         # auth, user, internship, application, dashboard, notification, upload
│   ├── middleware/          # JWT auth, roles, validation, uploads, error handler
│   ├── models/              # User, Internship, Application, Notification
│   ├── routes/              # auth, users, internships, applications, dashboard, notifications, uploads
│   ├── utils/pagination.js
│   ├── uploads/             # resumes + avatars (served statically)
│   ├── seed.js              # realistic demo dataset
│   └── server.js
├── frontend/                # React 18 + Vite SPA
│   └── src/
│       ├── api/             # axios client + interceptors
│       ├── context/         # auth state
│       ├── components/      # Navbar, cards, modals, tables, badges...
│       ├── pages/           # Home, Browse, Detail, dashboards, admin, profile...
│       └── utils/format.js
├── .github/workflows/ci.yml
├── Dockerfile               # single-image full-stack build
├── docker-compose.yml       # app + MongoDB
├── render.yaml              # one-click Render deploy
└── README.md
```

---

## 🔌 API reference

Base URL: `http://localhost:5000/api`

**Auth** — `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PUT /auth/profile` · `PUT /auth/password`

**Internships** — `GET /internships?q&category&mode&location&minStipend&sort&page` · `GET /internships/meta` · `GET /internships/featured` · `GET /internships/:id` · `POST /internships` · `PUT /internships/:id` · `PATCH /internships/:id/status` · `DELETE /internships/:id`

**Applications** — `POST /applications` · `GET /applications/my` · `GET /applications/recruiter?internshipId&status&search` · `GET /applications/:id` · `PATCH /applications/:id/withdraw` · `PATCH /applications/:id/status` · `PATCH /applications/:id/interview` · `PATCH /applications/:id/review`

**Dashboards** — `GET /dashboard/student` · `GET /dashboard/recruiter` · `GET /dashboard/admin`

**Users (admin)** — `GET /users` · `GET /users/:id` · `PATCH /users/:id` · `DELETE /users/:id`
**Saved** — `GET /users/me/saved` · `POST /users/me/saved/:internshipId`

**Notifications** — `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all`

**Uploads** — `POST /uploads/resume` · `POST /uploads/avatar`

**Health** — `GET /health`

---

## 🐳 Deploy

### Option A — Single service with Docker (recommended)
```bash
# Needs a real MongoDB: set JWT_SECRET (and MONGODB_URI override if using Atlas)
JWT_SECRET=your-secret docker compose up --build
```
App serves at **http://localhost:5000** (API + frontend from one container).

### Option B — Render (free) + MongoDB Atlas (free)
1. Push this repo to GitHub.
2. Create an Atlas cluster → copy the connection string.
3. Render dashboard → **New + → Blueprint** → select repo (`render.yaml`).
4. Paste `MONGODB_URI`, deploy. Update `FRONTEND_URL` to your Render URL after the first deploy.

### Option C — Split deploy (Vercel/Netlify + Render/Railway)
1. Deploy `backend/` to Render/Railway with `MONGODB_URI` + `JWT_SECRET`, set `FRONTEND_URL` to your frontend URL.
2. Deploy `frontend/` to Vercel/Netlify with env `VITE_API_URL=https://<backend>/api`.

---

## 🧪 Useful commands

| Command | Where | What |
|---|---|---|
| `npm run dev` | backend | API with auto-reload (demo DB if no URI) |
| `npm start` | backend | Production API |
| `npm run seed` | backend | Seed real DB (needs `MONGODB_URI`) |
| `npm run dev` | frontend | Vite dev server (proxies `/api` → :5000) |
| `npm run build` | frontend | Production build (`dist/`) |

## 📝 Notes for production
- Set a strong `JWT_SECRET` and a `FRONTEND_URL` allowlist.
- For resume storage at scale, swap local `uploads/` for S3/Cloudinary (the upload controller is isolated in one file).
- Free-tier hosts sleep: the `/api/health` endpoint is wired for uptime monitors.

Built with ❤️ as a resume-ready full-stack project.
