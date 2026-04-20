FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE $APP_PORT

CMD ["/bin/sh", "-c", "npm run prebuild && npm run build && npm run migrate && npm run seed && npm start"]