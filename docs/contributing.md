---
title: 参与开发
description: YeahBoot Issue、代码修改、验证和文档贡献约定。
---

# 参与开发

## 提交问题

Issue 建议包含：

- 使用的分支或提交版本。
- Java、Node、MySQL 和 Redis 版本。
- 最小复现步骤。
- 期望结果与实际结果。
- 去敏后的响应、日志和 `traceId`。

不要提交真实账号、密码、Token、手机号、密钥、数据库连接和证书。

## 修改范围

- 修复尽量保持最小并复用现有基础服务。
- 后端行为变化同步检查前端和资源权限。
- 新增写操作考虑 `@SysLog`。
- 新增敏感字段考虑响应隐藏和日志脱敏。
- 新增删除操作考虑关联数据、文件和 Token。
- 视图资源和接口资源分别使用 `view:`、`api:` 命名约定。

## 提交前验证

后端：

```bash
mvn clean package -DskipTests
```

前端：

```bash
npm run type-check
npm run lint
npm run build
```

文档：

```bash
npm run build
```

## Git 提交

一次提交只包含一个逻辑主题，前后端改动分别在各自仓库提交。示例：

```text
fix(auth): handle disabled users
feat(user): add excel import
docs(permission): explain resource mounts
```

不要把 IDE 配置、运行日志、构建产物和本地凭据提交到仓库。

## 文档维护

功能完成不等于文档完成。以下变化需要同步更新文档：

- 接口路径或 DTO 字段变化。
- 权限标识变化。
- 配置项、默认值变化。
- 部署目录和构建命令变化。
- 重要状态规则和安全边界变化。
