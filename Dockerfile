FROM node:22-alpine AS base
WORKDIR /app
RUN apk add openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

FROM base AS dev
RUN npm install nodemon -g
RUN npm run build:dev
CMD ["npm", "run", "start:dev"]

FROM base AS prod
RUN npx prisma generate
RUN npm run build:prod
CMD ["npm", "run", "start:prod"]
