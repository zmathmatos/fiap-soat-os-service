# FIAP SOAT Tech Challenge - App

API REST para gerenciamento de ordens de serviço em oficinas mecânicas.
Implementada com Node.js, Express, TypeScript, PostgreSQL e Sequelize.

Este repositório faz parte de uma arquitetura com 4 repositórios separados:

| Repositório | Conteúdo |
|---|---|
| **[fiap-soat-tech-challenge-app](https://github.com/zmathmatos/fiap-soat-tech-challenge-app)** | ← Este repo — Código da aplicação |
| [fiap-soat-tech-challenge-lambda](https://github.com/zmathmatos/fiap-soat-tech-challenge-lambda) | Lambda de autenticação via CPF (API Gateway + AWS Lambda) |
| [fiap-soat-tech-challenge-infra-k8s](https://github.com/zmathmatos/fiap-soat-tech-challenge-infra-k8s) | Infraestrutura Kubernetes (VPC, EKS) via Terraform |
| [fiap-soat-tech-challenge-infra-db](https://github.com/zmathmatos/fiap-soat-tech-challenge-infra-db) | Infraestrutura do banco de dados (RDS PostgreSQL) via Terraform |

## Desenvolvimento local

### Pré-requisitos

- Docker e Docker Compose

### Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | Host do PostgreSQL | `localhost` ou `postgres-service` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco | `fiap_soat` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |
| `APP_PORT` | Porta da aplicação | `3000` |
| `JWT_SECRET` | Chave secreta JWT | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Expiração do token | `24h` |

### Subir a aplicação

```bash
docker-compose up
```

A API estará disponível em `http://localhost:3000`.

### Rodar os testes

```bash
# Subir banco de dados
docker-compose up -d db

# Rodar todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Com cobertura
npm run test:coverage
```

### Credenciais de teste

- **Admin**: `admin@techchallenge.com` / `admin123`
- **Customer**: `joao.silva@email.com` / `senha123`

## CI/CD

O pipeline de CI (`.github/workflows/ci.yml`) executa:

1. **lint-and-test**: Testes automatizados com PostgreSQL
2. **sonarqube**: Análise de qualidade com SonarCloud
3. **build**: Build da aplicação TypeScript
4. **docker-build-and-push**: Build e push da imagem Docker para DockerHub

O deploy em Kubernetes é gerenciado pelo repositório [fiap-soat-tech-challenge-infra-k8s](https://github.com/zmathmatos/fiap-soat-tech-challenge-infra-k8s).

### GitHub Secrets necessários

| Secret | Descrição |
|---|---|
| `DOCKERHUB_USERNAME` | Usuário do DockerHub |
| `DOCKERHUB_TOKEN` | Token de acesso do DockerHub |
| `SONAR_TOKEN` | Token do SonarCloud |

## Arquitetura

O projeto segue Clean Architecture com 4 camadas:

```
src/
├── domain/          # Entidades e interfaces de repositório
├── application/     # Use cases e serviços de aplicação
├── infrastructure/  # Banco de dados (Sequelize), web (Express), repositórios
└── interface/       # Controllers, middleware, presenters
```

### Endpoints

| Método | Path | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth` | Autenticação | — |
| `GET` | `/health` | Health check | — |
| `GET/POST/PUT/DELETE` | `/admin/users` | CRUD usuários | Admin |
| `GET/POST/PUT/DELETE` | `/admin/vehicles` | CRUD veículos | Admin |
| `GET/POST/PUT/DELETE` | `/admin/parts` | CRUD peças | Admin |
| `GET/POST/PUT/DELETE` | `/admin/services` | CRUD serviços | Admin |
| `GET/POST/PUT/DELETE` | `/admin/service-orders` | CRUD ordens de serviço | Admin |
| `GET` | `/customer/service-orders` | Ordens do cliente | Customer |
