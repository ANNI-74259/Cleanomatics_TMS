- Light and dark themes
- Responsive design for desktop and mobile
- Frontend and backend validation

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, CSS
- **Backend:** Node.js, Express
- **Validation:** Joi
- **Security:** Helmet, CORS, express-rate-limit
- **Deployment:** Vercel and Render

## Project Setup

Requirements: Node.js 18+ and npm.

### 1. Run the Backend

Open a terminal:

cd backend
npm install


Create `backend/.env` using `.env.example`.



Start the backend:
npm run dev


Backend API: `http://localhost:5000/api`

Health check: `http://localhost:5000/api/health`

### 2. Run the Frontend

Open a second terminal:

cd frontend
npm install


Create `frontend/.env` using `.env.example` and set:

env
VITE_API_BASE_URL=http://localhost:5000/api

Start the frontend:

npm run dev


Open: `http://localhost:5173`

## Build Commands

### Frontend Production Build


cd frontend
npm install
npm run build


The production build is generated in `frontend/dist`.

### Start Backend


cd backend
npm install
npm start


The backend must have a `start` script in its `package.json`.

## API Endpoints

Base URL: `/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API status |
| GET | `/tasks` | Get tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## How It Works

1. The user interacts with the React frontend.
2. The frontend sends an API request to the Express backend.
3. The backend validates the request using Joi.
4. The controller calls the service to handle the task.
5. The service updates or reads the in-memory task array.
6. The backend returns a JSON response.
7. The frontend updates the interface.

## Environment Variables

Backend: `backend/.env`

env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
SEED_SAMPLE_DATA=true


Frontend: `frontend/.env`
env
VITE_API_BASE_URL=http://localhost:5000/api


Never commit real `.env` files or private secrets to GitHub.

## Security

- Helmet for security headers
- CORS for controlling frontend origins
- Rate limiting for repeated requests
- Joi for request validation
- Central error handling

## Live Demo

- **Frontend:** https://cleanomatics-tms.vercel.app
- **API Health:** https://cleanomatics-tms.onrender.com/api/health


Note: Run the frontend and backend in separate terminals. The commands above assume the scripts and environment variables exist as describe
