FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN rm -rf src

RUN npm cache clean --force

EXPOSE 7000

CMD ["npm", "start"]