# Frontend API Configuration

## 📖 概述

前端现在支持**动态切换后端服务**，无需修改代码，只需要更改环境变量即可。

## 🎯 支持的后端

| 后端语言 | 框架 | 端口 | 环境变量值 |
|---------|------|------|-----------|
| **TypeScript** | NestJS | 3000 | `VITE_API_PORT=3000` |
| **Python** | FastAPI | 3001 | `VITE_API_PORT=3001` |
| **Java** | Spring Boot | 3002 | `VITE_API_PORT=3002` |

## 🚀 快速切换方法

### 方法 1：修改 .env 文件（推荐）

1. 打开 `frontend/.env` 文件
2. 修改 `VITE_API_PORT` 的值：

```bash
# 使用 NestJS (TypeScript)
VITE_API_PORT=3000

# 使用 FastAPI (Python)
VITE_API_PORT=3001

# 使用 Spring Boot (Java)
VITE_API_PORT=3002
```

3. 重启前端开发服务器：
```bash
cd frontend
npm run dev
```

### 方法 2：使用切换脚本（最简单）

```bash
cd /Users/fengzhongjincao/Documents/hhCode/nestjs
./switch-backend.sh
```

然后选择：
- `1` - 切换到 NestJS (TypeScript) - 端口 3000
- `2` - 切换到 FastAPI (Python) - 端口 3001
- `3` - 切换到 Spring Boot (Java) - 端口 3002

脚本会自动：
1. 修改 `.env` 文件
2. 重启前端开发服务器
3. 显示当前使用的后端

### 方法 3：命令行直接设置（临时）

```bash
cd frontend

# 使用 NestJS
VITE_API_PORT=3000 npm run dev

# 使用 FastAPI
VITE_API_PORT=3001 npm run dev

# 使用 Spring Boot
VITE_API_PORT=3002 npm run dev
```

**注意**：这种方法只在当前会话有效，关闭终端后失效。

## 📂 配置文件说明

### `frontend/.env`
环境变量配置文件，定义后端 API 端口：

```bash
VITE_API_PORT=3000
```

### `frontend/src/config/api.ts`
API 配置文件，自动读取环境变量并生成 API 端点：

```typescript
const API_PORT = import.meta.env.VITE_API_PORT || '3000'
export const API_BASE_URL = `http://localhost:${API_PORT}`
export const API_ENDPOINTS = {
  todos: `${API_BASE_URL}/todos`,
  categories: `${API_BASE_URL}/categories`,
}
```

## 🔍 验证当前使用的后端

### 方法 1：查看浏览器控制台
打开浏览器开发者工具（F12），在 Console 中可以看到当前使用的后端。

### 方法 2：查看网络请求
打开浏览器开发者工具 → Network 标签，查看 API 请求的目标端口：
- `localhost:3000` → NestJS (TypeScript)
- `localhost:3001` → FastAPI (Python)
- `localhost:3002` → Spring Boot (Java)

### 方法 3：查看 .env 文件
```bash
cat frontend/.env
```

## 🛠️ 工作原理

1. **环境变量读取**：Vite 通过 `import.meta.env.VITE_API_PORT` 读取 `.env` 文件
2. **动态配置**：`src/config/api.ts` 根据环境变量生成 API 端点
3. **自动注入**：所有 Store 文件（`todo.ts`、`category.ts`）导入配置文件
4. **无缝切换**：修改 `.env` 后重启前端，自动连接到新的后端

## ⚠️ 注意事项

1. **必须重启前端服务器**：修改 `.env` 文件后，必须重启 `npm run dev` 才能生效
2. **确保后端已启动**：切换端口前，确保对应的后端服务已经启动
   - NestJS: `cd backend && npm run start:dev`
   - FastAPI: `cd backend-python && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001`
   - Spring Boot: `cd backend-java && mvn spring-boot:run`
3. **端口冲突**：确保端口没有被其他程序占用

## 📊 完整使用流程示例

### 场景：从 NestJS 切换到 FastAPI

1. **启动 FastAPI 后端**：
   ```bash
   cd backend-python
   python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 3001
   ```

2. **切换前端配置**：
   ```bash
   cd /Users/fengzhongjincao/Documents/hhCode/nestjs
   ./switch-backend.sh
   # 选择 2
   ```

3. **验证切换成功**：
   - 打开浏览器
   - F12 打开开发者工具
   - 查看 Network 标签
   - 确认请求发送到 `localhost:3001`

## 🎉 优势

✅ **无需修改代码**：只修改环境变量即可
✅ **快速切换**：支持 3 种不同语言后端
✅ **类型安全**：TypeScript 配置文件，编译时检查
✅ **统一管理**：所有 API 端点集中在配置文件
✅ **易于扩展**：未来添加更多后端只需修改配置

---

**版本**: 1.0.0
**最后更新**: 2026-01-09
