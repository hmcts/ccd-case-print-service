# ---- Base Image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine as base

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

USER root
RUN corepack enable
#RUN apk update \
#  && apk add bzip2 patch python3 py3-pip make gcc g++ \
#  && rm -rf /var/lib/ /lists/*

RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/apt/lists/* \
  && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

COPY --chown=hmcts:hmcts package.json yarn.lock .snyk ./

#COPY . .
RUN chown -R hmcts:hmcts .

USER hmcts

RUN yarn install && yarn cache clean

# ---- Build Image ----
FROM base AS build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
#USER root

RUN yarn sass

RUN sleep 1 && yarn install && yarn cache clean

USER hmcts

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine as runtime

COPY --from=build $WORKDIR .

EXPOSE 3100
