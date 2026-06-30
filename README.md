# 🔧 Oficina Mecânica - Backend

Sistema backend completo para gestão de oficina mecânica desenvolvido em Node.js com TypeScript.

## 🚀 Características

- ✅ Autenticação JWT com suporte a roles (MECHANIC, ADMIN)
- ✅ Controle de estoque crítico com alertas de quantidade mínima
- ✅ Fluxo completo de aprovação de orçamento pelo cliente
- ✅ Cálculo automatizado de taxas de cartão (1x até 12x)
- ✅ Fluxo de caixa e gestão financeira
- ✅ Agenda de mecânicos sincronizada em tempo real com WebSocket
- ✅ Validação rigorosa de dados com Zod
- ✅ PostgreSQL com Prisma ORM

## 📋 Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd oficina-mecanica-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env .env.local
# Edite .env.local com suas configurações
```

Exemplo de `.env.local`:
```env
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/oficina_mecanica?schema=public
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

4. **Execute as migrações do Prisma**
```bash
npx prisma migrate dev --name init
```

5. **Gere o cliente Prisma**
```bash
npm run prisma:generate
```

## 🚀 Execução

### Modo desenvolvimento (com watch)
```bash
npm run dev
```

### Modo produção
```bash
npm run build
npm run start
```

### Gerenciar banco de dados
```bash
# Visualizar dados no Prisma Studio
npm run prisma:studio

# Criar nova migração
npm run prisma:migrate
```

## 📚 Documentação

Consulte o arquivo `Contexto.md` para:
- Arquitetura detalhada
- Endpoints completos
- Modelos de dados
- Fluxos de negócio

Consulte o arquivo `endpoints.md` para:
- Documentação completa dos endpoints
- Exemplos de requisição/resposta
- Códigos de erro
- Validações

## 🔗 Principais Endpoints

### Autenticação
- `POST /users` - Criar novo usuário
- `POST /session` - Login
- `GET /me` - Dados do usuário autenticado

### Estoque
- `POST /part` - Cadastrar peça
- `GET /parts` - Listar peças com alertas críticos
- `PUT /part/:id` - Atualizar peça

### Orçamentos
- `POST /budget` - Criar orçamento
- `POST /budget/item` - Adicionar item ao orçamento
- `GET /budget/share/:id` - Visualizar orçamento (link público)
- `PATCH /budget/approve/:id` - Cliente aprova orçamento
- `PATCH /budget/status/:id` - Atualizar status da O.S.
- `GET /vehicles/history` - Histórico de veículos

### Financeiro
- `POST /financial/transaction` - Lançamento manual (ADMIN)
- `GET /financial/cashflow` - Fluxo de caixa (ADMIN)
- `POST /financial/calculate-tax` - Calcular taxa de cartão

### Agenda
- `POST /schedule/slots` - Criar horário disponível
- `GET /schedule/public` - Painel público de horários
- `GET /schedule/mechanic` - Horários do mecânico autenticado

## 🔐 Autenticação

Use o token JWT retornado no login em todas as requisições autenticadas:

```bash
curl -H "Authorization: Bearer SEU_TOKEN_JWT" http://localhost:3000/me
```

## 🌍 WebSocket (Socket.io)

O sistema emite eventos em tempo real:

```javascript
const socket = io('http://localhost:3000');

// Entrar na sala de um orçamento
socket.emit('join-budget', 'budget-id');

// Escutar atualizações de status
socket.on('statusUpdated', (data) => {
  console.log('Orçamento atualizado:', data);
});

// Escutar atualizações de agenda
socket.on('scheduleUpdated', (data) => {
  console.log('Agenda atualizada:', data);
});
```

## 📊 Estrutura do Projeto

```
src/
├── controllers/       # Controladores (User, Part, Budget, Financial, Schedule)
├── services/         # Lógica de negócio
├── middlewares/      # Validação, autenticação, autorização
├── schemas/          # Schemas Zod para validação
├── prisma/           # Cliente Prisma
├── websocket/        # Gerenciador Socket.io
├── @types/           # Definições de tipos adicionais
├── routes.ts         # Rotas da aplicação
└── server.ts         # Inicialização do servidor

prisma/
├── schema.prisma     # Modelagem do banco
└── migrations/       # Histórico de migrações
```

## 🔄 Fluxo de Aprovação de Orçamento

1. Mecânico cria orçamento (`POST /budget`)
2. Mecânico adiciona itens (`POST /budget/item`)
3. Gera link público para cliente (`GET /budget/share/:id`)
4. Cliente aprova orçamento (`PATCH /budget/approve/:id`)
5. Sistema valida estoque item por item
6. Abate automático do estoque
7. Cria registro financeiro (entrada)
8. Muda status para `APPROVED`

## 💰 Tabela de Taxas de Cartão

| Parcelas | Taxa |
|----------|------|
| 1x       | 0%   |
| 2x       | 2.5% |
| 3x       | 3.75%|
| 4x       | 5%   |
| 5x       | 6.25%|
| 6x       | 7.5% |
| 7x       | 8.75%|
| 8x       | 10%  |
| 9x       | 11.25%|
| 10x      | 12.5%|
| 11x      | 13.75%|
| 12x      | 15%  |

## ⚠️ Observações Importantes

- Todos os valores monetários são armazenados em **centavos** (números inteiros) para evitar erros de arredondamento
- Estoque é validado **item por item** na aprovação do orçamento
- WebSocket eventos são emitidos em tempo real para atualizações da timeline
- Senhas são criptografadas com bcryptjs
- Tokens JWT expiram em 24 horas

## 🐛 Tratamento de Erros

O sistema retorna erros estruturados:

```json
{
  "error": "Descrição do erro",
  "details": [...]  // apenas em erros de validação
}
```

Códigos HTTP:
- `200` - Sucesso
- `201` - Criado
- `400` - Erro de validação ou negócio
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 📝 Licença

Proprietário

---

**Desenvolvido com ❤️ usando Node.js, TypeScript e Prisma**
