FROM node:24-slim AS base
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
