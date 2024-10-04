# Stage 1: Build the application
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run db

# Compile TypeScript code
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy compiled files and dependencies from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/microservice.js"]