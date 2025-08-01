FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

EXPOSE 5173

# Start development server with hot-reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 