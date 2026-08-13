@echo off

echo "Stopping and removing existing containers..."
docker compose down

echo "Building and starting new containers..."
docker compose up -d

echo "Pruning unused Docker resources..."
docker system prune -f