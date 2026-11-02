FROM node:22-bookworm-slim

WORKDIR /app

COPY functions/scan-site/package.json functions/scan-site/package-lock.json* ./functions/scan-site/
RUN npm install --omit=dev --prefix functions/scan-site

COPY services/audit-worker/package.json services/audit-worker/package-lock.json* ./services/audit-worker/
RUN npm install --omit=dev --prefix services/audit-worker

COPY functions/scan-site/src ./functions/scan-site/src
COPY services/audit-worker/src ./services/audit-worker/src

ENV NODE_ENV=production
CMD ["node", "services/audit-worker/src/server.js"]
