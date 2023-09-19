FROM node:18.17.1

EXPOSE 3001

WORKDIR /app

COPY package*.json ./
COPY *.js ./
COPY models models

RUN npm install

CMD node index.js
