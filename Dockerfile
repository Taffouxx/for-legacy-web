# === Stage 1: Сборка (Build) ===
FROM node:18-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_URL

ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_APP_URL=$VITE_APP_URL \
    GENERATE_SOURCEMAP=false

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# === Stage 2: Запуск (Production) ===
FROM caddy:2-alpine

COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
