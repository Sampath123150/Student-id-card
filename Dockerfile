# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Prepare the backend and final image
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend/ ./backend/

# Copy the built frontend static files to backend/public
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Create directories for persistent storage
RUN mkdir -p /app/uploads /app/backups

# Expose the backend port
EXPOSE 3000

# Start the application
WORKDIR /app/backend
CMD ["node", "server.js"]
