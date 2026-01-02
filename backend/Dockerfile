FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Expose port aplikasi
EXPOSE 5001

CMD ["node", "index.js"]