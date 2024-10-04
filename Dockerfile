# Use Node.js 20 as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Copy the entire project directory
COPY . .

# Explicitly copy the .EN file
COPY .ENV ./

# Generate Prisma client
RUN npx prisma generate

# Install tsx globally
RUN npm install -g tsx

# Expose the port your app runs on
EXPOSE 3000

# Start the application using tsx
CMD ["tsx", "src/server.ts"]