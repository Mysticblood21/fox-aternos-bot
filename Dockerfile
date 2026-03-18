FROM ghcr.io/puppeteer/puppeteer:22.0.0

USER root

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R pptruser:pptruser /app

USER pptruser

CMD ["node", "bot.js"]
