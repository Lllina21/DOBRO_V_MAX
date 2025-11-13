FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование кода
COPY . .

# Создание директории для БД
RUN mkdir -p /app/data

# Открываем порт
EXPOSE 3000

# Запуск бота
CMD ["node", "server.js"]
