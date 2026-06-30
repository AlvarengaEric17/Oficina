# Documento de Contexto do Projeto Oficina Mecânica

**📚 Documentação Detalhada dos Endpoints:** Consulte o arquivo [`endpoints.md`](endpoints.md) para a documentação completa de todos os endpoints com exemplos de requisição/resposta, validações e códigos de erro.

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Tecnologias e versões principais](#2-tecnologias-e-versões-principais)
3. [Organização de pastas](#3-organização-de-pastas)
4. [Arquitetura de execução](#4-arquitetura-de-execução)
5. [Endpoints completos](#5-endpoints-completos)
6. [Organização de Controllers e Services](#6-organização-de-controllers-e-services)
7. [Validação de dados (schemas)](#7-validação-de-dados-schemas)
8. [Middlewares](#8-middlewares)
9. [Tratamento de Erros](#9-tratamento-de-erros)
10. [Atualizações em Tempo Real (WebSockets)](#10-atualizações-em-tempo-real-websockets)
11. [Modelagem do banco de dados (Prisma)](#11-modelagem-do-banco-de-dados-prisma)
12. [Configuração do Prisma e banco](#12-configuração-do-prisma-e-banco)
13. [Variáveis de ambiente](#13-variáveis-de-ambiente)
14. [Observações importantes](#14-observações-importantes)
15. [Script de execução](#15-script-de-execução)

---

## 1. Visão Geral

Este projeto é um backend Node.js escrito em TypeScript usando arquitetura baseada em rotas, controllers, services e Prisma ORM para acesso ao banco de dados PostgreSQL. O objetivo do sistema é gerenciar uma oficina mecânica, englobando controle de estoque crítico, fluxo completo de aprovação de orçamentos pelo cliente, controle financeiro com cálculo automatizado de taxas de cartão e agenda de mecânicos sincronizada em tempo real.

A arquitetura principal segue o fluxo:
- Rotas recebem a requisição HTTP
- Controllers processam a requisição e chamam os Services
- Services fazem a lógica de negócio e acessam o banco via Prisma
- Eventos em tempo real são disparados via WebSockets para os clientes/painel da oficina
- Controllers retornam a resposta ao cliente

## 2. Tecnologias e versões principais

- Node.js / TypeScript
- Express 5.2.1
- Socket.io 4.8.1 (Suporte a Tempo Real)
- Prisma 7.8.0
- @prisma/client 7.8.0
- @prisma/adapter-pg 7.8.0
- PostgreSQL (conexão via `pg` 8.20.0)
- Zod 4.4.3
- bcryptjs 3.0.3
- jsonwebtoken 9.0.3
- cors 2.8.6
- dotenv 17.4.2
- tsx 4.21.0

Dev dependencies:
- typescript 6.0.3
- @types/cors 2.8.19
- @types/express 5.0.6
- @types/jsonwebtoken 9.0.10
- @types/node 25.6.0
- @types/pg 8.20.0
- prisma 7.8.0

## 3. Organização de pastas

- `src/`
  - `controllers/` - classes que recebem requisições e usam services
    - `user/` - controllers de usuário e autenticação
    - `part/` - controllers de estoque de peças
    - `budget/` - controllers de orçamentos e ordens de serviço
    - `financial/` - controllers de fluxo de caixa e taxas
    - `schedule/` - controllers de agenda de horários
  - `services/` - lógica de negócio e acesso ao banco
    - `user/`
    - `part/`
    - `budget/`
    - `financial/`
    - `schedule/`
  - `middlewares/` - validação, autenticação e autorização
  - `schemas/` - validação de payload via Zod
  - `prisma/` - instância do Prisma Client com adaptador PostgreSQL
  - `generated/` - cliente Prisma gerado
  - `websocket/` - gerenciador de conexões em tempo real (Socket.io)
  - `@types/` - definições de tipos adicionais para Express
  - `routes.ts` - registro de rotas e middlewares
  - `server.ts` - inicialização do Express, HTTP Server, WebSockets e tratamento de erro global
- `prisma/`
  - `schema.prisma` - modelagem do banco de dados
  - `migrations/` - histórico de migrações
- `package.json` - dependências e scripts
- `.env` - variáveis de ambiente

## 4. Arquitetura de execução

### Fluxo padrão de uma requisição
1. `src/routes.ts` define a rota e aplica middlewares.
2. `validateSchema` valida o corpo/parâmetros da requisição usando schemas Zod.
3. `isAuthenticated` valida o token JWT e popula `req.user_id`.
4. `isMechanic` ou `isAdmin` valida o nível de acesso do usuário.
5. O controller específico chama o service correspondente.
6. O service executa a lógica de negócio (ex: abate do estoque, cálculo de taxas) e persiste no banco via `prismaClient`.
7. O service emite um evento via Socket.io caso o cliente precise ver a atualização da timeline em tempo real.
8. O controller envia a resposta JSON ao cliente.

## 5. Endpoints completos

### ✅ Usuário & Autenticação (User)
| Método | Rota | Função | Autenticação | Autorização |
|--------|------|--------|--------------|-------------|
| POST | `/users` | Criar novo usuário (Mecânico/Admin) | ❌ | ❌ |
| POST | `/session` | Autenticação (Login Geral) | ❌ | ❌ |
| GET | `/me` | Detalhes do usuário autenticado | ✅ JWT | Qualquer |

### ✅ Estoque de Peças (Part)
| Método | Rota | Função | Autenticação | Autorização |
|--------|------|--------|--------------|-------------|
| POST | `/part` | Cadastrar nova peça no estoque | ✅ JWT | MECHANIC / ADMIN |
| GET | `/parts` | Listar estoque (com alertas de quantidade mínima) | ✅ JWT | MECHANIC / ADMIN |
| PUT | `/part/:id` | Atualizar dados/quantidade da peça | ✅ JWT | MECHANIC / ADMIN |

### ✅ Orçamentos e Ordens de Serviço (Budget)
| Método | Rota | Função | Autenticação | Autorização |
|--------|------|--------|--------------|-------------|
| POST | `/budget` | Criar um orçamento básico | ✅ JWT | MECHANIC / ADMIN |
| POST | `/budget/item` | Adicionar Peça/Mão de Obra ao orçamento | ✅ JWT | MECHANIC / ADMIN |
| GET | `/budget/share/:id` | Link público para o cliente visualizar o orçamento | ❌ | Qualquer |
| PATCH | `/budget/approve/:id`| Cliente aprova orçamento (Gera financeiro/Abate estoque)| ❌ | Qualquer |
| PATCH | `/budget/status/:id` | Mecânico altera o status da O.S. (Atualiza a Timeline) | ✅ JWT | MECHANIC / ADMIN |
| GET | `/vehicles/history` | Filtros de pesquisa por carro, última manutenção e mecânico| ✅ JWT | MECHANIC / ADMIN |

### ✅ Setor Financeiro (Financial)
| Método | Rota | Função | Autenticação | Autorização |
|--------|------|--------|--------------|-------------|
| POST | `/financial/transaction` | Lançamento manual de Entrada/Saída | ✅ JWT | ADMIN |
| GET | `/financial/cashflow` | Listagem do fluxo de caixa e valores a receber | ✅ JWT | ADMIN |
| POST | `/financial/calculate-tax` | Simular cálculo de taxa de cartão por parcelas | ✅ JWT | Qualquer |

### ✅ Agenda de Horários (Schedule)
| Método | Rota | Função | Autenticação | Autorização |
|--------|------|--------|--------------|-------------|
| POST | `/schedule/slots` | Mecânico define seus horários disponíveis | ✅ JWT | MECHANIC / ADMIN |
| GET | `/schedule/public` | Painel público de horários da oficina para clientes | ❌ | Qualquer |

---

## 6. Organização de Controllers e Services

A organização segue a separação estrita por domínios em pastas estruturadas contendo Controllers e seus respectivos Services (ex: `CreateBudgetController.ts` → `CreateBudgetService.ts`).

---

## 7. Validação de dados (schemas)

### `src/schemas/partSchema.ts`
- `createPartSchema`: `name` (string), `sku` (string), `cost_price` (Int), `sale_price` (Int), `quantity` (Int), `min_quantity` (Int).

### `src/schemas/budgetSchema.ts`
- `createBudgetSchema`: `vehicle_plate` (string), `vehicle_model` (string), `client_name` (string), `client_phone` (string).
- `addItemBudgetSchema`: `budget_id` (string), `part_id` (string opcional), `labor_name` (string opcional), `cost` (Int), `price` (Int), `quantity` (Int).
- `updateStatusSchema`: `status` (Enum Status).

### `src/schemas/financialSchema.ts`
- `manualTransactionSchema`: `description` (string), `type` (INPUT/OUTPUT), `value` (Int).
- `calculateTaxSchema`: `amount` (Int), `installments` (Int).

### `src/schemas/scheduleSchema.ts`
- `createSlotSchema`: `mechanic_id` (string), `start_time` (DateTime), `end_time` (DateTime).

---

## 8. Middlewares

### `validateSchema.ts`
- Valida corpo, queries e parâmetros via Zod. Retorna 400 em caso de erro.

### `isAuthenticated.ts`
- Valida o token Bearer JWT via `process.env.JWT_SECRET` e injeta `req.user_id`.

### `isMechanic.ts / isAdmin.ts`
- Verifica no banco se a `role` do `req.user_id` confere com o nível exigido para a operação.

---

## 9. Tratamento de Erros

- Gerenciado globalmente no `src/server.ts`. Captura instâncias de `Error` personalizadas (ex: estoque insuficiente, orçamento já aprovado) e retorna HTTP 400. Erros inesperados retornam HTTP 500.

---

## 10. Atualizações em Tempo Real (WebSockets)

- Utiliza **Socket.io** integrado ao servidor HTTP principal.
- Sempre que o método `PATCH /budget/status/:id` for executado, um evento `statusUpdated` é emitido na sala do respectivo orçamento, atualizando a timeline do cliente instantaneamente sem necessidade de refresh.

---

## 11. Modelagem do banco de dados (Prisma)

### Enums
- `Role`: `MECHANIC`, `ADMIN`
- `TransactionType`: `INPUT`, `OUTPUT`
- `BudgetStatus`: `DRAFT`, `WAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `TESTING`, `READY`, `DELIVERED`, `REJECTED`

### Model `User`
- `id` (UUID), `name`, `email` (Único), `password`, `role` (Padrão `MECHANIC`).

### Model `Part` (Estoque)
- `id` (UUID), `name`, `sku`, `cost_price` (Int/Centavos), `sale_price` (Int/Centavos), `quantity` (Int), `min_quantity` (Int).

### Model `Budget` (Orçamento/O.S.)
- `id` (UUID), `vehicle_plate`, `vehicle_model`, `client_name`, `client_phone`, `status` (Padrão `DRAFT`), `mechanic_id` (FK), `total_value` (Int), `createdAt`, `updatedAt`.

### Model `BudgetItem`
- `id` (UUID), `budget_id` (FK), `part_id` (FK, Opcional), `description` (Mão de obra ou Peça), `cost` (Int), `price` (Int), `quantity` (Int).

### Model `Financial` (Fluxo de Caixa)
- `id` (UUID), `budget_id` (FK, Opcional), `description`, `type` (TransactionType), `value` (Int), `payment_method` (Opcional), `createdAt`.

### Model `Schedule` (Agenda)
- `id` (UUID), `mechanic_id` (FK), `start_time` (DateTime), `end_time` (DateTime), `is_available` (Boolean, Padrão `true`).

---

## 12. Configuração do Prisma e banco
- Conexão via adaptador `PrismaPg` utilizando o `process.env.DATABASE_URL`. Valores monetários salvos estritamente como **Inteiros (Centavos)** para evitar erros de arredondamento em cálculos de taxas de juros.

## 13. Variáveis de ambiente
- `PORT`, `DATABASE_URL`, `JWT_SECRET`

## 14. Observações importantes
- **Garantia de Estoque:** No momento da aprovação do orçamento (`PATCH /budget/approve/:id`), o Service deve verificar item por item se há quantidade suficiente em estoque antes de decrementar as unidades e mudar o status para `APPROVED`.
- **Regra do Financeiro:** O cálculo automatizado das taxas das maquininhas de cartão utiliza uma tabela interna estática modificável que calcula juros de antecipação e repasse por parcelas (1x até 12x).

## 15. Script de execução
- `npm run dev` - Executa a aplicação utilizando o monitoramento `tsx watch src/server.ts`.