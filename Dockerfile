# Stage 1: Build the Next.js app
FROM node:22.14.0-alpine AS builder

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_GTM_ID

ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_CLIENT_ID=${NEXT_PUBLIC_CLIENT_ID}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production image with only the built app
FROM node:22.14.0-alpine AS runner

ARG UID=1001
ARG GID=1001

RUN addgroup -g $GID app && adduser -u $UID -G app -D -s /bin/false app

WORKDIR /app

# Only copy necessary output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

RUN chown -R app:app /app
USER app
