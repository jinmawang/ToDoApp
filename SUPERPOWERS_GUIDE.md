# Superpowers 使用指南

## 📖 什么是 Superpowers？

**Superpowers** 是一个为 Claude Code 编码代理构建的完整软件开发工作流程。它基于一组可组合的"技能"（skills）和初始指令，让你的 AI 代理能够更智能地完成开发任务。

### 核心理念

当你的 AI 代理开始构建项目时，它**不会**立即跳入编写代码。相反：

1. 🔍 **先理解需求** - 通过对话明确你真正想要什么
2. 📝 **展示设计** - 分段展示设计，便于阅读和理解
3. 📋 **制定计划** - 创建清晰的实施计划
4. 🤖 **执行开发** - 通过子代理驱动开发，自主工作数小时

---

## 🚀 安装指南

### Claude Code（通过插件市场）

**1. 注册市场**
```bash
/plugin marketplace add obra/superpowers-marketplace
```

**2. 安装插件**
```bash
/plugin install superpowers@superpowers-marketplace
```

**3. 验证安装**

检查是否看到以下命令：
```bash
# 应该看到：
/superpowers:brainstorm        # 交互式设计优化
/superpowers:write-plan        # 创建实施计划
/superpowers:execute-plan      # 批量执行计划
```

**4. 更新插件**
```bash
/plugin update superpowers
```

---

## 🔄 基本工作流程

Superpowers 包含 **7 个核心工作流**，按顺序自动触发：

### 1️⃣ **Brainstorming（头脑风暴）**

- **触发时机**：编写代码之前
- **作用**：通过问题细化想法，探索替代方案，分段验证设计
- **输出**：保存设计文档到 `docs/plans/YYYY-MM-DD-<topic>-design.md`

**工作方式：**
- 检查当前项目状态（文件、文档、最近的提交）
- 每次只问一个问题
- 优先使用选择题，但开放性问题也可以
- 理解目标：目的、约束、成功标准

### 2️⃣ **Using Git Worktrees（使用 Git 工作树）**

- **触发时机**：设计批准后
- **作用**：
  - 在新分支创建隔离工作空间
  - 运行项目设置
  - 验证测试基线

**工作方式：**
- 询问："准备好设置实施了吗？"
- 使用 Git 工作树创建隔离环境
- 验证现有测试通过

### 3️⃣ **Writing Plans（编写计划）**

- **触发时机**：有批准的设计后
- **作用**：
  - 将工作分解为小任务（每个 2-5 分钟）
  - 每个任务都有确切的文件路径
  - 包含完整代码和验证步骤

**计划特点：**
- 强调真正的 RED-GREEN TDD
- YAGNI（你不需要它）
- DRY（不要重复自己）

### 4️⃣ **Subagent-Driven Development 或 Executing Plans**

- **触发时机**：有计划后

**选项 A：子代理驱动开发** (`subagent-driven-development`)
- 每个任务分派新的子代理
- 两阶段审查：
  1. 规范符合性审查
  2. 代码质量审查
- 快速迭代，自主工作数小时

**选项 B：执行计划** (`executing-plans`)
- 批量执行多个任务
- 人工检查点
- 更快的执行速度

### 5️⃣ **Test-Driven Development（测试驱动开发）**

- **触发时机**：实施期间
- **强制执行**：RED-GREEN-REFACTOR 循环
  - 🔴 编写失败的测试
  - 🟢 编写最小代码使其通过
  - 🔵 重构优化
- **规则**：删除在测试之前编写的代码

**包含内容：**
- 测试反模式参考
- 何时测试特定行为
- 何时测试前端组件
- 测试工具选择指南

### 6️⃣ **Requesting Code Review（请求代码审查）**

- **触发时机**：任务之间
- **作用**：
  - 根据计划审查代码
  - 按严重程度报告问题
  - 关键问题会阻止进度

### 7️⃣ **Finishing a Development Branch（完成开发分支）**

- **触发时机**：任务完成时
- **作用**：
  - 验证所有测试通过
  - 提供选项：合并/PR/保留/丢弃
  - 清理工作树

**选项包括：**
- 合并到主分支并删除工作树
- 创建 PR 并保留工作树以供审查
- 保持工作树活跃以继续工作
- 放弃工作树（保留主分支）

---

## 🛠️ 技能库详解

### 测试相关

#### **test-driven-development**
- RED-GREEN-REFACTOR 循环
- 包含测试反模式参考
- 强制先写测试后写代码

### 调试相关

#### **systematic-debugging**
- 4 阶段根因分析过程
- 包含技能：
  - `root-cause-tracing`（根因追踪）
  - `defense-in-depth`（深度防御）
  - `condition-based-waiting`（基于条件的等待）

#### **verification-before-completion**
- 确保问题真正得到修复
- 不满足于"看起来可以了"

### 协作相关

#### **brainstorming**
- 苏格拉底式设计优化
- 通过问题细化想法
- 探索 2-3 种不同方案
- 展示权衡和推荐

#### **writing-plans**
- 详细的实施计划
- 每个任务可独立完成
- 包含验证步骤

#### **executing-plans**
- 带检查点的批量执行
- 允许人工干预
- 更快的执行速度

#### **dispatching-parallel-agents**
- 并发子代理工作流
- 处理 2+ 个独立任务
- 无共享状态或顺序依赖

#### **requesting-code-review**
- 预审查清单
- 根据计划检查
- 按严重程度分类问题

#### **receiving-code-review**
- 响应反馈
- 区分有效和无效反馈
- 需要技术严谨性

#### **using-git-worktrees**
- 并行开发分支
- 每个工作树隔离
- 更好的分支管理

#### **finishing-a-development-branch**
- 合并/PR 决策工作流
- 提供结构化选项
- 清理工作树

#### **subagent-driven-development**
- 两阶段审查的快速迭代
  1. 规范符合性审查
  2. 代码质量审查
- 自主工作数小时

### 元技能

#### **writing-skills**
- 创建新技能的最佳实践
- 包含测试方法论
- 遵循技能模板

#### **using-superpowers**
- 技能系统介绍
- 如何使用技能
- 如何配置工作流

---

## 🎯 哲学原则

1. **测试驱动开发** - 始终先写测试
2. **系统化而非临时** - 流程重于猜测
3. **降低复杂性** - 简单性是首要目标
4. **证据重于声明** - 验证后再声明成功

### 核心价值观

- **TDD（测试驱动开发）**：编写代码之前先编写测试
- **系统化而非临时**：遵循流程而不是猜测
- **复杂性降低**：简单性是主要目标
- **证据而非声明**：在声称成功之前进行验证

---

## 📚 使用示例

### 场景 1：开始新功能

```bash
# 1. 开始头脑风暴
/superpowers:brainstorm

# Claude 会问：
# - 你想构建什么？
# - 这个功能的目标是什么？
# - 有什么约束条件？
# - 预期的结果是什么？
# ...

# 2. 设计确认后，创建 Git 工作树
# 自动触发 using-git-worktrees

# 3. 编写实施计划
# 自动触发 writing-plans

# 4. 执行计划（选择一个）
# 选项 A：子代理驱动开发（推荐）
# 自动触发 subagent-driven-development

# 选项 B：批量执行
/superpowers:execute-plan
```

### 场景 2：遇到 Bug

```bash
# 1. 使用系统性调试
# 自动触发 systematic-debugging

# Claude 会：
# - 收集错误信息
# - 追踪根因
# - 提出修复方案
# - 验证修复

# 2. 确认修复
# 自动触发 verification-before-completion
```

### 场景 3：代码审查

```bash
# 请求代码审查
/superpowers:code-review

# Claude 会：
# - 根据计划审查
# - 按严重程度报告问题
# - 提供改进建议
# - 阻止关键问题
```

### 场景 4：并行任务

```bash
# 当有 2+ 个独立任务时
# 自动触发 dispatching-parallel-agents

# Claude 会：
# - 识别独立任务
# - 并发启动子代理
# - 协调完成状态
```

---

## 💡 最佳实践

### ✅ DO（推荐做法）

1. **让 Claude 引导流程**
   - Superpowers 会自动检测并触发相应技能
   - 不需要记住所有命令

2. **分段验证设计**
   - 仔细阅读每个设计段落再批准
   - 有问题立即反馈

3. **遵循 TDD**
   - 始终先写测试，再写代码
   - 不要跳过 RED-GREEN-REFACTOR 循环

4. **保持任务小**
   - 每个任务 2-5 分钟完成
   - 小任务更容易跟踪和调试

5. **信任流程**
   - 系统化的方法比临时方法更可靠
   - 按照步骤来，不要跳过

6. **使用 Git 工作树**
   - 为每个功能创建隔离的工作空间
   - 保持主分支干净

7. **代码审查很重要**
   - 认真对待审查反馈
   - 技术严谨性是关键

### ❌ DON'T（避免做法）

1. **不要跳过设计阶段**
   - 直接写代码会导致返工
   - 设计是基础

2. **不要忽略测试**
   - 没有测试的代码无法验证
   - TDD 是强制性的

3. **不要一次性做太多**
   - 大任务难以跟踪和调试
   - 分解为小任务

4. **不要绕过代码审查**
   - 审查能捕获早期错误
   - 关键问题会阻止进度

5. **不要偏离计划**
   - 计划是经过深思熟虑的
   - 偏离可能导致问题

6. **不要忽略子代理反馈**
   - 规范符合性审查很重要
   - 代码质量审查同样重要

---

## 🔧 故障排查

### 插件未安装

**问题**：找不到 superpowers 命令

**解决方案**：
```bash
# 检查插件状态
/plugin list

# 重新安装
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# 验证
/plugin list | grep superpowers
```

### 技能未触发

**问题**：技能应该自动触发但没有

**可能原因**：
- 任务不符合触发条件
- 技能被禁用
- 配置问题

**解决方案**：
```bash
# 检查任务类型
# 设计阶段：/superpowers:brainstorm
# 计划阶段：/superpowers:write-plan
# 执行阶段：/superpowers:execute-plan

# 显式调用技能
/superpowers:brainstorm
```

### Git 工作树问题

**问题**：Git 工作树创建失败

**解决方案**：
```bash
# 检查 Git 状态
git status

# 列出工作树
git worktree list

# 清理工作树
git worktree prune

# 删除特定工作树
git worktree remove <path>
```

### 测试失败

**问题**：测试在 TDD 循环中失败

**解决方案**：
- 确保遵循 RED-GREEN-REFACTOR
- 先写测试，再写代码
- 检查测试是否真正失败（RED 阶段）
- 编写最小代码使其通过（GREEN 阶段）
- 重构优化（REFACTOR 阶段）

---

## 📖 进阶阅读

### 官方资源

- **GitHub 仓库**：https://github.com/obra/superpowers
- **问题反馈**：https://github.com/obra/superpowers/issues
- **插件市场**：https://github.com/obra/superpowers-marketplace
- **许可证**：MIT License

### 相关文档

- `docs/README.claude-code.md` - Claude Code 详细文档
- `docs/README.codex.md` - Codex 详细文档
- `docs/README.opencode.md` - OpenCode 详细文档
- `skills/writing-skills/SKILL.md` - 创建新技能指南

---

## 🤝 贡献指南

想要贡献新技能？

### 步骤

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上 Fork
   git clone https://github.com/YOUR_USERNAME/superpowers.git
   cd superpowers
   git checkout -b your-skill-branch
   ```

2. **创建技能**
   - 遵循 `writing-skills` 技能的指导
   - 包含完整的测试
   - 添加文档

3. **测试技能**
   ```bash
   # 使用 writing-skills 技能创建和测试
   /superpowers:write-skill
   ```

4. **提交 PR**
   ```bash
   git add .
   git commit -m "Add new skill: your-skill"
   git push origin your-skill-branch
   # 在 GitHub 上创建 Pull Request
   ```

详见 `skills/writing-skills/SKILL.md`

---

## 📊 技能速查表

| 技能 | 触发时机 | 主要作用 | 输出 |
|------|---------|---------|------|
| **brainstorming** | 编码前 | 设计优化和需求澄清 | 设计文档 |
| **using-git-worktrees** | 设计后 | 创建隔离工作空间 | Git 工作树 |
| **writing-plans** | 有设计后 | 分解为小任务 | 实施计划 |
| **subagent-driven-development** | 有计划后 | 快速迭代开发 | 完成的功能 |
| **executing-plans** | 有计划后 | 批量执行 | 完成的功能 |
| **test-driven-development** | 实施中 | TDD 循环 | 测试 + 代码 |
| **requesting-code-review** | 任务间 | 代码审查 | 审查报告 |
| **systematic-debugging** | 遇到 Bug | 根因分析 | 修复方案 |
| **verification-before-completion** | 修复后 | 验证修复 | 确认修复 |
| **finishing-a-development-branch** | 完成时 | 清理和合并 | 合并的代码 |
| **dispatching-parallel-agents** | 多个独立任务 | 并发执行 | 完成的任务 |

---

## 🎓 学习路径

### 初学者

1. 阅读"什么是 Superpowers"
2. 安装插件
3. 尝试 `/superpowers:brainstorm`
4. 遵循工作流程

### 中级用户

1. 理解 7 个核心工作流
2. 使用 Git 工作树
3. 遵循 TDD 实践
4. 编写自己的计划

### 高级用户

1. 创建自定义技能
2. 贡献到开源项目
3. 优化工作流程
4. 帮助他人学习

---

## 💼 实际应用案例

### 案例 1：Web 应用开发

```
1. brainstorming → 设计用户认证系统
2. using-git-worktrees → 创建 feature/auth 分支
3. writing-plans → 分解为 15 个小任务
4. subagent-driven-development → 自主完成所有任务
5. test-driven-development → 每个功能都有测试
6. requesting-code-review → 确保代码质量
7. finishing-a-development-branch → 合并到主分支
```

### 案例 2：Bug 修复

```
1. systematic-debugging → 找到根本原因
2. brainstorming → 设计修复方案
3. test-driven-development → 编写失败测试
4. subagent-driven-development → 实施修复
5. verification-before-completion → 确认修复
```

### 案例 3：性能优化

```
1. brainstorming → 确定优化目标
2. writing-plans → 创建优化计划
3. executing-plans → 批量执行优化
4. test-driven-development → 验证性能提升
5. requesting-code-review → 确保代码质量
```

---

## 🔍 常见问题（FAQ）

### Q：Superpowers 支持哪些平台？

**A**：
- **Claude Code**：通过插件市场（推荐）
- **Codex**：手动安装
- **OpenCode**：手动安装

### Q：技能会自动触发吗？

**A**：是的，大多数技能会在适当的时机自动触发。但你也可以显式调用：
```bash
/superpowers:brainstorm
/superpowers:write-plan
/superpowers:execute-plan
```

### Q：我必须使用所有技能吗？

**A**：不完全是。核心技能（brainstorming, writing-plans, test-driven-development）强烈推荐，但你可以根据需要选择其他技能。

### Q：可以自定义技能吗？

**A**：可以！使用 `writing-skills` 技能创建自己的技能，并遵循最佳实践。

### Q：Superpowers 适合什么规模的项目？

**A**：
- ✅ 小型项目：非常适合
- ✅ 中型项目：理想选择
- ✅ 大型项目：可以通过工作树很好地管理
- ⚠️ 微型项目：可能有点大材小用

### Q：如何更新技能？

**A**：
```bash
/plugin update superpowers
```

### Q：技能会修改我的代码吗？

**A**：有些技能会（如 subagent-driven-development），但：
- 始终先有设计
- 始终先有计划
- 始终先有测试
- 你可以在每个阶段审查

---

## 📈 性能和效率

### 使用 Superpowers 的优势

1. **更高的代码质量**
   - TDD 确保测试覆盖
   - 代码审查确保质量
   - 系统化流程减少错误

2. **更快的开发速度**
   - 子代理可以并发工作
   - 减少返工
   - 自动化流程

3. **更好的文档**
   - 设计文档自动保存
   - 实施计划清晰明确
   - 代码审查记录完整

4. **更强的可维护性**
   - Git 工作树隔离功能
   - 清晰的分支策略
   - 完整的测试覆盖

---

## 🎉 总结

Superpowers 是一个强大的软件开发工作流程系统，它：

- ✅ 强调测试驱动开发
- ✅ 提供系统化的开发流程
- ✅ 支持自动化的子代理协作
- ✅ 确保代码质量和文档完整性
- ✅ 适合各种规模的项目

通过遵循 Superpowers 的流程，你可以：
- 🚀 提高开发效率
- 📦 提升代码质量
- 📚 改善文档完整性
- 🤖 最大化 AI 代理的自主性

**开始使用 Superpowers，让你的开发工作流更上一层楼！**

---

**版本**：基于 main 分支
**最后更新**：2026-01-13
**作者**：Jesse & Contributors
**许可证**：MIT License

**致谢**：感谢所有为 Superpowers 做出贡献的开发者！

---

## 📞 获取帮助

- **GitHub Issues**：https://github.com/obra/superpowers/issues
- **文档**：https://github.com/obra/superpowers/tree/main/docs
- **示例**：https://github.com/obra/superpowers/tree/main/examples

---

**Happy Coding with Superpowers! 🚀**
