# =============================================================================
# Pandal Hopping API — Makefile
# =============================================================================
# Usage:
#   make help          — List all available targets
#   make build         — Build multi-arch image and push to Docker Hub
#   make build-local   — Build for the current host platform only (no push)
#   make push          — Push already-built tags to Docker Hub
#   make run           — Run the container locally
#   make stop          — Stop and remove the local container
#   make logs          — Tail logs of the running container
#   make clean         — Remove the local container and image
#   make setup-buildx  — One-time: create a multi-arch buildx builder
# =============================================================================

# ─── Configuration ────────────────────────────────────────────────────────────

# Docker Hub user and image name.
# Override on the command line:  make build DOCKER_USER=myuser
DOCKER_USER   ?= your-dockerhub-username
IMAGE_NAME    ?= pandal-hopping-api
REGISTRY      ?= docker.io

# Full image reference (without tag)
IMAGE         := $(REGISTRY)/$(DOCKER_USER)/$(IMAGE_NAME)

# Tag strategy:
#   VERSION  — set explicitly, e.g.  make build VERSION=1.2.3
#   GIT_TAG  — latest annotated git tag (fallback: "dev")
#   COMMIT   — short git commit SHA
GIT_TAG       := $(shell git describe --tags --abbrev=0 2>/dev/null || echo "dev")
COMMIT        := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION       ?= $(GIT_TAG)

# Supported platforms for multi-arch build
PLATFORMS     ?= linux/amd64,linux/arm64,linux/arm/v7

# Buildx builder name
BUILDER       ?= pandal-multiarch-builder

# Local container name (for `make run`)
CONTAINER     ?= pandal-api

# Port published on the host when running locally
HOST_PORT     ?= 8080

# Path to a local .env file used when running the container
ENV_FILE      ?= backend/.env

# ─── Phony targets ────────────────────────────────────────────────────────────

.PHONY: help setup-buildx build build-local push run stop logs clean \
        tag-latest tag-version lint test

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Buildx setup (run once) ──────────────────────────────────────────────────

setup-buildx: ## Create the multi-arch buildx builder (run once)
	@echo "==> Setting up buildx builder: $(BUILDER)"
	docker buildx create --name $(BUILDER) --driver docker-container --bootstrap --use || \
		docker buildx use $(BUILDER)
	docker buildx inspect --bootstrap

# ─── Build ────────────────────────────────────────────────────────────────────

build: setup-buildx ## Build multi-arch image and push to Docker Hub
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
	@echo "==> Successfully pushed $(IMAGE):$(VERSION) and $(IMAGE):latest"

build-local: ## Build image for the current host platform only (no push)
	@echo "==> Building $(IMAGE):$(VERSION) for local platform"
	docker build \
		--tag $(IMAGE):$(VERSION) \
		--tag $(IMAGE):latest \
		--label "org.opencontainers.image.title=$(IMAGE_NAME)" \
		--label "org.opencontainers.image.version=$(VERSION)" \
		--label "org.opencontainers.image.revision=$(COMMIT)" \
		backend
	@echo "==> Image $(IMAGE):$(VERSION) is ready locally"

# ─── Push ─────────────────────────────────────────────────────────────────────

push: ## Push existing local tags to Docker Hub
	@echo "==> Pushing $(IMAGE):$(VERSION)"
	docker push $(IMAGE):$(VERSION)
	@echo "==> Pushing $(IMAGE):latest"
	docker push $(IMAGE):latest

# ─── Run locally ──────────────────────────────────────────────────────────────

run: ## Run the backend server locally
	@echo "==> Starting local backend server"
	cd backend && go run ./cmd/server

stop: ## Stop and remove the local container
	@echo "==> Stopping and removing container '$(CONTAINER)'"
	-docker stop $(CONTAINER)
	-docker rm   $(CONTAINER)

logs: ## Tail logs of the running container
	docker logs -f $(CONTAINER)

# ─── Tag helpers ──────────────────────────────────────────────────────────────

tag-latest: ## Re-tag the current VERSION as latest and push
	docker tag $(IMAGE):$(VERSION) $(IMAGE):latest
	docker push $(IMAGE):latest

tag-version: ## Tag current local image with VERSION and push
	docker tag $(IMAGE):latest $(IMAGE):$(VERSION)
	docker push $(IMAGE):$(VERSION)

# ─── Dev helpers ──────────────────────────────────────────────────────────────

lint: ## Run golangci-lint (must be installed)
	cd backend && golangci-lint run ./...

test: ## Run the Go test suite
	cd backend && go test -v -race ./...

# ─── Cleanup ──────────────────────────────────────────────────────────────────

clean: stop ## Remove the local container and image
	@echo "==> Removing image $(IMAGE):latest"
	-docker rmi $(IMAGE):latest
	-docker rmi $(IMAGE):$(VERSION)
	@echo "==> Done"
