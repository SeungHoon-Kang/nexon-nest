FROM node:20-alpine

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --production

COPY . .

EXPOSE 3002
CMD ["yarn", "start:prod"]