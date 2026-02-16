# === Stage 1: Сборка (Build) ===
FROM node:18-alpine AS builder
WORKDIR /app

# ВАЖНО: Включаем Corepack для использования Yarn 3
RUN corepack enable

# Принимаем аргументы (ссылки) из GitHub Actions
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_URL

# Превращаем их в переменные среды для сборщика Vite
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_APP_URL=$VITE_APP_URL \
    GENERATE_SOURCEMAP=false

# Копируем конфиги пакетов
COPY package.json yarn.lock ./

# Ставим зависимости (теперь будет использоваться Yarn 3.2.0)
RUN yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем проект
RUN yarn build

# === Stage 2: Запуск (Production) ===
FROM caddy:2-alpine

# Копируем собранный сайт
COPY --from=builder /app/dist /usr/share/caddy

#
