# Stage 1: build the application
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html
COPY app-manifest.yml /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
