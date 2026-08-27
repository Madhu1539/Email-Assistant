# ─────────────────────────────────────────────────────────────────────────────
# Intelligent Email Assistant — Server Dockerfile
#
# Multi-stage build:
#   Stage 1 (deps)   — installs production dependencies only
#   Stage 2 (runner) — minimal runtime image, non-root user
#
# Build:  docker build -t email-assistant-server .
# Run:    docker run -p 5000:5000 --env-file .env email-assistant-server
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install production dependencies ──────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only manifests first — maximises Docker layer cache hits
COPY package.json package-lock.json ./

RUN npm ci --omit=dev && \
    # Clean npm cache to reduce image size
    npm cache clean --force


# ── Stage 2: Minimal runtime image ───────────────────────────────────────────
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="Intelligent Email Assistant"
LABEL org.opencontainers.image.description="AI-powered Gmail management API"

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 appuser

WORKDIR /app

# Copy production deps from deps stage
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:nodejs app.js      ./app.js
COPY --chown=appuser:nodejs server.js   ./server.js
COPY --chown=appuser:nodejs src/        ./src/

# Do NOT copy .env — secrets are injected at runtime via Cloud Run environment

USER appuser

# Cloud Run sends traffic to PORT env var (default 8080 in Cloud Run, 5000 locally)
ENV PORT=5000
EXPOSE 5000

# Health check — Cloud Run also has its own liveness probe via /api/health
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
