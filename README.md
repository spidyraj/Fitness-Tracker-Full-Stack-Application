# 🏋️‍♂️ AI Fitness Tracker

> A production-ready, full-stack fitness tracking application powered by AI coaching.  
> Built with a **React + TypeScript** frontend and a **Spring Boot monolith** backend — deployed live on Vercel & Railway.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel&style=flat-square)](https://fitness-tracker-full-stack-applicat.vercel.app)
[![CI/CD Pipeline](https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application/actions/workflows/ci.yml/badge.svg)](https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application/actions)
[![Backend](https://img.shields.io/badge/Backend-Railway-blueviolet?logo=railway&style=flat-square)](https://railway.app)

---

## 🌐 Live Demo

**Frontend:** [https://fitness-tracker-full-stack-applicat.vercel.app](https://fitness-tracker-full-stack-applicat.vercel.app)

| Credential | Value |
|------------|-------|
| Demo Email | Register a free account |
| Backend API | Deployed on Railway (Spring Boot monolith) |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register / login with stateless JWT tokens
- 🏋️ **Workout Logging** — Log exercises by type (Cardio, Strength, Flexibility) with duration tracking
- 🥗 **Nutrition Tracking** — Calorie & macro logging (protein, carbs, fat) with meal-type categorisation
- 🤖 **AI Coach (FitCoach)** — Context-aware coaching via Groq API (Llama 3), with full markdown rendering
- 📊 **Analytics Dashboard** — Real-time progress charts, animated stat rings, and daily summaries
- 👤 **User Profile** — BMI calculator, fitness goals, and personal stats management
- 💬 **Floating Chatbot Widget** — Persistent AI assistant accessible from any page
- 🌙 **Dark Mode UI** — Premium glassmorphism design with 3D card tilt effects and micro-animations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Client (Browser)                │
│    React 18 + TypeScript + Vite             │
│    Deployed on: Vercel                       │
└────────────────────┬────────────────────────┘
                     │ HTTPS / Axios
┌────────────────────▼────────────────────────┐
│         Spring Boot Monolith  :8080          │
│  Spring Security (JWT)  •  Spring Data JPA  │
│  WebFlux (Groq AI)  •  Caffeine Cache       │
│  Deployed on: Railway                        │
└──────┬──────────┬──────────────┬────────────┘
       │          │              │
  ┌────▼───┐ ┌────▼────┐   ┌────▼────┐
  │Postgres│ │ Neon.tech│   │  Groq   │
  │(Neon)  │ │  (cloud) │   │  API    │
  └────────┘ └──────────┘   └─────────┘
```

The backend is a **consolidated monolith** (previously a microservices design) containing all domain modules — `user`, `workout`, `nutrition`, `analytics`, and `ai` — under a single deployable Spring Boot application. This simplifies Railway deployment while retaining clean domain separation via packages.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.6 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **React Router DOM** | 6.x | Client-side routing (SPA) |
| **Axios** | 1.x | HTTP client for API calls |
| **Lucide React** | latest | Icon library |
| **Vanilla CSS** | — | Custom dark-mode design system |
| **Vercel** | — | Hosting + SPA rewrite rules |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Language |
| **Spring Boot** | 3.x | Application framework |
| **Spring Security** | 6.x | JWT auth & route protection |
| **Spring Data JPA** | — | ORM + repository layer |
| **Spring WebFlux** | — | Reactive HTTP client (Groq API) |
| **JJWT** | — | JWT creation & validation |
| **PostgreSQL** | — | Primary relational database |
| **Neon.tech** | — | Serverless PostgreSQL hosting |
| **Caffeine Cache** | — | In-memory AI response caching |
| **Lombok** | 1.18 | Boilerplate reduction |
| **MapStruct** | — | DTO ↔ Entity mapping |
| **Groq API (Llama 3)** | — | AI coaching engine |
| **Docker** | — | Containerisation |
| **Railway** | — | Cloud backend deployment |

### DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI/CD pipeline (build → test → push) |
| **Docker** | Container image for Railway |
| **Kubernetes + k8s/** | Manifests available for self-hosted orchestration |
| **Maven** (multi-module) | Backend build system |

---

## 📁 Project Structure

```
fitness-tracker/
├── frontend/                        # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Animated stats, progress charts
│   │   │   ├── Workouts.tsx         # Workout CRUD
│   │   │   ├── Nutrition.tsx        # Meal & macro tracking
│   │   │   ├── FitCoach.tsx         # Full AI coaching page
│   │   │   ├── Profile.tsx          # User profile & BMI
│   │   │   └── EnhancedLogin.tsx    # Auth pages
│   │   ├── components/
│   │   │   ├── ChatbotWidget.tsx    # Floating AI chat widget
│   │   │   ├── ProgressChart.tsx    # Animated SVG charts
│   │   │   ├── TopNav.tsx           # Persistent navigation bar
│   │   │   ├── AppLayout.tsx        # Centralised layout wrapper
│   │   │   ├── WorkoutAnimations.tsx# 3D card & animation components
│   │   │   ├── Toast.tsx            # Notification system
│   │   │   ├── ErrorBoundary.tsx    # React error boundary
│   │   │   └── LoadingSkeleton.tsx  # Skeleton loading states
│   │   ├── services/                # Axios API service layer
│   │   ├── context/                 # React Context (auth state)
│   │   ├── types/                   # TypeScript interfaces
│   │   └── styles/                  # Global CSS tokens
│   ├── vercel.json                  # SPA rewrite rules for Vercel
│   └── vite.config.ts
│
├── backend/
│   ├── monolith-service/            # Spring Boot monolith
│   │   ├── src/main/java/com/fitnesstracker/monolith/
│   │   │   ├── user/                # Registration, login, JWT
│   │   │   ├── workout/             # Exercise logging & CRUD
│   │   │   ├── nutrition/           # Meal & macro tracking
│   │   │   ├── analytics/           # Daily summaries & aggregation
│   │   │   ├── ai/                  # Groq API integration
│   │   │   ├── security/            # JWT filter, Spring Security config
│   │   │   ├── config/              # CORS, cache, WebClient config
│   │   │   └── exception/           # Global exception handler
│   │   └── Dockerfile
│   ├── k8s/                         # Kubernetes manifests (self-hosted option)
│   ├── docker-compose.yml           # Local dev stack
│   ├── railway.toml                 # Railway deployment config
│   └── pom.xml                      # Maven parent POM
│
└── .github/workflows/ci.yml         # GitHub Actions CI/CD
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ & npm
- **Java 21+** & Maven 3.9+
- **Docker Desktop** (optional, for local PostgreSQL)

### 1. Clone the repo

```bash
git clone https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application.git
cd Fitness-Tracker-Full-Stack-Application
```

### 2. Start the Backend

```bash
cd backend

# Option A — Use cloud databases (Neon + Groq API keys in .env)
cp .env.example .env
# Fill in: DATABASE_URL, GROQ_API_KEY

mvn spring-boot:run -pl monolith-service

# Option B — Docker Compose (spins up local PostgreSQL)
docker compose up --build
```

Backend runs at `http://localhost:8080`.

### 3. Start the Frontend

```bash
cd frontend
cp .env.example .env.local
# Set: VITE_API_URL=http://localhost:8080

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. The JWT token from `/api/auth/login` must be passed as `Authorization: Bearer <token>` on protected routes.

### Auth

```bash
# Register
POST /api/auth/register
{ "email": "user@example.com", "password": "secret", "firstName": "John", "lastName": "Doe" }

# Login — returns JWT
POST /api/auth/login
{ "email": "user@example.com", "password": "secret" }
```

### Workouts

```bash
POST   /api/workouts          # Create workout
GET    /api/workouts          # List all workouts
PUT    /api/workouts/{id}     # Update workout
DELETE /api/workouts/{id}     # Delete workout
```

### Nutrition

```bash
POST   /api/nutrition         # Log a meal
GET    /api/nutrition         # List all meals
DELETE /api/nutrition/{id}    # Delete meal
```

### Analytics

```bash
GET /api/analytics/summary    # Aggregated daily stats (workouts + nutrition)
```

### AI Coaching

```bash
# Conversational AI
POST /api/ai/chat
{ "message": "My legs are sore. What should I do?" }

# Context-aware coaching
POST /api/ai/coach
{ "prompt": "What should I train next?", "recentWorkoutCount": 5, "lastWorkoutType": "STRENGTH" }
```

### User Profile

```bash
GET  /api/users/profile       # Get profile
PUT  /api/users/profile       # Update profile (weight, height, goals)
```

---

## ☁️ Deployment

### Frontend → Vercel

The frontend is deployed on **Vercel** with SPA rewrite rules (`vercel.json`) to handle client-side routing.

```bash
cd frontend
npm run build         # Outputs to dist/
# Push to GitHub → Vercel auto-deploys
```

Environment variable to set in Vercel dashboard:
```
VITE_API_URL=<your-railway-backend-url>
```

### Backend → Railway

The backend Docker image is built from `backend/monolith-service/Dockerfile` and deployed on **Railway** via `railway.toml`.

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "monolith-service/Dockerfile"

[deploy]
startCommand = "java -Dspring.profiles.active=postgresql -jar app.jar"
healthcheckPath = "/actuator/health"
```

Environment variables to set in Railway:
```
DATABASE_URL=<neon-postgres-url>
GROQ_API_KEY=<your-groq-key>
JWT_SECRET=<random-secret>
FRONTEND_URL=https://fitness-tracker-full-stack-applicat.vercel.app
```

### Alternative — Kubernetes (Self-Hosted)

```bash
kubectl apply -f backend/k8s/namespace.yml
kubectl apply -f backend/k8s/config/
kubectl apply -f backend/k8s/services/
kubectl apply -f backend/k8s/ingress.yml

kubectl get pods -n fitness-tracker
```

---

## 🧪 Running Tests

```bash
cd backend

# Unit + Integration tests
mvn test -pl monolith-service

# All modules
mvn test
```

---

## 💡 Design Decisions

### Monolith over Microservices
The original design used 5 separate Spring Boot microservices + an API gateway. For Railway's single-service deployment model and portfolio simplicity, they were consolidated into a single **well-structured monolith** with clean package-level domain separation. The architecture can be split back out into microservices at any time.

### Groq API over OpenAI
- **14,400 free requests/day** — sufficient for a portfolio project
- Ultra-low latency via custom LPU inference hardware
- OpenAI-compatible API format — swap-in ready

### Caffeine Cache over Redis
- For a single-node deployment, in-memory Caffeine cache is simpler and faster than a remote Redis instance
- Eliminates a runtime dependency for the Railway free tier

### JWT + Stateless Auth
- Tokens are stateless — no server-side session storage needed
- Spring Security filter validates on every request before routing to controllers

### Vite + React SPA
- Fast HMR in development, optimised production bundle
- `vercel.json` rewrite rule (`/* → /index.html`) ensures React Router handles all navigation client-side

---

## 🖥️ Screenshots

| Dashboard | FitCoach AI | Workout Log |
|-----------|------------|-------------|
| Animated progress rings, stats cards, and charts | Full markdown AI responses with context | Log exercises by type with duration |

---

## 📄 License

MIT — free to use for personal and portfolio projects.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/spidyraj">Divyanshu</a>
</div>
