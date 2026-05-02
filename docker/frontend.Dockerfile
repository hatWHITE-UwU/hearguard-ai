FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hearguard-frontend/browser /usr/share/nginx/html
EXPOSE 80
