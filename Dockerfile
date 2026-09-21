# ---------- Stage 1: build the React frontend ----------
FROM node:20-alpine AS web-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: production API + serve frontend ----------
FROM node:20-alpine AS api
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
# Serve the built frontend from the API (single-service deploy)
COPY --from=web-build /app/frontend/dist ./public
RUN mkdir -p uploads/resumes uploads/avatars
EXPOSE 5000
CMD ["node", "server.js"]
