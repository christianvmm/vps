ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app

# Lockfile was generated with npm 11. Node 22 ships npm 10, which fails
# `npm ci` with "Missing: @emnapi/runtime / @emnapi/core from lock file".
RUN npm install -g npm@11
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
