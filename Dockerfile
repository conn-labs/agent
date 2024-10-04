# Use a Node.js base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript files
RUN npx tsc

# Expose the port your service runs on
EXPOSE 3000

# Command to run the compiled TypeScript file
CMD ["node", "dist/microservice.js"]  # Adjust to your compiled output
