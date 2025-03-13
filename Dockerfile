# ---- Base Image ----

FROM hmctspublic.azurecr.io/base/node:20-alpine as base


ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

USER root
RUN corepack enable
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/*

COPY --chown=hmcts:hmcts package.json yarn.lock .snyk ./
RUN sleep 1 && yarn install && yarn cache clean


COPY --chown=hmcts:hmcts . .

USER hmcts
RUN yarn workspaces focus --all --production && rm -rf $(yarn cache clean)

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

USER hmcts
COPY --chown=hmcts:hmcts package.json yarn.lock ./

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node:20-alpine as base

COPY --from=build $WORKDIR .

EXPOSE 3100
