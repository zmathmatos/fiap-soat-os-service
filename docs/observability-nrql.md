# Observabilidade — NRQL queries

Consultas NRQL para o dashboard e políticas de alerta exigidos pelo Tech Challenge Fase 3.
As métricas e eventos custom são emitidos pelo agente Node.js da aplicação (ver
`src/infrastructure/observability/newrelic.ts` e hooks em `ServiceOrderModel.ts`).

Provisionar via Terraform (`newrelic_one_dashboard`, `newrelic_nrql_alert_condition`)
no repositório `fiap-soat-tech-challenge-infra-k8s`.

---

## Dashboard

### 1. Volume diário de ordens de serviço

```sql
SELECT count(*)
FROM ServiceOrderEvent
WHERE event = 'order.created'
TIMESERIES 1 day
SINCE 30 days ago
```

Alternativa via métrica:

```sql
SELECT sum(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/ServiceOrder/Created'
TIMESERIES 1 day
SINCE 30 days ago
```

### 2. Tempo médio de execução por status (Diagnóstico / Execução / Finalização)

Cada transição emite `timeInPreviousStatusMs` (tempo gasto no status anterior antes da mudança).
Faceted por `previousStatus` para medir tempo médio que uma OS ficou em cada status.

```sql
SELECT average(timeInPreviousStatusMs) / 1000 AS 'duração média (s)'
FROM ServiceOrderEvent
WHERE event = 'order.processed' AND timeInPreviousStatusMs IS NOT NULL
FACET previousStatus
SINCE 7 days ago
```

Alternativa via métrica custom:

```sql
SELECT average(newrelic.timeslice.value) / 1000 AS 'segundos'
FROM Metric
WHERE metricTimesliceName LIKE 'Custom/ServiceOrder/TimeInStatus/%'
FACET metricTimesliceName
SINCE 7 days ago
```

### 3. Latência das APIs (p50/p95/p99)

```sql
SELECT percentile(duration, 50, 95, 99) * 1000 AS 'latência (ms)'
FROM Transaction
WHERE appName = 'fiap-web-prod'
TIMESERIES AUTO
SINCE 1 hour ago
```

### 4. Throughput por endpoint

```sql
SELECT rate(count(*), 1 minute) AS 'rpm'
FROM Transaction
WHERE appName = 'fiap-web-prod'
FACET request.uri
SINCE 1 hour ago
LIMIT 20
```

### 5. Taxa de erros HTTP

```sql
SELECT percentage(count(*), WHERE error IS true) AS 'erro %'
FROM Transaction
WHERE appName = 'fiap-web-prod'
TIMESERIES AUTO
SINCE 1 hour ago
```

### 6. Falhas no processamento de ordens

```sql
SELECT count(*)
FROM Log
WHERE event = 'order.failed'
TIMESERIES 1 hour
SINCE 24 hours ago
```

### 7. Healthcheck / uptime

```sql
SELECT percentage(count(*), WHERE result = 'SUCCESS') AS 'uptime %'
FROM SyntheticCheck
WHERE monitorName = 'fiap-web-health'
SINCE 24 hours ago
```

### 8. Recursos do Kubernetes (CPU / memória)

```sql
SELECT average(cpuUsedCores), average(memoryWorkingSetBytes) / 1024 / 1024 AS 'mem (MiB)'
FROM K8sContainerSample
WHERE containerName = 'app' AND deploymentName = 'fiap-soat-tech-challenge-app'
TIMESERIES AUTO
SINCE 1 hour ago
```

### 9. Distribuição por status atual

```sql
SELECT count(*)
FROM ServiceOrderEvent
FACET status
SINCE 7 days ago
```

---

## Alertas

### A1. Falhas no processamento de OS (crítico)

**Condição:** `count(*) FROM Log WHERE event = 'order.failed'`
**Janela:** 5 minutos
**Threshold:** `> 0` por 5 minutos
**Severidade:** critical

### A2. Latência p95 elevada

**Condição:** `percentile(duration, 95) * 1000 FROM Transaction WHERE appName = 'fiap-web-prod'`
**Threshold:** `> 1500` (ms) por 5 minutos
**Severidade:** warning

### A3. Taxa de erro HTTP

**Condição:** `percentage(count(*), WHERE error IS true) FROM Transaction WHERE appName = 'fiap-web-prod'`
**Threshold:** `> 5` (%) por 5 minutos
**Severidade:** critical

### A4. Healthcheck falhando

**Condição:** `SyntheticCheck` monitor `fiap-web-health` → `result != 'SUCCESS'`
**Threshold:** `>= 2` falhas consecutivas
**Severidade:** critical

### A5. Uso de memória K8s alto

**Condição:** `average(memoryWorkingSetBytes) / memoryLimitBytes`
**Threshold:** `> 0.85` por 10 minutos
**Severidade:** warning

---

## Eventos / Métricas custom emitidos

| Nome | Tipo | Onde emitido | Atributos |
|---|---|---|---|
<<<<<<< HEAD
| `ServiceOrderEvent` | Custom event | `ServiceOrderModel.afterCreate` / `afterUpdate` | `event`, `orderId`, `status`, `previousStatus?`, `serviceOrderNumber`, `timeInPreviousStatusMs?`, `durationMs?` (=tempo no status anterior, p/ retrocompat), `totalDurationMs?` |
| `Custom/ServiceOrder/Created` | Metric | `afterCreate` | — |
| `Custom/ServiceOrder/Status/{STATUS}` | Metric | `afterUpdate` (counter de entradas no status) | — |
| `Custom/ServiceOrder/TimeInStatus/{PREVIOUS_STATUS}` | Metric (ms) | `afterUpdate` (tempo gasto antes da mudança) | — |
=======
| `ServiceOrderEvent` | Custom event | `ServiceOrderModel.afterCreate` / `afterUpdate` | `event`, `orderId`, `status`, `serviceOrderNumber`, `durationMs?` |
| `Custom/ServiceOrder/Created` | Metric | `afterCreate` | — |
| `Custom/ServiceOrder/Status/{STATUS}` | Metric | `afterUpdate` | — |
| `Custom/ServiceOrder/Duration/{STATUS}` | Metric (ms) | `afterUpdate` | — |
>>>>>>> 79525fc7d0d34a45810e0971976a92547617c4ae
| `Custom/ServiceOrder/Failed` | Metric | `beforeUpdate` (catch) | — |
| `Log` (event=`order.failed`) | Log | `Logger.error` → `noticeError` | `err`, `order.id`, `service_order_number`, `correlationId` |

`{STATUS}` ∈ `RECEBIDO`, `DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `EXECUCAO`, `FINALIZACAO`, `ENTREGUE`.
