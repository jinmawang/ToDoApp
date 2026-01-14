"""
安全模块：密码加密和 JWT token 处理

作用：
1. 密码加密：使用 bcrypt 算法加密密码（不可逆）
2. 密码验证：比对明文密码和加密后的密码
3. Token 生成：创建 JWT access token
4. Token 解码：验证并解析 JWT token

JWT (JSON Web Token)：
- 是一种安全地在各方之间传递信息的标准
- 由三部分组成：Header（头）、Payload（载荷）、Signature（签名）
- 优点：无状态、跨语言、体积小
- 缺点：token 较大，无法撤销（只能等待过期）
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from os import getenv

# 密码加密上下文
# bcrypt 是一种安全的密码哈希算法
# deprecated="auto" 表示自动使用最新的推荐算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
SECRET_KEY = getenv("JWT_SECRET", "your-secret-key-change-in-production")  # 签名密钥（必须保密）
ALGORITHM = "HS256"  # 签名算法（HMAC-SHA256）
ACCESS_TOKEN_EXPIRE_MINUTES = int(getenv("JWT_EXPIRE_MINUTES", 7 * 24 * 60))  # 默认7天


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码

    过程：
    1. 从数据库中获取加密后的密码
    2. 使用 bcrypt 算法比对用户输入的明文密码
    3. bcrypt 会自动处理加盐，因此不需要手动加盐

    Args:
        plain_password: 用户输入的明文密码
        hashed_password: 数据库中存储的加密密码

    Returns:
        bool: 密码是否匹配

    使用示例：
        if verify_password(user_input, stored_hash):
            print("密码正确")
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    加密密码

    过程：
    1. 使用 bcrypt 算法对密码进行哈希
    2. 自动生成随机盐值（salt）
    3. 返回加密后的密码（60 字符字符串）

    Args:
        password: 明文密码

    Returns:
        str: 加密后的密码（可以安全地存储在数据库中）

    注意：
        - bcrypt 是单向哈希，无法解密
        - 每次加密相同的密码，结果都不同（因为随机盐）
        - 验证时必须使用 verify_password 函数

    使用示例：
        hashed = get_password_hash("myPassword123")
        # 存储到数据库...
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建访问令牌 (JWT)

    过程：
    1. 复制要编码的数据（payload）
    2. 添加过期时间（exp 字段）
    3. 使用密钥和算法签名生成 JWT

    Args:
        data: 要编码到 token 中的数据（通常是用户信息）
            常见字段：
            - sub: 用户 ID (subject)
            - email: 用户邮箱
            - username: 用户名
        expires_delta: 自定义过期时间（可选）

    Returns:
        str: JWT token 字符串

    Token 结构示例：
        Header: {"alg": "HS256", "typ": "JWT"}
        Payload: {"sub": 1, "email": "user@example.com", "exp": 1234567890}
        Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)

    使用示例：
        token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=timedelta(hours=24)
        )
    """
    to_encode = data.copy()

    # 计算过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # 添加过期时间到 payload
    to_encode.update({"exp": expire})

    # 生成 JWT token
    # 格式：base64(header).base64(payload).signature
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    解码访问令牌

    过程：
    1. 验证 token 签名（确保未被篡改）
    2. 检查 token 是否过期
    3. 解码并返回 payload 数据

    Args:
        token: JWT token 字符串

    Returns:
        Optional[dict]: 解码后的 payload 数据，如果 token 无效则返回 None

    使用示例：
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            print(f"用户 ID: {user_id}")
        else:
            print("Token 无效或已过期")
    """
    try:
        # 解码 token
        # jwt.decode 会自动：
        # 1. 验证签名
        # 2. 检查过期时间
        # 3. 返回 payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Token 无效、过期或签名错误
        return None
