# AI Fitness Tracker 🏋️‍♂️

> A production-grade microservices backend for an AI-powered fitness tracking application.
> Built as a full-stack portfolio project demonstrating Spring Boot, Spring Cloud Gateway, Groq AI integration, Docker, Kubernetes, and a complete CI/CD pipeline.

[![CI/CD Pipeline](https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application/actions/workflows/ci.yml/badge.svg)](https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application/actions)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client Layer                       │
│                React / Android / iOS                      │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────┐
│              Spring Cloud Gateway  :8080                  │
│     JWT Auth Filter  •  Rate Limiting (Redis)             │
│     CORS  •  Global Error Handling  •  Routing            │
└──┬──────────┬──────────┬──────────┬────────────┬─────────┘
   │          │          │          │            │
┌──▼──┐  ┌───▼──┐  ┌────▼──┐  ┌───▼───┐  ┌────▼───┐
│User │  │Work- │  │Nutri- │  │Analy- │  │  AI    │
│:8081│  │out   │  │tion   │  │tics   │  │Service │
│     │  │:8082 │  │:8083  │  │:8084  │  │:8085   │
└──┬──┘  └───┬──┘  └────┬──┘  └───┬───┘  └────┬───┘
   │          │          │          │            │
┌──▼──────────▼──────────▼─────────┘       ┌────▼───┐
│         PostgreSQL (Neon.tech)            │MongoDB │
│         Redis (Upstash)                  │Atlas   │
└──────────────────────────────────────────└────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Gateway | Spring Cloud Gateway | Auth, routing, rate limiting |
| Services | Spring Boot 3.x + Java 21 | Core business logic |
| AI Layer | Groq API (Llama 3) | Coaching, recommendations |
| Primary DB | PostgreSQL (Neon.tech) | Users, workouts, nutrition |
| Cache | Redis (Upstash) | Rate limiting, AI response cache |
| Document DB | MongoDB Atlas | AI interaction logs |
| CI/CD | GitHub Actions | Build, test, push Docker images |
| Containers | Docker + Kubernetes | Packaging and orchestration |

---

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| `gateway` | 8080 | API Gateway — single entry point |
| `user-service` | 8081 | Registration, login, JWT auth |
| `workout-service` | 8082 | Exercise logging and CRUD |
| `nutrition-service` | 8083 | Meal tracking and macro calculation |
| `analytics-service` | 8084 | Aggregated daily summaries |
| `ai-service` | 8085 | Groq AI coaching and recommendations |

---

## Quick Start (Local Development)

### Prerequisites
- Java 21+
- Maven 3.9+
- Docker Desktop

### 1. Clone and configure environment

```bash
git clone https://github.com/spidyraj/Fitness-Tracker-Full-Stack-Application.git
cd Fitness-Tracker-Full-Stack-Application
cp .env.example .env
# Edit .env with your Neon, Upstash, MongoDB Atlas, and Groq API keys
```

### 2. Start infrastructure (PostgreSQL + Redis + MongoDB)

```bash
docker compose up postgres redis mongodb -d
```

### 3. Start services (in separate terminals)

```bash
# Terminal 1 — User Service (required first for auth)
mvn spring-boot:run -pl user-service

# Terminal 2 — Workout Service
mvn spring-boot:run -pl workout-service

# Terminal 3 — Nutrition Service
mvn spring-boot:run -pl nutrition-service

# Terminal 4 — Analytics Service
mvn spring-boot:run -pl analytics-service

# Terminal 5 — AI Service
mvn spring-boot:run -pl ai-service

# Terminal 6 — API Gateway (start last)
mvn spring-boot:run -pl gateway
```

### 4. Or start everything with Docker Compose

```bash
docker compose up --build
```

---

## API Reference

### Authentication

```bash
# Register
POST http://localhost:8080/api/auth/register
{"email":"user@example.com","password":"secret","firstName":"John","lastName":"Doe"}

# Login — returns JWT token
POST http://localhost:8080/api/auth/login
{"email":"user@example.com","password":"secret"}
```

### Workouts (JWT required)

```bash
# Create workout
POST http://localhost:8080/api/workouts
Authorization: Bearer <token>
{"title":"Morning Cardio","type":"CARDIO","durationMinutes":30}

# Get all workouts
GET http://localhost:8080/api/workouts
Authorization: Bearer <token>
```

### AI Coaching

```bash
# Basic coaching advice
POST http://localhost:8080/api/ai/chat
Authorization: Bearer <token>
{"prompt":"My legs are sore after leg day. What should I do?"}

# Contextual coaching (with workout history)
POST http://localhost:8080/api/ai/coach
Authorization: Bearer <token>
{
  "prompt": "What should I train next?",
  "recentWorkoutCount": 5,
  "avgWorkoutMinutes": 45,
  "lastWorkoutType": "STRENGTH"
}
```

### Analytics

```bash
# Daily summary (aggregates workouts + nutrition)
GET http://localhost:8080/api/analytics/summary
Authorization: Bearer <token>
```

---

## Running Tests

```bash
# Unit tests only (fast — no Docker needed)
mvn test -pl workout-service

# Integration tests (requires Docker for Testcontainers)
mvn verify -pl workout-service

# All tests across all modules
mvn test
```

### Test Coverage

| Test Type | Tool | Location |
|-----------|------|----------|
| Unit tests | JUnit 5 + Mockito | `workout-service/src/test/.../service/` |
| Repository tests | @DataJpaTest + H2 | `workout-service/src/test/.../repository/` |
| Integration tests | Testcontainers + PostgreSQL | `workout-service/src/test/.../controller/` |
| AI mock tests | WireMock | `ai-service/src/test/.../service/` |

---

## Kubernetes Deployment

```bash
# Create namespace + apply all manifests
./k8s/deploy.sh

# Or manually
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/config/secrets-and-configmap.yml
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yml

# Check status
kubectl get pods -n fitness-tracker
kubectl get hpa -n fitness-tracker
```

> ⚠️ **Before deploying:** Update `k8s/config/secrets-and-configmap.yml` with real values, or use:
> ```bash
> kubectl create secret generic fitness-secrets --from-env-file=.env -n fitness-tracker
> ```

---

## Key Design Decisions

### Why three databases?
- **PostgreSQL** — Structured relational data (users, workouts, nutrition). ACID compliance, joins.
- **Redis** — Sub-millisecond TTL-based storage. Rate limit counters, AI response cache.
- **MongoDB** — Variable-structure AI interaction logs. High write volume, no fixed schema.

### Why Groq over OpenAI?
- Generous free tier (14,400 req/day), extremely low latency via custom LPU hardware, identical API format.

### Why Testcontainers over H2?
- H2 doesn't reproduce PostgreSQL-specific behaviour (constraints, dialect, index). Testcontainers runs the real engine.

### JWT token lifecycle
- Tokens are stateless (no server-side storage). Logout invalidates via Redis blacklist.
- The gateway validates on every request before routing.

---

## Project Structure

```
fitness-tracker/
├── .github/workflows/ci.yml     # GitHub Actions CI/CD pipeline
├── gateway/                     # Spring Cloud Gateway
├── user-service/                # Auth and user management
├── workout-service/             # Exercise logging
│   └── src/test/                # Unit + Integration + Repository tests
├── nutrition-service/           # Meal tracking
├── analytics-service/           # Aggregation and summaries
├── ai-service/                  # Groq AI integration
│   └── src/test/                # WireMock tests
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yml
│   ├── ingress.yml
│   ├── config/                  # Secrets + ConfigMap
│   └── services/                # Deployment + Service + HPA per microservice
├── docker-compose.yml           # Local development stack
├── .env.example                 # Environment variable template
└── pom.xml                      # Maven multi-module parent
```
