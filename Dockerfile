FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run initdb

EXPOSE 3000

CMD [ "npm", "start" ]
