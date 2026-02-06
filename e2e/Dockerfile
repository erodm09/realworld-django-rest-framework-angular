FROM mcr.microsoft.com/playwright:v1.58.1-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY config.yaml playwright.config.ts tsconfig.json ./
COPY tests/ tests/
COPY utils/ utils/

CMD ["npx", "playwright", "test"]
