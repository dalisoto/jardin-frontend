# deploy/Dockerfile.frontend

# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY jardin-frontend/package*.json ./
RUN npm ci
COPY jardin-frontend ./
# Si tu front ya usa VITE_API_URL, déjalo; no cambiamos llamadas.
RUN npm run build

# Runtime
FROM nginx:1.27-alpine
# Copiamos el build
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx para SPA (fallback a index.html)
COPY deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
