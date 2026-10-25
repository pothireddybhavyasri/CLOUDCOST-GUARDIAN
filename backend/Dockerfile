# Build stage - Go 1.23
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the API binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/api ./cmd/api

# Build the migrator binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/migrator ./cmd/migrator

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy both binaries from builder
COPY --from=builder /app/api /app/api
COPY --from=builder /app/migrator /app/migrator

EXPOSE 8080

CMD ["/app/api"]
