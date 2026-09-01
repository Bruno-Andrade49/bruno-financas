# Bruno Finanças

Plataforma de controle financeiro pessoal com assistente de IA. A arquitetura
completa (decisões, alternativas comparadas, modelo de dados, segurança,
roadmap) está em **[ARCHITECTURE.md](./ARCHITECTURE.md)** — comece por lá.

Stack: Nuxt 3 + Vue 3 + TypeScript · shadcn-vue + Tailwind · PostgreSQL +
Prisma · Zod · Better Auth · Redis opcional (V1+) · Anthropic Claude (IA).

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
- Dashboard com os cards de resumo, últimos lançamentos e criação rápida de
  transação; página `/budgets` com os cards de orçamento; página `/goals` com
  os cards de meta e aporte rápido.

## Próximos passos (ver ARCHITECTURE.md, roadmap)

Ainda fora deste scaffold inicial, na ordem sugerida pelo roadmap do MVP:
insights determinísticos, chat de IA com tool calling, transações recorrentes,
recuperação de senha (depende de configurar envio de e-mail no Better Auth).
Os módulos `recurring`, `insights`, `ai` e `audit` já existem como pastas
vazias em `server/modules/` esperando essa implementação, seguindo o mesmo
padrão dos módulos `transactions`/`budgets`/`goals`.
