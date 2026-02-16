# === Stage 1: Сборка (Build) ===
FROM node:18-alpine AS builder
WORKDIR /app

# Принимаем аргументы (ссылки) из GitHub Actions
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_URL

# Превращаем их в переменные среды для сборщика Vite
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_APP_URL=$VITE_APP_URL \
    GENERATE_SOURCEMAP=false

# Включаем Corepack для Yarn
RUN corepack enable

# СНАЧАЛА копируем ВСЁ (включая submodules)
COPY . .

# ТЕПЕРЬ ставим зависимости (теперь yarn найдет external/components)
RUN yarn install --frozen-lockfile

# Собираем проект
RUN yarn build

# === Stage 2: Запуск (Production) ===
FROM caddy:2-alpine

# Копируем собранный сайт
COPY --from=builder /app/dist /usr/share/caddy

# Открываем порты
EXPOSE 80 443

# Запускаем Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
