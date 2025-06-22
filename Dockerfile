FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create .env file if it doesn't exist
RUN touch .env

# Expose ports
EXPOSE 3000 8080

# Start the application
CMD ["npm", "start"] 