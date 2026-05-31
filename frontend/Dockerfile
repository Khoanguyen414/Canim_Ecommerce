# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci \
    && npm install @rollup/rollup-linux-x64-gnu --no-save

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080/canim_ecommerce
ARG VITE_AI_API_BASE_URL=http://localhost:8001
ARG VITE_AI_CHAT_MOCK=false
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GOOGLE_MAPS_API_KEY=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_AI_API_BASE_URL=$VITE_AI_API_BASE_URL \
    VITE_AI_CHAT_MOCK=$VITE_AI_CHAT_MOCK \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache wget

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
