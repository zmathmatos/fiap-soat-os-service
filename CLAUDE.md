# CLAUDE.md

## Purpose

This is a Node.js micro-service for a mechanical-shop work-order (OS) system, developed as part of the FIAP SOAT Tech Challenge. It is responsible **exclusively** for the CRUD operations of the following domain entities:

- **Service Orders** — work orders tied to a customer's vehicle
- **Users** — customers and admin accounts
- **Vehicles** — vehicles owned by customers
- **Parts** — spare parts used in service orders
- **Services** — labour/service items used in service orders

This service does **not** own business logic that belongs to other micro-services (e.g. payments, quotations). Keep all additions scoped to the domains above.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (Alpine) |
| Language | TypeScript 5 |
| HTTP Framework | Express.js v5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 14 |
| Authentication | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Logging | Pino (structured JSON) + Morgan (HTTP) |
| Messaging | RabbitMQ (`amqplib`) — consumes `payment.approved`/`payment.failed` from `fiap-soat-billing-service` |
| APM | New Relic (preloaded via `node -r newrelic`) |
| Build | `esbuild-node-tsc` (targets ES2016) |
| Containerisation | Docker (multi-stage, non-root `app` user) |
| Orchestration | Kubernetes on AWS EKS (HPA: 2–6 replicas) |
| CI/CD | GitHub Actions → ECR → EKS |

---

## Architecture

The codebase follows **Clean Architecture** with four layers:

```
src/
├── domain/           # Entities and repository interfaces
├── application/      # Use cases and application services
├── infrastructure/   # Sequelize models, migrations, DB config, Express app/routers, RabbitMQ consumer
└── interface/        # HTTP controllers, middleware, presenters
```

Dependencies always point inward: `infrastructure` → `application` → `domain`. Never import outward across that boundary.

---

## Async Messaging

This service reacts to billing events **exclusively via RabbitMQ** — there is no synchronous REST push from `fiap-soat-billing-service` for payment outcomes anymore. `RabbitMQPaymentEventConsumer` (`src/infrastructure/messaging/`) binds a durable queue to the `payment-events` topic exchange (routing keys `payment.approved`, `payment.failed`) and calls `ServiceOrderController.applyBillingEvent(serviceOrderId, event)` — the same status-mapping logic used by the `POST /service-orders/:id/events` REST endpoint, which is now only used for `quotation.rejected`. The consumer starts in the background in `server.ts` and retries the connection on failure without blocking the HTTP server; permanent failures (unknown service order, unknown event, malformed payload) are logged and dropped instead of being requeued forever.

---

## Running Locally

```bash
# Start all services (PostgreSQL + app)
docker compose up

# Development mode with hot-reload
docker compose -f docker-compose.dev.yml up
```

Environment variables are documented in the README; copy `.env.example` and fill in the values.

---

## Testing Requirements

**Every change must be covered by tests. No exceptions.**

- **Unit tests** are required for all use cases, domain logic, and utilities.
- **Integration tests** are required for any code that touches the database, HTTP layer, or external services.
- Tests live under `tests/` and mirror the `src/` folder structure.
- Unit test files use the `.spec.ts` suffix; integration tests use `.integration.test.ts`.

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Full coverage report
npm run test:coverage
```

Coverage is collected from `src/**` and reported via Jest. New code should maintain or improve existing coverage — do not merge changes that reduce it.

---

## Commit & PR Guidelines

- Follow **Conventional Commits**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`.
- Include a scope when useful: `feat(service-order): ...`, `fix(vehicle): ...`.
- PRs that touch the HTTP layer should include or update the Postman collection under `docs/`.

---

## Key Commands

```bash
npm run build          # Compile TypeScript
npm run dev            # Start with nodemon
npm run lint           # ESLint
npm run migrate        # Run Sequelize migrations
npm run seed           # Run Sequelize seeders
```
