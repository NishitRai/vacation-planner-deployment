# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package*.json .
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

# Final stage
FROM nginx:1.27-alpine AS production

RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

# Disable the master process 'user' directive to stop the first warning
RUN sed -i 's/^user/#user/' /etc/nginx/nginx.conf

# Security: run nginx as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

