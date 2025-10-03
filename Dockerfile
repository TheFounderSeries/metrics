FROM node:20-alpine

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server only (this image is for the backend)
COPY server ./server

ENV NODE_ENV=production

# Cloud Run sets $PORT; our server reads process.env.PORT
CMD ["node", "server/index.js"]


