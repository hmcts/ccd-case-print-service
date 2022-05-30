# ---- Base Image ----
FROM hmctspublic.azurecr.io/base/node:14-alpine as base
USER root
RUN apk update \
  && apk add bzip2 patch \
  && rm -rf /var/lib/ /lists/*
USER hmcts
COPY package.json yarn.lock .snyk ./
RUN yarn install --ignore-optional

# ---- Build Image ----
FROM base as build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
USER root
RUN yarn sass \
  && yarn install --ignore-optional --production \
  && yarn cache clean

# ---- Runtime Image ----
FROM hmctspublic.azurecr.io/base/node:14-alpine as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
