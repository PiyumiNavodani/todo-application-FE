# Stage 1: Build the React app
FROM node:18 as builder

WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built files from the builder stage to Nginx public folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 to access the React app
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
