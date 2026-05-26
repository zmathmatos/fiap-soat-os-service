# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV APP_PORT=3000

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps    --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist          ./dist
COPY --chown=app:app package*.json ./
COPY --chown=app:app src/infrastructure/database/sequelize/migrations ./src/infrastructure/database/sequelize/migrations
COPY --chown=app:app src/infrastructure/database/sequelize/seeders    ./src/infrastructure/database/sequelize/seeders
COPY --chown=app:app .sequelizerc ./

# Ensure /app is writable by app user (newrelic agent log file)
RUN chown app:app /app

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "-r", "newrelic", "dist/server.js"]
