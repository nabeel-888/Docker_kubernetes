FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source (includes public/ frontend files)
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
