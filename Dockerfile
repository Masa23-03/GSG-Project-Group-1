FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build


EXPOSE 3000

CMD ["sh", "-lc", "set -e; npx prisma migrate deploy; node dist/src/seeds/seed.js; node dist/src/main.js"]
