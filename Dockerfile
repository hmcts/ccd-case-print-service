# ---- Base Image ----

FROM hmctspublic.azurecr.io/base/node:20-alpine as base
RUN corepack enable

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

USER root
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/*

COPY --chown=hmcts:hmcts package.json yarn.lock .snyk ./

USER hmcts

RUN yarn config set httpProxy "$http_proxy" \
     && yarn config set httpsProxy "$https_proxy" \
     && yarn workspaces focus --all --production \
     && rm -rf $(yarn cache clean)

# ---- Build Image ----
FROM base AS build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
USER root
RUN yarn sass \
  && yarn install --ignore-optional --production --network-timeout 1200000 \
  && yarn cache clean
USER hmcts

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node:20-alpine as basegit add --

COPY --from=build $WORKDIR .

EXPOSE 3100
