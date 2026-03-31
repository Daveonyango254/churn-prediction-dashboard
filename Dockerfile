# Multi-stage build for React frontend and Python backend
# Stage 1: Build the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY apps/churn_dashboard/frontend/package*.json ./
RUN npm install
COPY apps/churn_dashboard/frontend/ ./
RUN npm run build

# Stage 2: Final image with Python backend and static frontend
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY apps/churn_dashboard/backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY apps/churn_dashboard/backend/ ./backend/

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port (example 8000)
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Command to run the application (assuming a production server like gunicorn or similar)
# For now, we will use a generic placeholder command
CMD ["python", "backend/main.py"]
