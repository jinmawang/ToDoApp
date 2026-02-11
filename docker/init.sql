-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 确保数据库存在
CREATE DATABASE IF NOT EXISTS todo_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE todo_db;

-- 授予权限
GRANT ALL PRIVILEGES ON todo_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
