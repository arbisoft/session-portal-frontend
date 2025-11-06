# Stage 1: Build the Next.js app
FROM node:22.14.0-alpine AS builder

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_GTM_ID

ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_CLIENT_ID=${NEXT_PUBLIC_CLIENT_ID}

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app source code
COPY . .

# Build the app with standalone output
RUN npm run build

# Stage 2: Create a lightweight production image
FROM node:22.14.0-alpine AS runner

ARG UID=1001
ARG GID=1001

# Create non-root user
RUN addgroup -g $GID app && adduser -u $UID -G app -D -s /bin/false app

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4200 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Copy standalone app and required files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# # Fix ownership
RUN chown -R app:app /app

# # Use non-root user
USER app

# Default port for Next.js
EXPOSE 4200

# Start the app
CMD ["server.js"]
