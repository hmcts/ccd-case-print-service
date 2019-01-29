# ---- Base Image ----
FROM node:8.12.0-slim as base
MAINTAINER https://github.com/hmcts/ccd-docker

WORKDIR /usr/src/app

ARG BUILD_DEPS='bzip2 patch'

COPY package.json yarn.lock .snyk ./
RUN apt-get update && apt-get install -y $BUILD_DEPS --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && curl -o- -L https://yarnpkg.com/install.sh | bash -s \
    && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH" \
    && yarn install 

# ---- Base Image ----
FROM base as build
COPY src/main ./src/main
COPY config ./config

COPY gulpfile.js tsconfig.json ./

RUN export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH" \
    && yarn sass \
    && rm -rf node_modules \
    && yarn install --production \
    && apt-get purge -y --auto-remove $BUILD_DEPS

# ---- Base Image ----
FROM build as runtime
# TODO: expose the right port for your application
EXPOSE 3100
CMD [ "yarn", "start" ]
