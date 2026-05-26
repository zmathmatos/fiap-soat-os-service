# FIAP SOAT Tech Challenge — App

API REST para gerenciamento de ordens de serviço em oficinas mecânicas.

## Visão Geral

Backend da plataforma FIAP SOAT Tech Challenge, responsável por expor os endpoints de negócio consumidos pelo frontend e pelo API Gateway.

- **Stack**: TypeScript 5.9 + Express 5.2 + Sequelize 6.37 + PostgreSQL 14/15
- **Arquitetura**: Clean Architecture com 4 camadas (`domain`, `application`, `infrastructure`, `interface`)
- **Deploy**: Docker → Amazon ECR → Amazon EKS (Kubernetes)

## Arquitetura — 4 Repositórios

| Repositório | Responsabilidade | Deploy |
|---|---|---|
| [`fiap-soat-tech-challenge-infra-k8s`](https://github.com/zmathmatos/fiap-soat-tech-challenge-infra-k8s) | VPC + EKS + Namespace + Observability (New Relic) | Terraform |
| [`fiap-soat-tech-challenge-infra-db`](https://github.com/zmathmatos/fiap-soat-tech-challenge-infra-db) | RDS PostgreSQL | Terraform |
| [`fiap-soat-tech-challenge-lambda`](https://github.com/zmathmatos/fiap-soat-tech-challenge-lambda) | API Gateway HTTP v2 + Lambda Authorizer (auth via CPF) | Terraform |
| [`fiap-soat-tech-challenge-app`](https://github.com/zmathmatos/fiap-soat-tech-challenge-app) | **← Este repo** — Backend Express | Docker + kubectl |

**Ordem de deploy obrigatória**: `infra-k8s` → `infra-db` → `app` → `lambda`

## Pré-requisitos

- **Node.js 22+**
- **Docker + Docker Compose** (recomendado para desenvolvimento local)
- **PostgreSQL 14+** (via Docker Compose — veja abaixo)

## Desenvolvimento Local

### 1. Configurar variáveis de ambiente

```bash
cp .env.sample .env
# Edite .env se necessário (defaults já funcionam com docker compose)
```

### 2. Subir com Docker Compose (recomendado)

```bash
# Sobe PostgreSQL + app com hot-reload
docker compose up -d

# Apenas o banco (para rodar app local)
docker compose up -d db
```

A API ficará disponível em `http://localhost:3000`.

### 3. Rodar sem Docker (opcional)

```bash
npm install
npm run dev      # hot-reload via nodemon
npm run build    # compila TypeScript → dist/
npm start        # roda a build compilada
```

## Testes

```bash
# Todos os testes
npm test

# Apenas unitários (não requer banco)
npm run test:unit

# Apenas integração (requer PostgreSQL rodando)
npm run test:integration

# Com relatório de cobertura
npm run test:coverage
```

### Credenciais de Teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@techchallenge.com` | `admin123` |
| Customer | `joao.silva@email.com` | `senha123` |

## Variáveis de Ambiente

| Variável | Default | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `fiap_soat` | Nome do database |
| `DB_USER` | `postgres` | Usuário do PostgreSQL |
| `DB_PASSWORD` | `postgres` | Senha do PostgreSQL |
| `DB_SSL` | `false` | TLS na conexão (`true` em RDS/produção, `false` local) |
| `JWT_SECRET` | — | Segredo HMAC para tokens JWT (obrigatório) |
| `JWT_EXPIRES_IN` | `24h` | TTL do token (`24h`, `7d`, `3600s`) |
| `APP_PORT` | `3000` | Porta HTTP do servidor |
| `NODE_ENV` | `development` | `development` / `production` / `test` |

## Endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth` | Público | Login com e-mail + senha (retorna JWT) |
| `GET` | `/health` | Público | Health check da aplicação |
| `GET` | `/admin/users` | Admin | Lista usuários |
| `POST` | `/admin/users` | Admin | Cria usuário |
| `PUT` | `/admin/users/:id` | Admin | Atualiza usuário |
| `DELETE` | `/admin/users/:id` | Admin | Remove usuário |
| `GET` | `/admin/vehicles` | Admin | Lista veículos |
| `POST` | `/admin/vehicles` | Admin | Cadastra veículo |
| `PUT` | `/admin/vehicles/:id` | Admin | Atualiza veículo |
| `DELETE` | `/admin/vehicles/:id` | Admin | Remove veículo |
| `GET` | `/admin/parts` | Admin | Lista peças |
| `POST` | `/admin/parts` | Admin | Cadastra peça |
| `PUT` | `/admin/parts/:id` | Admin | Atualiza peça |
| `DELETE` | `/admin/parts/:id` | Admin | Remove peça |
| `GET` | `/admin/services` | Admin | Lista serviços |
| `POST` | `/admin/services` | Admin | Cadastra serviço |
| `PUT` | `/admin/services/:id` | Admin | Atualiza serviço |
| `DELETE` | `/admin/services/:id` | Admin | Remove serviço |
| `GET` | `/admin/service-orders` | Admin | Lista ordens de serviço |
| `POST` | `/admin/service-orders` | Admin | Cria ordem de serviço |
| `PUT` | `/admin/service-orders/:id` | Admin | Atualiza ordem |
| `DELETE` | `/admin/service-orders/:id` | Admin | Remove ordem |
| `GET` | `/customer/service-orders` | Customer | Ordens do cliente autenticado |

> **Nota**: A autenticação é feita via header `x-document` para todas as rotas `/customer/*` via (CPF) no API Gateway. Todos os outros endpoints continuam disponíveeis para uso direto sem autenticação, mas via API Gateway.

## CI/CD

### CI — `.github/workflows/ci.yml`

**Trigger**: push e pull_request em `master` e `develop`.

| Job | O que faz |
|---|---|
| `lint-and-test` | Instala dependências e roda `npm test` com PostgreSQL 15 de serviço |
| `sonarqube` | Gera cobertura (`npm run test:coverage`) e envia para SonarCloud — roda em push **e** PRs |
| `build` | Compila TypeScript (`npm run build`) e faz upload do artifact `dist/` |

**Secrets necessários**:

| Secret | Descrição |
|---|---|
| `SONAR_TOKEN` | Token de autenticação do SonarCloud |

### CD — `.github/workflows/cd.yml`

**Trigger**: `workflow_dispatch` (manual via GitHub Actions).

**Fluxo**:
1. Checkout do código
2. Configura credenciais AWS
3. Login no Amazon ECR
4. `docker build` + `docker push` com tags `<sha7>` e `latest`
5. `aws eks update-kubeconfig` para o cluster EKS
6. Cria namespace se não existir
7. Aplica `ConfigMap` com: `DB_HOST`, `DB_PORT`, `DB_NAME`, `APP_PORT=3000`, `NODE_ENV=production`, `JWT_EXPIRES_IN`, `DB_SSL=true`
8. Aplica `Secret` com: `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`
9. Deleta Job de migration anterior (Jobs Kubernetes são imutáveis)
10. Aplica todos os manifests `k8s/*.yaml` via `envsubst` (substitui `${IMAGE_URI}` e `${GITHUB_SHA}`)
11. Aguarda conclusão do Job migrate (timeout 300s)
12. Aguarda rollout do Deployment (timeout 300s)

**Secrets necessários**:

| Secret | Descrição |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access Key ID do AWS Academy (sessão temporária) |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key do AWS Academy |
| `AWS_SESSION_TOKEN` | Session Token obrigatório no AWS Academy (credenciais temporárias) |
| `AWS_REGION` | Região AWS (ex.: `us-east-1`) |
| `ECR_REPOSITORY` | Nome do repositório ECR (ex.: `fiap-soat-tech-challenge-app`) |
| `EKS_CLUSTER_NAME` | Nome do cluster EKS (ex.: `fiap-soat-dev-eks`) |
| `DB_HOST` | Endpoint do RDS (output do repo `infra-db`) |
| `DB_PORT` | Porta do RDS (ex.: `5432`) |
| `DB_NAME` | Nome do banco de dados |
| `DB_USER` | Usuário master do RDS (vai para o K8s Secret) |
| `DB_PASSWORD` | Senha master do RDS (vai para o K8s Secret) |
| `JWT_SECRET` | Segredo HMAC para assinar tokens JWT (vai para o K8s Secret) |
| `SONAR_TOKEN` | Token do SonarCloud (usado apenas no CI) |

**Variáveis (GitHub Variables)**:

| Variável | Default | Descrição |
|---|---|---|
| `K8S_NAMESPACE` | `fiap-tech-challenge` | Namespace Kubernetes onde a aplicação é deployada |
| `JWT_EXPIRES_IN` | `24h` | TTL do token JWT injetado no ConfigMap |

## Manifests Kubernetes (`k8s/`)

| Arquivo | Tipo | Descrição |
|---|---|---|
| `01-migrate-job.yaml` | `Job` | Roda `sequelize-cli db:migrate && db:seed:all` antes do app subir. `backoffLimit: 3`, `ttlSecondsAfterFinished: 600`. |
| `02-deployment.yaml` | `Deployment` | 2 réplicas, RollingUpdate (`maxSurge: 1`, `maxUnavailable: 0`). Probes readiness/liveness em `/health`. Resources: requests (150m CPU, 256Mi mem), limits (750m, 768Mi). Security: `runAsNonRoot`, `runAsUser: 1000`, drop ALL capabilities. |
| `03-service.yaml` | `Service` | Tipo `LoadBalancer` com annotation NLB AWS (`nlb`, `internet-facing`, target-type `ip`). Porta 80 → container 3000. |
| `04-hpa.yaml` | `HorizontalPodAutoscaler` | Escala 2–6 réplicas com targets CPU 70% e memória 80%. Janela de scale-down 120s, scale-up 30s. |

ConfigMap (`fiap-soat-tech-challenge-app-config`) e Secret (`fiap-soat-tech-challenge-app-secret`) são criados no pipeline a partir dos GitHub Secrets — **nunca commitados**.

## Como Deployar na AWS

### Via GitHub Actions (recomendado)

Vá em **Actions → CD - Build, Push to ECR and Deploy to EKS → Run workflow**.

## Como Verificar o Deploy

```bash
# Ver todos os recursos no namespace
kubectl get all -n fiap-tech-challenge

# Logs da aplicação (últimas 50 linhas)
kubectl logs -l app=fiap-soat-tech-challenge-app -n fiap-tech-challenge --tail=50

# DNS do NLB (coluna EXTERNAL-IP)
kubectl get svc -n fiap-tech-challenge

# Health check via NLB
curl http://<NLB-DNS>/health
```

## Como Destruir (Poupar Créditos)

```bash
# Remover todos os recursos K8s deste app
kubectl delete -f k8s/ -n fiap-tech-challenge --ignore-not-found

# Remover imagens ECR (evita custo de storage)
aws ecr batch-delete-image \
  --repository-name fiap-soat-tech-challenge-app \
  --image-ids "$(aws ecr list-images \
    --repository-name fiap-soat-tech-challenge-app \
    --query 'imageIds[*]' --output json)" \
  --region us-east-1
```

> **Importante**: os recursos K8s deste app têm custo baixo isoladamente (consumo de nós EKS). Os itens caros são EKS control plane (~$2,40/dia), RDS e API Gateway — destrua via os READMEs dos repos `infra-k8s` e `infra-db` quando não estiver usando.

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| `self-signed certificate in certificate chain` | RDS exige SSL e `DB_SSL=false` | Setar `DB_SSL=true` no ConfigMap/env |
| Job migrate trava ou falha | Credenciais erradas ou DB inacessível | `kubectl logs job/fiap-soat-tech-challenge-app-migrate -n fiap-tech-challenge` |
| Pod `CrashLoopBackOff` | Env var obrigatória ausente | `kubectl describe pod <nome> -n fiap-tech-challenge` + verificar Secret/ConfigMap |
| HPA mostra `<unknown>/70%` | `metrics-server` não instalado no cluster | Instalar via `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml` |
| `ImagePullBackOff` | ECR login expirado ou IAM sem permissão | Verificar role do node group e credenciais AWS |
| Testes de integração falham localmente | PostgreSQL não está rodando | `docker compose up -d db` e aguardar `service_healthy` |
