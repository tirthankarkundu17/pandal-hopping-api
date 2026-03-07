# 🎪 Pandal Hopping App

A full-stack **Durga Puja Pandal Hopping** ecosystem — featuring a premium **React Native (Expo)** mobile application and a high-performance **Go RESTful API**. This platform helps festival-goers discover, submit, and navigate pandals with AI-powered routes and real-time community approvals.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Run Locally (Go)](#run-locally-go)
  - [Run with Docker](#run-with-docker)
- [API Reference](#-api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [Pandal Endpoints](#pandal-endpoints)
  - [Route & Food Endpoints](#-route--food-endpoints)
- [Data Models](#-data-models)
- [CI/CD & Docker](#-cicd--docker)
- [Frontend (React Native)](#-frontend-react-native)
  - [Tech Stack](#frontend-tech-stack)
  - [Directory Structure](#frontend-directory-structure)
  - [Screens](#screens)
  - [Running the App](#running-the-app)
- [Contributing](#-contributing)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, and refresh tokens with access + refresh token flow
- 🏛️ **Pandal Management** — Submit, list, filter, and approve pandals
- ✅ **Approval Workflow** — Multi-approver system with deduplication (configurable required count)
- 🗺️ **Curated Routes** — AI-powered and manually curated pandal hopping routes
- 🍱 **Food Discovery** — Find the best street food and restaurants near pandals
- 🌍 **Geo-validation** — Administrative boundary validation for pandal submissions
- 🐳 **Multi-arch Docker Image** — Supports `linux/amd64`, `linux/arm64`, and `linux/arm/v7`
- 🚀 **GitHub Actions CI/CD** — Automated multi-arch builds and publishing to Docker Hub
- ⚡ **Graceful Shutdown** — OS signal handling with a 5-second shutdown grace period
- 🔄 **Auto Migrations** — DB indexes created automatically on startup

---

## 🛠️ Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Language    | Go 1.25                                       |
| Framework   | [Gin](https://github.com/gin-gonic/gin) v1.11 |
| Database    | MongoDB (via official Go driver v1.17)        |
| Auth        | JWT (`golang-jwt/jwt` v5) + bcrypt            |
| CORS        | `gin-contrib/cors`                            |
| Config      | `godotenv` for `.env` file loading            |
| Container   | Docker (multi-stage, `scratch` final image)   |
| CI/CD       | GitHub Actions + Makefile + Docker Buildx     |

---

## 📁 Project Structure

```
pandal-hopping-app/
├── .github/workflows/
│   └── docker-publish.yml         # GitHub Actions CI/CD pipeline
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go            # Entry point — wires up DB, DI, router, graceful shutdown
│   ├── internal/
│   │   ├── config/                # MongoDB connection & collection helpers
│   │   ├── handlers/              # Auth, Pandal, Route, Food, Location handlers
│   │   ├── middleware/            # JWT Bearer token validation middleware
│   │   ├── migrations/            # Startup index creation (2dsphere, area)
│   │   ├── models/                # Pandal, User, Route, FoodStop structs
│   │   ├── repository/            # MongoDB data access layer
│   │   ├── routes/                # Gin route definitions
│   │   ├── services/              # Business logic layer
│   │   └── validation/            # Administrative geographic data validation
│   ├── .env.example               # Template for required environment variables
│   ├── Dockerfile                 # Multi-stage build → scratch final image
│   └── go.mod / go.sum
├── frontend/                      # React Native application
├── Makefile                       # Docker build, push, run, lint, test targets
└── docker-compose.yml             # Local development orchestration
```

---

## 🚀 Getting Started

### Prerequisites

- **Go** 1.25+
- **MongoDB** instance (local or Atlas)
- **Docker** (optional, for container workflow)
- **Docker Buildx** (for multi-arch builds)

### Environment Variables

#### Backend
Copy `.env.example` to `.env` inside the `backend` directory:

| Variable           | Default                        | Description                                          |
|--------------------|--------------------------------|------------------------------------------------------|
| `HOST`             | `localhost`                    | Server bind address (`0.0.0.0` inside Docker)        |
| `PORT`             | `8080`                         | Server listen port                                   |
| `MONGO_URI`        | `mongodb://localhost:27017`    | MongoDB connection string                            |
| `DB_NAME`          | `db`                           | MongoDB database name                                |
| `REQUIRED_APPROVALS` | `3`                          | Number of unique approvals needed to approve a pandal |
| `JWT_SECRET`       | —                              | Secret key for signing access tokens (**required**)  |
| `JWT_REFRESH_SECRET` | —                            | Secret key for signing refresh tokens (**required**) |

#### Frontend
Create a `.env` file in the `frontend` directory:

| Variable                | Default                             | Description                        |
|-------------------------|-------------------------------------|------------------------------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Backend API base URL               |

---

## 📡 API Reference

All API routes are prefixed with `/api/v1`.

### Auth Endpoints

| Method | Endpoint             | Auth Required | Description                      |
|--------|----------------------|:-------------:|----------------------------------|
| `POST` | `/api/v1/auth/register` | ❌         | Register a new user              |
| `POST` | `/api/v1/auth/login`    | ❌         | Login and receive JWT tokens     |
| `POST` | `/api/v1/auth/refresh`  | ❌         | Refresh the access token         |

### Pandal Endpoints (Auth Protected)

| Method | Endpoint                         | Description                                         |
|--------|----------------------------------|-----------------------------------------------------|
| `POST` | `/api/v1/pandals/`               | Submit a new pandal (starts as `pending`)           |
| `GET`  | `/api/v1/pandals/`               | List all approved pandals                           |
| `GET`  | `/api/v1/pandals/pending`        | List all pandals awaiting approval                  |
| `PUT`  | `/api/v1/pandals/:id/approve`    | Approve a pandal (counted towards required total)   |

### Route & Food Endpoints

| Method | Endpoint                    | Description                                  |
|--------|-----------------------------|----------------------------------------------|
| `GET`  | `/api/v1/routes/`           | List all curated pandal hopping routes       |
| `GET`  | `/api/v1/food/`             | List all curated food stops near pandals     |
| `GET`  | `/api/v1/location/districts`| List all districts with pandal counts        |
| `GET`  | `/health`                   | API health check                             |

---

## 📦 Data Models

Detailed models for `Pandal`, `User`, `Route`, and `FoodStop` are available in the [backend/internal/models](backend/internal/models) directory. MongoDB `2dsphere` indexing is used for all location-based queries.

---

## 🐳 CI/CD & Docker

We use a multi-stage `Dockerfile` targeting a `scratch` base image for production, resulting in an extremely small and secure footprint (< 30MB).

### GitHub Actions
The project includes a robust CI/CD pipeline in `.github/workflows/docker-publish.yml`:
- **Auto-build**: Triggers on push to `master` or when a PR is labelled `build`.
- **Multi-arch**: Compiles for `amd64`, `arm64`, and `arm/v7` using `setup-qemu-action`.
- **Automation**: Uses the `Makefile` internally to ensure local and remote build consistency.

### Local Docker workflow
The `Makefile` simplifies complex Docker commands:

| Target            | Description                                               |
|-------------------|-----------------------------------------------------------|
| `make build`      | Build & push multi-arch image to Docker Hub               |
| `make build-local`| Build image for the current host platform only            |
| `make run`        | Run the backend server locally using `go run`             |
| `make test`       | Run the Go test suite with race detector                  |
| `make lint`       | Run `golangci-lint`                                       |

---

## 📱 Frontend (React Native)

A full-featured React Native (Expo) frontend with a premium, festival-themed dark UI.

### Frontend Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) + TypeScript |
| Navigation | React Navigation v7 (Bottom Tabs + Native Stack) |
| HTTP Client | Axios with JWT interceptor + auto-refresh |
| Auth Storage | `expo-secure-store` |
| UI | `expo-linear-gradient`, `@expo/vector-icons`, Custom Theme |

### Screens & Navigation

| Screen | Description |
|---|---|
| **🏠 Home** | Explore Pandal Highlights, Curated Routes, and Food Stops |
| **🗺️ Map** | Interactive map view of pandals near your location |
| **🚩 Routes** | Detailed step-by-step pandal hopping journeys |
| **🍕 Food** | Discover the best Puja food categories and hotspots |
| **➕ Create** | Submit new pandals with location validation |
| **⏳ Pending** | Review and approve community-submitted pandals |
| **👤 Profile** | Manage account settings and sign out |

### Running the App

```bash
cd frontend
npm install
npm start
```

> **Pro Tip:** Use the **Expo Go** app on your physical device to experience the haptics and smooth animations correctly.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`feat/amazing-feature`)
3. Open a Pull Request

---

> Built with ❤️ for the Durga Puja season 🪔
