# =============================================================================
# Stage 1: Builder
# =============================================================================
FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS builder

# Build-time arguments injected by docker buildx
ARG TARGETOS
ARG TARGETARCH

WORKDIR /build

# Install git (needed by some Go modules) and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

# Cache Go module downloads as a separate layer
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy the rest of the source
COPY . .

# Cross-compile a statically linked binary for the target platform
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build \
    -ldflags="-s -w" \
    -trimpath \
    -o /build/server \
    ./cmd/server

# =============================================================================
# Stage 2: Final minimal image
# =============================================================================
FROM scratch

# Copy timezone data and CA certs from the builder so HTTPS + time zones work
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the statically-linked binary
COPY --from=builder /build/server /server

# Expose the default port (override via PORT env var at runtime)
EXPOSE 8080

# Run as a non-root user for security (scratch has no adduser, so use numeric UID)
USER 65534:65534

# In a container HOST must be 0.0.0.0 so the port is reachable from outside.
# Pass all real secrets / connection strings via --env-file or -e flags at runtime.
ENV HOST=0.0.0.0 \
    PORT=8080

ENTRYPOINT ["/server"]
