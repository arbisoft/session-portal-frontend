# Stage 1: Install dependencies
FROM node:22.14.0-alpine AS deps

WORKDIR /app

# Copy only dependency files (better caching)
COPY package.json package-lock.json ./

RUN npm ci --prefer-offline --no-audit --progress=false

# Stage 2: Build the Next.js app
FROM node:22.14.0-alpine AS builder

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_GTM_ID

ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_CLIENT_ID=${NEXT_PUBLIC_CLIENT_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}

WORKDIR /app

# Reuse cached node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

RUN npm run build

# Stage 3: Lightweight runtime image
FROM node:22.14.0-alpine AS runner

ARG UID=1001
ARG GID=1001

RUN addgroup -g $GID app && adduser -u $UID -G app -D -s /bin/false app

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4200 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R app:app /app
USER app

EXPOSE 4200

CMD ["node", "server.js"]
