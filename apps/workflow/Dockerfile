FROM oven/bun:1-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN bun add -g turbo
COPY . .

ARG APP_NAME

RUN turbo prune ${APP_NAME} --docker


FROM oven/bun:1-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN bun install --frozen-lockfile


FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .

ARG APP_NAME

RUN bunx turbo run build --filter=${APP_NAME}


FROM oven/bun:1-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist
COPY --from=builder /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json

EXPOSE 8080
ENV PORT=8080

CMD ["bun", "--cwd", "apps/${APP_NAME}", "run", "start"]
