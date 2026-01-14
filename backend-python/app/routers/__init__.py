from app.routers.todos import router as todos_router
from app.routers.categories import router as categories_router
from app.routers.auth import router as auth_router

__all__ = ["todos_router", "categories_router", "auth_router"]
