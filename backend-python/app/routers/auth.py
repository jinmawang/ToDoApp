from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.config import get_db
from app.models import User
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, UserUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已存在"
        )

    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="邮箱已被注册"
        )

    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )

    # 验证密码
    if not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )

    # 创建访问令牌
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "username": user.username}
    )

    # 返回用户信息和令牌
    return Token(
        accessToken=access_token,
        user=UserResponse.from_orm(user)
    )

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user

@router.patch("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    # 如果要更新用户名，检查是否重复
    if update_data.username and update_data.username != current_user.username:
        existing_user = db.query(User).filter(User.username == update_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已存在"
            )
        current_user.username = update_data.username

    # 如果要更新邮箱，检查是否重复
    if update_data.email and update_data.email != current_user.email:
        existing_email = db.query(User).filter(User.email == update_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被使用"
            )
        current_user.email = update_data.email

    # 如果要更新密码，加密新密码
    if update_data.password:
        current_user.password = get_password_hash(update_data.password)

    # 更新头像
    if update_data.avatar is not None:
        current_user.avatar = update_data.avatar

    db.commit()
    db.refresh(current_user)

    return current_user
