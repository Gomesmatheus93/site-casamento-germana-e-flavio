# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- deps: instala dependências com cache do lockfile ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: gera o Prisma Client e o build de produção ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Variáveis NEXT_PUBLIC_* são embutidas no bundle JS durante o build,
# então precisam existir aqui (via --build-arg), não só em runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MP_PUBLIC_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MP_PUBLIC_KEY=$NEXT_PUBLIC_MP_PUBLIC_KEY

RUN npx prisma generate
RUN npm run build

# ---- runner: imagem final, enxuta, rodando como usuário não-root ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Diretório único para dados persistentes (banco SQLite + uploads), pensado
# para plataformas com um volume só por serviço (ex.: Railway). Monte o
# volume em /app/data.
ENV DATABASE_URL=file:/app/data/dev.db
ENV UPLOADS_DIR=/app/data/uploads

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Saída "standalone" do Next (apenas o necessário para rodar, sem node_modules completo)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI (com todas as suas dependências) + schema, necessários no
# entrypoint para sincronizar o banco SQLite. A CLI do Prisma tem uma árvore
# de dependências própria (engines, wasm, etc.) que não é seguro copiar
# seletivamente, então trazemos o node_modules completo do builder.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
    && mkdir -p ./data \
    && chown -R nextjs:nodejs ./data ./prisma

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
