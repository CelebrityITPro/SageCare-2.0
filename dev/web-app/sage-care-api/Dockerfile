# Backend Dockerfile for development
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g nodemon

EXPOSE 5000

CMD ["npx", "nodemon", "index.js"] 