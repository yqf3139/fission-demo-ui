FROM node:8.1.3

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY .env.development.local /usr/src/app/
ADD src /usr/src/app/src
ADD public /usr/src/app/public

EXPOSE 3000
CMD [ "npm", "start"]