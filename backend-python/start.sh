#!/bin/bash

echo "Starting FastAPI Todo Backend..."
echo "API will be available at: http://localhost:3001"
echo "API Documentation: http://localhost:3001/docs"
echo ""

cd /Users/fengzhongjincao/Documents/hhCode/nestjs/backend-python
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001
