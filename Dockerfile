# ---- Base Image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:14-alpine as base
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
USER root
RUN apk update \
  && apk add bzip2 patch python3 py3-pip make gcc g++ \
  && rm -rf /var/lib/ /lists/*
COPY package.json yarn.lock .snyk ./
RUN yarn install --ignore-optional --network-timeout 600000 --verbose

# ---- Build Image ----
FROM base as build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
RUN yarn sass \
  && yarn install --ignore-optional --production --network-timeout 600000 --verbose \
  && yarn cache clean

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:14-alpine as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
