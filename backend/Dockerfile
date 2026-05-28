# --- Build Stage ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:24-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER node

EXPOSE 3031

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

# --- Development Stage ---
FROM node:24-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3031

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]