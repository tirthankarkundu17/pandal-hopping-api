# 🎪 Pandal Hopping API

A RESTful backend API for a **Durga Puja Pandal Hopping** application — helping festival-goers discover, submit, and explore pandals during Durga Puja. Built with **Go**, **Gin**, and **MongoDB**, containerised with **Docker** and shipped as a multi-architecture image to Docker Hub.

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
- [Data Models](#-data-models)
- [Docker & Makefile](#-docker--makefile)
- [Contributing](#-contributing)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, and refresh tokens with access + refresh token flow
- 🏛️ **Pandal Management** — Submit, list, filter, and approve pandals
- ✅ **Approval Workflow** — Multi-approver system (configurable required approval count) with deduplication
- 📍 **Geo-indexed Locations** — MongoDB `2dsphere` index on pandal locations for spatial queries
- 🐳 **Multi-arch Docker Image** — Supports `linux/amd64`, `linux/arm64`, and `linux/arm/v7`
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
| Config      | `godotenv` for `.env` file loading            |
| Container   | Docker (multi-stage, `scratch` final image)   |
| CI/CD       | Makefile + Docker Buildx                      |

---

## 📁 Project Structure

```
pandal-hopping-api/
├── cmd/
│   └── server/
│       └── main.go            # Entry point — wires up DB, DI, router, graceful shutdown
├── internal/
│   ├── config/
│   │   └── db.go              # MongoDB connection & collection helpers
│   ├── handlers/
│   │   ├── auth_handler.go    # Register, Login, Refresh handlers
│   │   └── pandal_handler.go  # Create, List, Approve pandal handlers
│   ├── middleware/
│   │   └── auth_middleware.go # JWT Bearer token validation middleware
│   ├── migrations/
│   │   └── migration.go       # Startup index creation (2dsphere, area)
│   ├── models/
│   │   ├── pandal.go          # Pandal & Location structs + status constants
│   │   └── user.go            # User, Auth request/response structs
│   ├── repository/
│   │   ├── pandal_repository.go
│   │   └── user_repository.go
│   ├── routes/
│   │   ├── auth_route.go      # /api/v1/auth routes
│   │   └── pandal_route.go    # /api/v1/pandals routes (auth-protected)
│   └── services/
│       ├── auth_service.go    # Auth business logic
│       └── pandal_service.go  # Pandal business logic
├── .env.example               # Template for required environment variables
├── Dockerfile                 # Multi-stage build → scratch final image
├── Makefile                   # Docker build, push, run, lint, test targets
└── go.mod / go.sum
```

---

## 🚀 Getting Started

### Prerequisites

- **Go** 1.25+
- **MongoDB** instance (local or Atlas)
- **Docker** (optional, for container workflow)
- **Docker Buildx** (for multi-arch builds)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable           | Default                        | Description                                          |
|--------------------|--------------------------------|------------------------------------------------------|
| `HOST`             | `localhost`                    | Server bind address (`0.0.0.0` inside Docker)        |
| `PORT`             | `8080`                         | Server listen port                                   |
| `MONGO_URI`        | `mongodb://localhost:27017`    | MongoDB connection string                            |
| `DB_NAME`          | `db`                           | MongoDB database name                                |
| `REQUIRED_APPROVALS` | `3`                          | Number of unique approvals needed to approve a pandal |
| `JWT_SECRET`       | —                              | Secret key for signing access tokens (**required**)  |
| `JWT_REFRESH_SECRET` | —                            | Secret key for signing refresh tokens (**required**) |

### Run Locally (Go)

```bash
# Install dependencies
go mod download

# Start the server (reads .env automatically)
go run ./cmd/server
```

The server will start on `http://localhost:8080`.

### Run with Docker

```bash
# Build the image for your local platform
make build-local

# Run the container (reads .env for secrets)
make run

# Tail container logs
make logs

# Stop and remove the container
make stop
```

---

## 📡 API Reference

All API routes are prefixed with `/api/v1`.

### Auth Endpoints

| Method | Endpoint             | Auth Required | Description                      |
|--------|----------------------|:-------------:|----------------------------------|
| `POST` | `/api/v1/auth/register` | ❌         | Register a new user              |
| `POST` | `/api/v1/auth/login`    | ❌         | Login and receive JWT tokens     |
| `POST` | `/api/v1/auth/refresh`  | ❌         | Refresh the access token         |

#### `POST /api/v1/auth/register`
```json
// Request
{
  "name": "Tirthankar",
  "email": "user@example.com",
  "password": "secret123"      // min 6 characters
}
```

#### `POST /api/v1/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "secret123" }

// Response
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "expires_in": 3600
}
```

#### `POST /api/v1/auth/refresh`
```json
// Request
{ "refresh_token": "<jwt>" }
```

---

### Pandal Endpoints

All pandal routes require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

| Method | Endpoint                         | Description                                         |
|--------|----------------------------------|-----------------------------------------------------|
| `POST` | `/api/v1/pandals/`               | Submit a new pandal (starts as `pending`)           |
| `GET`  | `/api/v1/pandals/`               | List all approved pandals                           |
| `GET`  | `/api/v1/pandals/pending`        | List all pandals awaiting approval                  |
| `PUT`  | `/api/v1/pandals/:id/approve`    | Approve a pandal (counted towards required total)   |

#### `POST /api/v1/pandals/` — Create Pandal
```json
{
  "name": "Kumartuli Park",
  "area": "Shyambazar",
  "description": "One of the oldest pandals in North Kolkata",
  "theme": "Mahishasura Mardini",
  "location": {
    "type": "Point",
    "coordinates": [88.3697, 22.5797]   // [longitude, latitude]
  },
  "images": ["https://example.com/image1.jpg"]
}
```

#### Approval Workflow

A pandal is automatically promoted to `approved` status once its `approvalCount` reaches the `REQUIRED_APPROVALS` threshold. Each user can approve a given pandal only once (enforced via the `approvedBy` list).

---

## 📦 Data Models

### Pandal

| Field           | Type       | Description                                  |
|-----------------|------------|----------------------------------------------|
| `id`            | ObjectID   | MongoDB document ID                          |
| `name`          | string     | Name of the pandal                           |
| `description`   | string     | Short description                            |
| `area`          | string     | Neighbourhood / locality                     |
| `theme`         | string     | Artistic theme for the year                  |
| `location`      | GeoJSON    | `{ type: "Point", coordinates: [lng, lat] }` |
| `images`        | []string   | Array of image URLs                          |
| `ratingAvg`     | float64    | Average user rating                          |
| `ratingCount`   | int        | Total number of ratings                      |
| `status`        | string     | `pending` \| `approved` \| `rejected`        |
| `approvalCount` | int        | Number of approvals received so far          |
| `approvedBy`    | []string   | User IDs who have approved this pandal       |
| `createdAt`     | timestamp  | Document creation time                       |

### User

| Field       | Type      | Description              |
|-------------|-----------|--------------------------|
| `id`        | ObjectID  | MongoDB document ID      |
| `name`      | string    | Display name             |
| `email`     | string    | Unique email address     |
| `createdAt` | timestamp | Account creation time    |
| `updatedAt` | timestamp | Last update time         |

---

## 🐳 Docker & Makefile

The `Makefile` wraps all common Docker operations. Run `make help` to see the full list.

| Target            | Description                                               |
|-------------------|-----------------------------------------------------------|
| `make help`       | List all available targets                                |
| `make setup-buildx` | One-time: create a multi-arch buildx builder            |
| `make build`      | Build & push multi-arch image (`amd64`, `arm64`, `arm/v7`) to Docker Hub |
| `make build-local`| Build image for the current host platform only (no push)  |
| `make push`       | Push an already-built image to Docker Hub                 |
| `make run`        | Run the container locally on `HOST_PORT` (default: 8080)  |
| `make stop`       | Stop and remove the local container                       |
| `make logs`       | Tail live container logs                                  |
| `make clean`      | Stop container and remove local images                    |
| `make lint`       | Run `golangci-lint`                                       |
| `make test`       | Run the Go test suite with race detector                  |

### Overridable Variables

```bash
make build VERSION=1.2.3
make build DOCKER_USER=myuser IMAGE_NAME=my-api
make run   HOST_PORT=9090
```

### Docker Image

The final image is built from `scratch` (zero-OS base) for a minimal attack surface. It includes only:
- The statically-linked Go binary
- CA certificates (for HTTPS calls)
- Timezone data

**Docker Hub:** `docker.io/tirthankark/pandal-hopping-api`

```bash
docker pull tirthankark/pandal-hopping-api:latest
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

> Built with ❤️ for Durga Puja season 🪔
