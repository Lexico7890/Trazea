# Stage 1: Dependencies (la llamaremos 'dev')
FROM node:22-alpine AS dev
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install  # Eliminamos frozen-lockfile para desarrollo fácil

# Stage 2: Builder (para producción)
FROM dev AS builder
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_TOKEN
COPY . .
RUN VITE_SUPABASE_URL=$PUBLIC_SUPABASE_URL VITE_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_TOKEN pnpm build

# Stage 3: Runner (Nginx)
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]