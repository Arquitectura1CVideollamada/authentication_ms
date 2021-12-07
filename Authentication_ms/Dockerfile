FROM node:14 as base

WORKDIR /Authentication_ms

COPY package*.json .

RUN npm i

RUN npm install typescript --save-dev

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build