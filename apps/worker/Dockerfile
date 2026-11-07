FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@jewelcore/shared" run build
RUN pnpm --filter "@jewelcore/worker" run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

CMD ["node", "apps/worker/dist/index.js"]
