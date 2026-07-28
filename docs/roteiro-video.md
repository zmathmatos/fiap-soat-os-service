# Roteiro do vídeo — Tech Challenge (saga coreografada)

Fluxo completo da OS entre os três microsserviços, com o que executar e o que mostrar na tela em cada passo.

---

## 0. Preparação (antes de gravar)

### 0.1 Ambiente de pé

```bash
aws eks update-kubeconfig --name fiap-soat-dev-eks --region us-east-1
kubectl get pods -n fiap-soat
```

Esperado: `os-service` (2), `execution-service` (2), `billing-service` (2), `rabbitmq-0`, `mongodb-0`, `mailhog` — todos `Running`; job `os-service-migrate` `Completed`.

### 0.2 Endereços

| Serviço | Acesso | Como obter |
|---|---|---|
| os-service | LoadBalancer público | `kubectl get svc -n fiap-soat os-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'` |
| billing-service | LoadBalancer público | `kubectl get svc -n fiap-soat billing-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'` |
| execution-service | ClusterIP — **precisa de port-forward** | `kubectl port-forward -n fiap-soat svc/execution-service 3002:80` |
| MailHog (UI) | ClusterIP — **precisa de port-forward** | `kubectl port-forward -n fiap-soat svc/mailhog 8025:8025` |
| RabbitMQ (UI) | ClusterIP — **precisa de port-forward** | `kubectl port-forward -n fiap-soat svc/rabbitmq 15672:15672` |

Os dois `port-forward` (execution e mailhog) são obrigatórios para o fluxo. Deixe cada um em um terminal separado antes de começar.

> As URLs dos LoadBalancers **mudam a cada `terraform apply`**. Se o cluster foi recriado, atualize a variável `MP_NOTIFICATION_URL` do repo billing (`gh variable set MP_NOTIFICATION_URL -R zmathmatos/fiap-soat-billing-service -b "http://<lb-do-billing>"`) e redeploy o billing — senão o webhook do Mercado Pago cai no endereço antigo e o passo 10 nunca acontece.

### 0.3 Variáveis do Postman

| Variável | Valor |
|---|---|
| `osUrl` | `http://<lb-do-os-service>` |
| `execUrl` | `http://localhost:3002` (port-forward) |
| `billingUrl` | `http://<lb-do-billing>` |
| `token` | preenchido no passo 1 |
| `serviceOrderId` | preenchido no passo 3 |
| `partId` / `serviceId` | preenchidos no passo 2 |
| `quotationId` | preenchido no passo 8b |

---

## Passos

### 1. [OS] Login

`POST {{osUrl}}/auth/login`

```json
{ "email": "admin@techchallenge.com", "password": "admin123" }
```

**Mostrar:** `200` e o token. Salvar em `{{token}}`.
Todas as chamadas `/admin/**` usam `Authorization: Bearer {{token}}`.

---

### 2. [OS] Catálogo — peça e serviço reais

`GET {{osUrl}}/admin/parts` e `GET {{osUrl}}/admin/services`

**Mostrar:** a lista do seed e os `id` escolhidos.
**Salvar:** um `id` de peça em `{{partId}}` e um de serviço em `{{serviceId}}`.

> **Passo obrigatório.** O diagnóstico do passo 7 usa esses ids. Ids inventados são descartados pelo os-service (com log `service-order.unknown-catalog-ids`), o orçamento sai **R$ 0,00** e o pagamento do passo 9 não fecha.

Se quiser mostrar o cliente e o veículo do seed: `GET /admin/users` e `GET /admin/vehicles`.

---

### 3. [OS] Criar OS

`POST {{osUrl}}/admin/service-orders`

```json
{ "document": "52998224725", "licensePlate": "ABC-1234" }
```

**Mostrar:** `201`, o `id` e `"status": "Recebido"`.
**Salvar:** `id` em `{{serviceOrderId}}`.

**Narrar:** a criação publica `order.received` no exchange `service-order-events` via outbox transacional; nenhum serviço chama o outro por HTTP.

---

### 4. [OS] Status inicial

`GET {{osUrl}}/admin/service-orders/{{serviceOrderId}}`

**Mostrar:** `"status": "Recebido"`.

---

### 5. [EXEC] Fila de diagnóstico

`GET {{execUrl}}/api/queues/diagnosis`

**Mostrar:** a OS na fila, com `serviceOrderId` igual ao do passo 3 — prova que o evento cruzou o RabbitMQ. A fila é FIFO: só a cabeça avança.

---

### 6. [EXEC] Registrar diagnóstico

`PATCH {{execUrl}}/api/executions/{{serviceOrderId}}/diagnosis`

```json
{
  "parts": [
    { "id": "{{partId}}", "name": "Pastilha de freio", "quantity": 2, "price": 150 }
  ],
  "services": [
    { "id": "{{serviceId}}", "name": "Troca de pastilhas", "price": 300 }
  ]
}
```

**Mostrar:** `200` e `"status": "AWAITING_PAYMENT"` no execution-service.
**Narrar:** publica `diagnostic.finished` no exchange `execution-events`, também via outbox.

Erros possíveis: `409` se a OS não for a cabeça da fila; `404` se o `serviceOrderId` estiver errado.

---

### 7. [OS] Status → Aguardando aprovação

`GET {{osUrl}}/admin/service-orders/{{serviceOrderId}}`

**Mostrar:** `"status": "Aguardando aprovação"` (leva ~1s; se aparecer `Recebido`, repita a chamada). Mostrar também `parts` e `services` preenchidos com o diagnóstico.

**Narrar:** o os-service consumiu `diagnostic.finished`, registrou o diagnóstico e mudou o status — que por sua vez enfileira `quotation.requested` no outbox.

---

### 8. [MAILHOG] Orçamento gerado

MailHog em `http://localhost:8025`.

**Mostrar:** e-mail **"Orçamento gerado — FIAP SOAT"** com o valor (soma dos preços de catálogo das peças × quantidade + serviços).
**Salvar:** o `quotationId` do link de aprovação em `{{quotationId}}`.

---

### 9. [BILLING] Aprovar orçamento

`GET {{billingUrl}}/quotations/{{quotationId}}/approve`

**Mostrar:** resposta com `"status"` da quotation aprovado e o valor.
**Narrar:** o billing cria a preferência no Mercado Pago e dispara um segundo e-mail, **"Orçamento aprovado — efetue o pagamento"**, com o link de checkout.

(Para recusar, o caminho é `GET /quotations/{{quotationId}}/reject`, que leva a OS direto a `Finalizado` — compensação da saga.)

---

### 10. [MP] Pagar no checkout

Abrir o link do segundo e-mail no MailHog e concluir o pagamento no checkout sandbox do Mercado Pago.

**Mostrar:** a tela de pagamento aprovado.
**Narrar:** o MP chama `POST /webhooks/mercadopago` no billing, que confirma o pagamento e publica `payment.approved` no exchange `payment-events`.

---

### 11. [OS] Status → Em execução

`GET {{osUrl}}/admin/service-orders/{{serviceOrderId}}`

**Mostrar:** `"status": "Em execução"`.

---

### 12. [EXEC] Fila de execução e reparo

1. `GET {{execUrl}}/api/queues/execution` — mostrar a OS na fila
2. `PATCH {{execUrl}}/api/executions/{{serviceOrderId}}/start` — `IN_PROGRESS`
3. `PATCH {{execUrl}}/api/executions/{{serviceOrderId}}/finish` — publica `execution.finished`

---

### 13. [OS] Status final

`GET {{osUrl}}/admin/service-orders/{{serviceOrderId}}`

**Mostrar:** `"status": "Finalizado"`, com `startedServiceAt` e `endedServiceAt` preenchidos.

Fechamento opcional: `GET {{osUrl}}/admin/service-orders/analytics/average-time` (tempo médio de atendimento).

---

## Extras para mostrar na gravação

| O que | Onde |
|---|---|
| Exchanges e filas da saga | RabbitMQ UI (`localhost:15672`, usuário `fiap`) — `service-order-events`, `execution-events`, `payment-events`, `quotation-events` |
| Eventos de negócio | `kubectl logs -n fiap-soat -l app=os-service --tail=50` — procurar `order.processed` com `order.previous_status` e `time_in_previous_status_ms` |
| Observabilidade | Dashboard New Relic do projeto; apps `fiap-soat-os-service`, `fiap-execution-service`, `fiap-billing-service` |
| Pipelines | Actions dos 4 repos: CI (lint, testes, Sonar) e CD (build → ECR → EKS) verdes |
| Qualidade | SonarCloud dos três serviços |

---

## Resumo da coreografia (para narrar)

| Evento | Publica | Consome | Efeito |
|---|---|---|---|
| `order.received` | os-service | execution-service | entra na fila de diagnóstico |
| `diagnostic.finished` | execution-service | os-service | OS → `Aguardando aprovação` |
| `quotation.requested` | os-service | billing-service | cria orçamento e envia e-mail |
| `payment.approved` | billing-service | os-service, execution-service | OS → `Em execução`, entra na fila de execução |
| `payment.failed` / `quotation.rejected` | billing-service | os-service, execution-service | OS → `Finalizado` (compensação) |
| `execution.finished` | execution-service | os-service | OS → `Finalizado` |

Não há orquestrador central: cada serviço publica o evento do passo que executou.

---

## Se algo travar durante o teste

| Sintoma | Causa provável | Verificação |
|---|---|---|
| Status não sai de `Recebido` | evento não consumido | `kubectl logs -n fiap-soat -l app=os-service \| grep rabbitmq.consumer.error` |
| Orçamento R$ 0,00 | ids do passo 2 não usados no passo 6 | `grep service-order.unknown-catalog-ids` nos logs do os-service |
| Não chega e-mail | port-forward do MailHog caiu, ou billing sem `quotation.requested` | `kubectl logs -n fiap-soat -l app=billing-service --tail=50` |
| Pago no MP mas status não muda | `MP_NOTIFICATION_URL` apontando para LB antigo | comparar `kubectl get cm -n fiap-soat billing-service-config -o jsonpath='{.data.MP_NOTIFICATION_URL}'` com o LB atual do billing |
| `password authentication failed` nos pods | senhas do Postgres são geradas a cada `terraform apply` | sincronizar `DB_*` dos repos com o output `postgres_service_credentials` do state e `kubectl rollout restart` |
