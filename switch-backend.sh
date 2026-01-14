#!/bin/bash

# Backend Switcher Script
# This script helps you switch between different backend services

PROJECT_DIR="/Users/fengzhongjincao/Documents/hhCode/nestjs"
FRONTEND_DIR="$PROJECT_DIR/frontend"
ENV_FILE="$FRONTEND_DIR/.env"

echo "============================================"
echo "   Backend Switcher for Frontend"
echo "============================================"
echo ""
echo "Current backend configuration:"
if [ -f "$ENV_FILE" ]; then
  CURRENT_PORT=$(grep VITE_API_PORT "$ENV_FILE" | cut -d'=' -f2)
  case $CURRENT_PORT in
    3000)
      echo "   → NestJS (TypeScript) - Port 3000"
      ;;
    3001)
      echo "   → FastAPI (Python) - Port 3001"
      ;;
    3002)
      echo "   → Spring Boot (Java) - Port 3002"
      ;;
    *)
      echo "   → Unknown - Port $CURRENT_PORT"
      ;;
  esac
else
  echo "   ⚠️  No .env file found"
fi
echo ""
echo "Please select which backend to use:"
echo ""
echo "  1) NestJS (TypeScript)  - Port 3000"
echo "  2) FastAPI (Python)      - Port 3001"
echo "  3) Spring Boot (Java)    - Port 3002"
echo "  4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    PORT="3000"
    NAME="NestJS (TypeScript)"
    ;;
  2)
    PORT="3001"
    NAME="FastAPI (Python)"
    ;;
  3)
    PORT="3002"
    NAME="Spring Boot (Java)"
    ;;
  4)
    echo ""
    echo "👋 Goodbye!"
    exit 0
    ;;
  *)
    echo ""
    echo "❌ Invalid choice. Please run the script again and select 1-4."
    exit 1
    ;;
esac

echo ""
echo "🔄 Switching frontend to $NAME (Port $PORT)..."

# Update .env file
echo "VITE_API_PORT=$PORT" > "$ENV_FILE"

echo "✅ Configuration updated!"
echo ""
echo "📝 .env file now contains:"
cat "$ENV_FILE"
echo ""
echo "🚀 Next steps:"
echo "   1. Make sure $NAME backend is running on port $PORT"
echo "   2. Restart the frontend dev server:"
echo "      cd $FRONTEND_DIR"
echo "      npm run dev"
echo ""
echo "✨ Done! Frontend will now connect to $NAME"
