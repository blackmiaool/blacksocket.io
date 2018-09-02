FROM node:alpine
COPY package*.json ./
RUN npm install --only=production
RUN npm i -g serve
COPY . .
EXPOSE 80
EXPOSE 23033
COPY client/blacksocket.js demo/client/
ENTRYPOINT serve -l 80 demo/client & node demo/server/index.js
