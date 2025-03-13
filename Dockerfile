RUN corepack enable
COPY --chown=hmcts:hmcts . .

USER hmcts
RUN yarn workspaces focus --all --production && rm -rf $(yarn cache clean)

RUN sleep 1 && yarn install && yarn cache clean


# ---- Base Image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine AS base

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS=--openssl-legacy-provider

FROM base AS build

USER root

USER root
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/*



USER hmcts




# ---- Build Image ----
FROM base AS build

USER root

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
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine AS runtime

COPY --from=build $WORKDIR .

EXPOSE 3100
