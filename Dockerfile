FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]