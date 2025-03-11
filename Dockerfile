# ---- Base Image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine AS base

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

USER root
RUN corepack enable
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/*

#COPY --chown=hmcts:hmcts package.json yarn.lock .snyk ./
#COPY --chown=hmcts:hmcts .yarn ./.yarn
COPY --chown=hmcts:hmcts config ./config
COPY --chown=hmcts:hmcts package.json yarn.lock .snyk .yarnrc.yml tsconfig.json ./

USER hmcts

RUN yarn install --network-timeout 1200000

# ---- Build Image ----
FROM base AS build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
USER root

RUN yarn sass

RUN sleep 1 && yarn install && yarn cache clean

USER hmcts

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine AS runtime

COPY --from=build $WORKDIR .

EXPOSE 3100
