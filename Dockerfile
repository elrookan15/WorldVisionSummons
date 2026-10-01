# WorldVision Summons — Cloud Run image.
# Secrets (GEMINI_API_KEY, WVS_API_SECRET) are runtime env vars, never copied in.
# VITE_WVS_API_SECRET is baked into the browser bundle at build time (deploy gate only).

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_WVS_API_SECRET=
ENV VITE_WVS_API_SECRET=$VITE_WVS_API_SECRET

RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
