FROM golang:1.26.1-bookworm AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/backend ./cmd

FROM debian:bookworm-slim

ARG APP_PORT=8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /out/backend /app/backend

EXPOSE ${APP_PORT}

ENTRYPOINT ["/app/backend"]
