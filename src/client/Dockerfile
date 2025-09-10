FROM node:20 as build

# Work in the client directory within a repository-wide context
WORKDIR /app/web/client

# Only copy client package manifests first for better caching
COPY web/client/package.json ./package.json
COPY web/client/package-lock.json ./package-lock.json

RUN npm install

# Copy client source and any external assets referenced relatively from client
COPY web/client .
# Bring in repository-level assets referenced by the client at build time
COPY templates /app/web/templates
COPY CHANGELOG.md /app/web/CHANGELOG.md

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/web/client/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/web/client/dist /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
