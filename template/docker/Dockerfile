FROM node:10.15.1-alpine
LABEL company="COOBO"

RUN apk update \
    && apk add --virtual build-dependencies \
        build-base \
        gcc \
        wget \
        git \
        python \
    && apk add \
        bash

RUN mkdir -p /app
WORKDIR /app
ADD ./ /app
RUN yarn install
RUN yarn run build
ENV TZ=America/Sao_Paulo
WORKDIR /

RUN apk del build-dependencies \
    && rm -rf /var/cache/apk/*

CMD ["node", "dist/app.js"]