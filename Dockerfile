# ── build stage ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /src

# 依存を先に入れて、レイヤーキャッシュを効かせる
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ── run stage ────────────────────────────────────────────────
# ビルドした静的ファイルを nginx で配り、/api だけ API へ中継する
FROM nginx:1.28-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html

# API の置き場所。docker compose で api という名前のサービスと並べる想定
ENV API_UPSTREAM=http://api:8080
EXPOSE 80
