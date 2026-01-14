from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import todos_router, categories_router, auth_router
from app.database.config import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    description="A modern Todo application built with FastAPI",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)
app.include_router(todos_router)
app.include_router(categories_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Todo API",
        "docs": "/docs",
        "framework": "FastAPI",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
