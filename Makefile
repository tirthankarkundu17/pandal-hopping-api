# =============================================================================
# Pandal Hopping App — Full-Stack Makefile
# =============================================================================
# Standard targets for both Backend (Go) and Frontend (React Native/Expo).
# =============================================================================

# ─── Configuration ────────────────────────────────────────────────────────────

# Docker Hub user and image name.
DOCKER_USER   ?= your-dockerhub-username
IMAGE_NAME    ?= pandal-hopping-api
REGISTRY      ?= docker.io
IMAGE         := $(REGISTRY)/$(DOCKER_USER)/$(IMAGE_NAME)

GIT_TAG       := $(shell git describe --tags --abbrev=0 2>/dev/null || echo "dev")
COMMIT        := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION       ?= $(GIT_TAG)

PLATFORMS     ?= linux/amd64,linux/arm64,linux/arm/v7
BUILDER       ?= pandal-multiarch-builder
CONTAINER     ?= pandal-api
HOST_PORT     ?= 8080
ENV_FILE      ?= backend/.env

# ─── Phony targets ────────────────────────────────────────────────────────────

.PHONY: help install install-fe install-be \
        run-be run-fe android ios web \
        build build-local push stop logs clean lint test

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Installation ─────────────────────────────────────────────────────────────

install: install-be install-fe ## Install both Backend and Frontend dependencies

install-be: ## Install Backend (Go) dependencies
	@echo "==> Installing Backend dependencies"
	cd backend && go mod download

install-fe: ## Install Frontend (npm) dependencies
	@echo "==> Installing Frontend dependencies"
	cd frontend && npm install

# ─── Execution ────────────────────────────────────────────────────────────────

run-be: ## Run the backend server locally (Go)
	@echo "==> Starting backend server"
	cd backend && go run ./cmd/server

run-fe: ## Start Expo development server (Frontend)
	@echo "==> Starting Expo dev server"
	cd frontend && npm start

android: ## Run frontend on Android emulator
	cd frontend && npm run android

ios: ## Run frontend on iOS simulator (macOS only)
	cd frontend && npm run ios

web: ## Run frontend in the browser
	cd frontend && npm run web

# ─── Docker & Multi-Arch Build (Backend) ──────────────────────────────────────

setup-buildx: ## Create the multi-arch buildx builder (run once)
	@echo "==> Setting up buildx builder: $(BUILDER)"
	docker buildx create --name $(BUILDER) --driver docker-container --bootstrap --use || \
		docker buildx use $(BUILDER)

build: setup-buildx ## Build multi-arch backend image and push to Docker Hub
	@echo "==> Building $(IMAGE):$(VERSION) for platforms: $(PLATFORMS)"
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag $(IMAGE):$(VERSION) \
		--tag $(IMAGE):latest \
		--label "org.opencontainers.image.title=$(IMAGE_NAME)" \
		--label "org.opencontainers.image.version=$(VERSION)" \
		--label "org.opencontainers.image.revision=$(COMMIT)" \
		--label "org.opencontainers.image.source=https://github.com/$(DOCKER_USER)/$(IMAGE_NAME)" \
		--push \
		backend

build-local: ## Build backend image for the current host platform only
	@echo "==> Building $(IMAGE):$(VERSION) for local platform"
	docker build \
		--tag $(IMAGE):$(VERSION) \
		--tag $(IMAGE):latest \
		--label "org.opencontainers.image.title=$(IMAGE_NAME)" \
		--label "org.opencontainers.image.version=$(VERSION)" \
		--label "org.opencontainers.image.revision=$(COMMIT)" \
		backend

stop: ## Stop and remove the local container
	-docker stop $(CONTAINER)
	-docker rm   $(CONTAINER)

logs: ## Tail logs of the running container
	docker logs -f $(CONTAINER)

# ─── Lint & Test ──────────────────────────────────────────────────────────────

lint: ## Run linters (Go)
	cd backend && golangci-lint run ./...

test: ## Run backend tests
	cd backend && go test -v -race ./...

# ─── Cleanup ──────────────────────────────────────────────────────────────────

clean: stop ## Remove the local container and images
	@echo "==> Cleaning up artifacts"
	-docker rmi $(IMAGE):latest 2>/dev/null
	-docker rmi $(IMAGE):$(VERSION) 2>/dev/null
