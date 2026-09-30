# Bruno Finanças

App de controle financeiro pessoal, pensado pro celular, com tema claro e escuro.
As decisões de arquitetura estão no [ARCHITECTURE.md](./ARCHITECTURE.md).

Stack: Nuxt 4, Vue 3, TypeScript, Tailwind v4 com shadcn-vue, PostgreSQL com
Prisma 7, Zod e Better Auth. Nenhum serviço pago.

## Rodando local

Precisa de Node 22+ e Docker.

```bash
npm install
cp .env.example .env
npm run docker:up     # sobe o Postgres
npm run db:migrate    # cria as tabelas
npm run db:seed       # categorias padrão
npm run dev           # http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run preview` | Build e preview de produção |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Testes unitários (Vitest) |
| `npm run docker:up` / `docker:down` | Postgres local |
| `npm run db:migrate` | Migrations em dev |
| `npm run db:deploy` | Migrations em produção |
| `npm run db:seed` | Categorias padrão |
| `npm run db:studio` | Prisma Studio |

## Estrutura

- `app/`: páginas, componentes e composables (Vue)
- `server/api/v1/`: rotas da API, só validam e chamam o service
- `server/modules/`: regras de negócio por assunto (transações, orçamentos, metas...)
- `shared/`: código usado no front e no back (schemas Zod, lançamento rápido, simulador)
- `prisma/`: schema, migrations e seed

## Funcionalidades

- **Contas**: cadastro, login, verificação de e-mail e recuperação de senha.
- **Lançamento rápido**: escreva "35 almoço" ou "gastei 42,90 no uber ontem" e o
  app descobre valor, tipo, categoria e data. Abre pelo botão central no
  celular, pelo "Lançar" no desktop ou pela tecla `N`.
- **Dashboard**: saldo do mês, entradas e saídas dos últimos 6 meses e gastos
  por categoria.
- **Lançamentos**: lista completa com busca, filtros e "carregar mais".
- **Vale a pena?**: simula uma compra parcelada e mostra, mês a mês, se ela
  cabe no seu orçamento sem atrapalhar o que você quer guardar.
- **Orçamentos** por categoria, com alerta antes de estourar.
- **Metas** com quanto guardar por mês pra chegar no prazo.
- **Recorrências** (semanal, mensal e anual), lançadas automaticamente por um cron.
- **Insights** do mês: maior gasto, categorias que subiram e orçamentos no limite.
- **Tema** claro, escuro ou do sistema.

## E-mail (recuperação de senha)

O Resend no plano grátis só entrega pro e-mail do dono da conta, a não ser que
você verifique um domínio. A opção grátis que funciona pra qualquer endereço é
o SMTP do Gmail:

1. Ative a verificação em 2 etapas na sua conta Google.
2. Crie uma senha de app em https://myaccount.google.com/apppasswords.
3. Preencha no `.env`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="a senha de app, 16 letras"
EMAIL_FROM="Bruno Finanças <seu-email@gmail.com>"
```

Em desenvolvimento, se o envio falhar, o link de redefinição aparece no terminal.

## Deploy (Vercel + Neon)

1. Crie um banco no [Neon](https://neon.tech) e copie a connection string.
2. Importe o repositório na Vercel e configure as variáveis:

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | connection string do Neon |
   | `BETTER_AUTH_SECRET` | `openssl rand -hex 32` |
   | `BETTER_AUTH_URL` | `https://seu-dominio` |
   | `NUXT_PUBLIC_SITE_URL` | `https://seu-dominio` (sem barra no fim) |
   | `CRON_SECRET` | `openssl rand -hex 32` |
   | `SMTP_*` e `EMAIL_FROM` | os mesmos da seção de e-mail |

3. Rode as migrations no banco de produção:
   `DATABASE_URL="<neon>" npm run db:deploy && DATABASE_URL="<neon>" npm run db:seed`
4. Faça o deploy. O Prisma Client é gerado no `postinstall`.
5. Os crons de recorrências e insights já estão em `vercel.json` (uma vez por dia).

Obs.: no Windows, rodar o build com `node .output/server/index.mjs` falha por
causa de um caminho do Prisma Client. Na Vercel (Linux) funciona normal. Pra
desenvolver, use `npm run dev`.

## SEO

- Título, descrição e Open Graph em todas as páginas (`app/app.vue`).
- Imagem de compartilhamento em `public/og-image.jpg` (1200x630).
- Só login e cadastro aparecem no Google; a área logada é `noindex`.
- `robots.txt` e `sitemap.xml` gerados em `server/routes/`.

## Próximos passos

- Módulo de auditoria (`AuditLog`), ainda vazio.
- Página inicial pública pra melhorar o SEO.
