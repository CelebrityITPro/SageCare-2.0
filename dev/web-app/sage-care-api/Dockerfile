FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy source code
COPY . .

EXPOSE 5000

# Start development server with nodemon
CMD ["npx", "nodemon", "index.js"] 