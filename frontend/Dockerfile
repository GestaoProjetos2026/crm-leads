# --- Build Stage ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine AS production

# Copy built app to nginx
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3032

CMD ["nginx", "-g", "daemon off;"]
