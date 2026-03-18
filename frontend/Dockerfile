FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
