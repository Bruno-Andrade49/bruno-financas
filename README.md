# Bruno Finanças

Plataforma de controle financeiro pessoal com assistente de IA. A arquitetura
completa (decisões, alternativas comparadas, modelo de dados, segurança,
roadmap) está em **[ARCHITECTURE.md](./ARCHITECTURE.md)** — comece por lá.

Stack: Nuxt 3 + Vue 3 + TypeScript · shadcn-vue + Tailwind · PostgreSQL +
Prisma · Zod · Better Auth · Redis opcional (V1+) · Google Gemini (IA, free
tier — adapter trocável, Anthropic Claude também suportado via `AI_PROVIDER`).

## Setup local

Pré-requisitos: Node 22+, Docker (para o Postgres local).

```bash
npm install
cp .env.example .env       # ajuste os valores se necessário
npm run docker:up          # sobe o Postgres em Docker
npm run db:migrate         # cria as tabelas
npm run db:seed            # categorias padrão do sistema
npm run dev                # http://localhost:3000
```

Sem Docker rodando, o app ainda sobe e as páginas públicas (`/login`,
`/register`) funcionam — só as chamadas que tocam o banco (cadastro, login,
transações) vão falhar até o Postgres estar disponível.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run preview` | Build e preview de produção |
| `npm run typecheck` | Checagem de tipos (app + server) |
| `npm run docker:up` / `docker:down` | Postgres local via Docker Compose |
| `npm run db:migrate` | Aplica migrations (`prisma migrate dev`) |
| `npm run db:seed` | Popula categorias padrão do sistema |
| `npm run db:studio` | Prisma Studio (inspecionar o banco) |

## Estrutura

Segue a estrutura descrita em `ARCHITECTURE.md`, seção 6: `server/modules/*`
concentra a regra de negócio por domínio (transações, categorias, IA, ...),
`server/api/v1/*` são rotas finas que só validam e chamam o `service`
correspondente, `shared/schemas/*` guarda os schemas Zod usados tanto no
frontend (formulários) quanto no backend (validação de request).

## O que já está implementado

- Autenticação (Better Auth: registro, login, sessão) com carteira e forma
  de pagamento padrão provisionadas automaticamente no cadastro.
- CRUD de transações + resumo mensal (receitas, despesas, economia).
- Categorias (padrão do sistema + customizadas).
- Orçamentos por categoria/mês, com progresso calculado sob demanda (nunca
  persistido) e status `ok`/`warning`/`exceeded` conforme `alertThresholdPct`.
- Metas financeiras: valor alvo/data, aporte manual (`POST /goals/:id/contribute`,
  auto-completa a meta ao atingir o valor), projeção de quanto guardar por mês
  (`suggestedMonthlyContribution`) sempre recalculada, nunca persistida.
- Insights determinísticos (maior gasto do mês, alta de categoria vs. mês
  anterior, alerta de orçamento) — gerados sob demanda (`POST /insights/generate`)
  ou em lote via `/api/internal/cron/generate-insights` (protegida por
  `CRON_SECRET`).
- Transações recorrentes (semanal/mensal/anual, com clamp de dia em meses
  mais curtos) — processadas via `/api/internal/cron/process-recurring`,
  idempotente (constraint única `(recurringTransactionId, date)` no banco).
- Redesign mobile-first (navegação inferior, tipografia/cor dedicadas,
  ícones Phosphor).
- Dashboard, `/budgets`, `/goals`, `/insights` e `/recurring` com CRUD
  completo nas respectivas páginas.
- Recuperação de senha (`/forgot-password` → `/reset-password`) e e-mail de
  verificação de cadastro, via Resend (`server/lib/email.ts`). **Em modo
  sandbox** — sem domínio verificado em resend.com/domains, só entrega pro
  e-mail dono da conta Resend; verifique um domínio antes de ir pra produção.
- Assistente de IA (`/assistant`) — chat com tool calling sobre os dados
  financeiros do próprio usuário (`server/modules/ai/`). Provedor de LLM por
  trás de uma interface própria (`ChatProvider`), com adapters para Google
  Gemini (padrão, free tier via Google AI Studio — sem custo) e Anthropic
  Claude, selecionável por `AI_PROVIDER` no `.env`. Tools tipadas e validadas
  com Zod, sempre escopadas ao `userId` da sessão (nunca fornecido pelo
  modelo); toda chamada auditada em `AIToolCallLog`. A tool de escrita
  (`create_transaction`) só executa depois de confirmação explícita do
  usuário numa mensagem separada — disciplina garantida pelo system prompt,
  não por um mecanismo de proposta com ID (simplificação deliberada de MVP,
  documentada em `ai.service.ts`; revisitar se o assistente for exposto a
  múltiplos usuários por um canal como o WhatsApp). Também resiliente a falha
  do provedor de IA a meio do fluxo: se a escrita já foi confirmada mas o
  passo seguinte falhar, a resposta avisa que já foi salvo em vez de deixar o
  usuário reenviar e duplicar o lançamento.

- WhatsApp (`server/api/webhooks/whatsapp.*`) — o mesmo assistente por
  mensagem no WhatsApp (Meta Cloud API). Cada usuário vincula seu número
  gerando um código de 6 dígitos em Configurações → WhatsApp e mandando
  `VINCULAR 123456` pro número do bot; a partir daí, qualquer mensagem de
  texto vira uma chamada a `ai.service.sendChannelMessage` (canal `whatsapp`
  na `AIConversation`, conversa contínua por número, sem conceito de aba de
  navegador). Assinatura de cada webhook verificada via HMAC-SHA256
  (`X-Hub-Signature-256`, App Secret) antes de qualquer processamento;
  deduplicação por `wamid` evita reprocessar a mesma mensagem caso a Meta
  reenvie o webhook por timeout.

## WhatsApp — configurando o Meta Cloud API

1. Crie um app em [developers.facebook.com/apps](https://developers.facebook.com/apps)
   (tipo "Business") e adicione o produto **WhatsApp**.
2. Em **WhatsApp → Configuração da API**, copie o **token de acesso
   temporário** (válido 24h — pra além disso, gere um token permanente via
   um System User) e o **ID do número de telefone** → `WHATSAPP_ACCESS_TOKEN`
   e `WHATSAPP_PHONE_NUMBER_ID` no `.env`.
3. Nessa mesma tela, em modo de desenvolvimento, adicione seu próprio número
   como destinatário de teste (a Meta só entrega mensagens pra números
   autorizados até o app ser aprovado pra produção).
4. Em **Configurações do app → Básico**, copie o **App Secret** →
   `WHATSAPP_APP_SECRET`. Escolha qualquer string pra `WHATSAPP_VERIFY_TOKEN`
   (você mesmo define esse valor).
5. Rode o app localmente (`npm run dev`) e exponha a porta com um túnel HTTPS:
   ```bash
   npx ngrok http 3000
   ```
6. Em **WhatsApp → Configuração → Webhook**, clique em editar, cole a URL do
   ngrok + `/api/webhooks/whatsapp` como Callback URL, e o mesmo valor de
   `WHATSAPP_VERIFY_TOKEN` como Verify Token. Salve (a Meta faz o handshake
   `GET` na hora — só salva se responder certo) e inscreva-se no campo
   `messages`.
7. No app, vá em **Configurações → WhatsApp**, gere um código, e mande
   `VINCULAR <código>` pro número de teste do WhatsApp Business. Depois disso
   é só conversar normalmente.

Um túnel do ngrok muda de URL a cada reinício (a menos que o domínio seja
fixo num plano pago) — reconfigure o Callback URL sempre que reiniciar.

## Próximos passos (ver ARCHITECTURE.md, roadmap)

- Auditoria (`AuditLog`) — módulo `server/modules/audit/` ainda vazio.
