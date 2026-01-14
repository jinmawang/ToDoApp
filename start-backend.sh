#!/bin/bash

# Todo Backend - Language Selection Script
# This script allows you to choose which backend language to start

echo "============================================"
echo "   Todo Application Backend Selection"
echo "============================================"
echo ""
echo "Please select which backend to start:"
echo ""
echo "  1) NestJS (TypeScript)  - Port 3000"
echo "  2) FastAPI (Python)      - Port 3001"
echo "  3) Spring Boot (Java)    - Port 3002"
echo "  4) Start all backends"
echo "  5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Starting NestJS Backend (TypeScript)..."
    echo "   Port: 3000"
    echo ""
    cd backend && npm run start:dev
    ;;
  2)
    echo ""
    echo "🚀 Starting FastAPI Backend (Python)..."
    echo "   Port: 3001"
    echo ""
    cd backend-python && PYTHONPATH=/Users/fengzhongjincao/Documents/hhCode/nestjs/backend-python python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001
    ;;
  3)
    echo ""
    echo "🚀 Starting Spring Boot Backend (Java)..."
    echo "   Port: 3002"
    echo ""
    cd backend-java && mvn spring-boot:run
    ;;
  4)
    echo ""
    echo "🚀 Starting ALL Backends..."
    echo ""

    # Start NestJS
    echo "Starting NestJS (Port 3000)..."
    cd backend && npm run start:dev &
    NESTJS_PID=$!
    cd ..

    # Start FastAPI
    echo "Starting FastAPI (Port 3001)..."
    cd backend-python && PYTHONPATH=/Users/fengzhongjincao/Documents/hhCode/nestjs/backend-python python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001 &
    FASTAPI_PID=$!
    cd ..

    # Start Spring Boot
    echo "Starting Spring Boot (Port 3002)..."
    cd backend-java && mvn spring-boot:run &
    JAVA_PID=$!
    cd ..

    echo ""
    echo "✅ All backends started!"
    echo "   NestJS (PID: $NESTJS_PID)  - http://localhost:3000"
    echo "   FastAPI (PID: $FASTAPI_PID)  - http://localhost:3001"
    echo "   Spring Boot (PID: $JAVA_PID) - http://localhost:3002"
    echo ""
    echo "Press Ctrl+C to stop all backends..."

    # Wait for all background processes
    wait $NESTJS_PID $FASTAPI_PID $JAVA_PID
    ;;
  5)
    echo ""
    echo "👋 Goodbye!"
    exit 0
    ;;
  *)
    echo ""
    echo "❌ Invalid choice. Please run the script again and select 1-5."
    exit 1
    ;;
esac
