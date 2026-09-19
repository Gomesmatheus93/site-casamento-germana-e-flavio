# Site do casamento — Germana & Flávio

Site do casamento com lista de presentes (Pix e cartão via Mercado Pago), área
administrativa, álbum de fotos dos convidados, sugestões de hospedagem/gastronomia e
informações de local e logística para Mossoró - RN.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Firebase Firestore (banco de dados)
- Firebase Authentication (login da área admin, via cookie de sessão)
- Mercado Pago (`mercadopago` SDK server-side + `@mercadopago/sdk-react` no front-end,
  usando o **Payment Brick** para exibir Pix e cartão no mesmo pop-up)

## Como rodar localmente

```bash
pnpm install
pnpm run dev
```

Acesse http://localhost:3000.

Antes disso, é preciso ter um projeto Firebase com Firestore e Authentication
(provedor Email/Senha) ativados, e as credenciais configuradas no `.env` — veja a
seção de configuração abaixo.

## Configuração (arquivo `.env`)

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
| --- | --- |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Credenciais do Admin SDK, obtidas em Project settings → Service accounts → Generate new private key |
| `NEXT_PUBLIC_FIREBASE_*` | Config do web app (Project settings → General → Your apps → Web), usada só na página `/admin/login` pelo SDK client |
| `MP_ACCESS_TOKEN` | **Access Token** do Mercado Pago (privado, usado no servidor) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | **Public Key** do Mercado Pago (usada no navegador) |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (usada para o webhook do Mercado Pago) |

O usuário admin é criado manualmente no Firebase Console (Authentication → Users →
Add user) ou via Admin SDK — não existe mais cadastro de admin por variável de
ambiente.

### Obtendo as credenciais do Mercado Pago

1. Crie/acesse uma conta em https://www.mercadopago.com.br
2. Vá em **Seu negócio → Configurações → Credenciais** (painel de desenvolvedores:
   https://www.mercadopago.com.br/developers/panel/app)
3. Para testar, use as **credenciais de teste** (`TEST-...`). Para receber pagamentos de
   verdade, use as **credenciais de produção** (`APP_USR-...`) — isso exige que a conta
   Mercado Pago esteja validada.
4. Configure a notificação (webhook) apontando para:
   `https://SEU-DOMINIO/api/payments/webhook`
5. Pix exige que a conta Mercado Pago tenha o Pix habilitado (normalmente já vem
   habilitado para contas brasileiras).

⚠️ Nunca exponha o `MP_ACCESS_TOKEN` no front-end — ele é usado apenas nas rotas de API
do servidor (`src/app/api/payments/*`).

## Área administrativa

Acesse `/admin/login` com o email/senha do usuário criado no Firebase Authentication.

Na área admin é possível:

- Cadastrar/editar/excluir presentes (nome, valor, categoria, status, descrição, foto —
  upload de arquivo ou URL — e link de loja parceira opcional)
- Ver todos os pedidos/pagamentos (Pix e cartão) e seus status
- Moderar (excluir) fotos enviadas pelos convidados

## Álbum de fotos dos convidados

O envio de fotos só é liberado a partir da data/hora do casamento
(`PHOTOS_UNLOCK_DATE` em `src/lib/wedding-config.ts`, hoje `01/11/2026 16h`). Antes
disso a página mostra apenas um aviso; a galeria pública também só é populada após essa
data.

## Armazenamento de imagens

As imagens (fotos de presentes e fotos dos convidados) são salvas localmente em
`public/uploads/`. Isso funciona bem rodando em um servidor Node persistente (VPS,
Railway, Render etc.). **Se for hospedar em uma plataforma serverless (ex.: Vercel)**, o
sistema de arquivos não é persistente entre deploys/execuções — nesse caso, troque
`src/lib/upload.ts` por um provedor de armazenamento externo (Firebase Storage — exige
o plano pago Blaze do projeto —, S3, Cloudinary, Vercel Blob etc.).

Os dados (presentes, pedidos, fotos, confirmações de presença) ficam no Firestore, que
já funciona em qualquer tipo de hospedagem, incluindo serverless.

## Conteúdo de local/logística e hospedagem

As distâncias até Natal (~278 km) e Fortaleza (~250 km), além das sugestões de hotéis e
restaurantes de Mossoró - RN, estão centralizadas em `src/lib/wedding-config.ts` — edite
esse arquivo para atualizar os dados exibidos nas páginas `/local` e `/hospedagem`.
