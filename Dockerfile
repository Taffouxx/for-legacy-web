# === Stage 1: Сборка (Build) ===
FROM node:18-alpine AS builder

WORKDIR /app

# Принимаем аргументы из GitHub Actions
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_URL

# КРИТИЧЕСКИ ВАЖНО: делаем их ENV ДО копирования файлов
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_APP_URL=$VITE_APP_URL \
    GENERATE_SOURCEMAP=false

# Включаем Corepack для Yarn
RUN corepack enable

# Копируем package.json и lockfile
COPY package.json yarn.lock .yarnrc.yml ./

# Копируем .yarn папку если есть
COPY .yarn ./.yarn

# Копируем submodules (важно для portal: зависимостей)
COPY external ./external

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Теперь копируем остальной код
COPY . .

# Проверяем что переменные на месте (для дебага)
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# Собираем проект
RUN yarn build

# === Stage 2: Production ===
FROM caddy:2-alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
