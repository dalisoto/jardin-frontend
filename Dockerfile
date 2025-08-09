# Etapa 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .            # <- copia .env.production
RUN npm run build

# Etapa 2: Nginx sirviendo estáticos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# << clave: usar 8080 para Cloud Run >>
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
