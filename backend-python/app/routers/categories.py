from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.config import get_db
from app.models import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    """创建分类"""
    db_category = Category(
        name=category.name,
        color=category.color,
        icon=category.icon,
        userId=1  # 临时硬编码用户ID
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db)
):
    """获取分类列表"""
    categories = db.query(Category).filter(Category.userId == 1).order_by(Category.createdAt.desc()).all()  # 临时硬编码用户ID
    return categories

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """获取单个分类"""
    category = db.query(Category).filter(Category.id == category_id, Category.userId == 1).first()  # 临时硬编码用户ID
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # 加载关联的 todos
    return category

@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """更新分类"""
    category = db.query(Category).filter(Category.id == category_id, Category.userId == 1).first()  # 临时硬编码用户ID
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """删除分类"""
    category = db.query(Category).filter(Category.id == category_id, Category.userId == 1).first()  # 临时硬编码用户ID
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}
