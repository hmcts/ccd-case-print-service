# ---- Base Image ----
ARG PLATFORM=""
FROM hmctsprod.azurecr.io/base/node${PLATFORM}:24-alpine AS base

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

USER root
RUN corepack enable
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/* \
  && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

COPY . .
RUN chown -R hmcts:hmcts .
USER hmcts

RUN yarn install --immutable --network-timeout 1200000

# ---- Build Image ----
FROM base as build

RUN yarn setup

RUN sleep 1 && yarn install && yarn cache clean

# ---- Runtime Image ----
FROM hmctsprod.azurecr.io/base/node${PLATFORM}:24-alpine AS runtime

COPY --from=build $WORKDIR .

EXPOSE 3100
