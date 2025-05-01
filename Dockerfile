FROM node:22.14.0-alpine

ARG UID=1001
ARG GID=1001

# These arguments should explicitly be set by the container image builder job
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_ID

ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_CLIENT_ID=${NEXT_PUBLIC_CLIENT_ID}

RUN \
    addgroup -g $GID app \
    && adduser -u $UID -G app -D -s /bin/false app

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN \
    npm run build \
    && chown -R app:app /app

USER app
