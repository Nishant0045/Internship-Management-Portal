# Internship Management Portal — Full Stack

A resume-ready internship management application built with Node.js, Express.js, MongoDB and vanilla JavaScript.

## Features
- Student registration and login with JWT
- Internship listing, search and filtering
- Apply for internships
- Application status tracking
- Admin internship CRUD
- RESTful API
- MongoDB persistence
- Responsive frontend

## Run locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB URI and JWT secret
npm start
```

### Frontend
Open `frontend/index.html` with a local server (for example VS Code Live Server).

Backend runs on `http://localhost:5000`.

## API
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/internships`
- POST `/api/internships`
- PUT `/api/internships/:id`
- DELETE `/api/internships/:id`
- POST `/api/applications/:internshipId`
- GET `/api/applications/my`

## Deployment
Deploy the backend to Render/Railway and the frontend to GitHub Pages/Netlify/Vercel. Set the frontend API URL to the deployed backend URL.
