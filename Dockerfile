# ---- Base Image ----
ARG PLATFORM=""

ARG base=hmctspublic.azurecr.io/base/node${PLATFORM}:14-alpine

FROM ${base} as base
USER root
RUN apk update \
  && apk add bzip2 patch \
  && rm -rf /var/lib/ /lists/*
COPY package.json yarn.lock .snyk ./
RUN yarn install --ignore-optional

# ---- Build Image ----
FROM base as build
COPY src/main ./src/main
COPY config ./config
COPY gulpfile.js tsconfig.json ./
RUN yarn sass \
  && yarn install --ignore-optional --production \
  && yarn cache clean

# ---- Runtime Image ----
FROM ${base} as runtime
COPY --from=build $WORKDIR .
EXPOSE 3100
