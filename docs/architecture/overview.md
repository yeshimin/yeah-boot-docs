---
title: 整体架构
description: YeahBoot 的运行入口、模块依赖、请求链路与设计边界。
---

# 整体架构

YeahBoot 后端采用 Maven 多模块结构，管理后台独立部署。模块划分的目标是让启动入口、业务能力、通用数据和底层框架各有明确位置。

```text
浏览器 / App
      │
      ▼
Nginx / API Gateway
      │
      ├── /admin/**
      ├── /app/**
      └── /public/**
      │
      ▼
yeah-admin / yeah-app
      │
      ├── UPMS / Basic / Public 业务模块
      ├── Biz Data / Biz Service 通用业务
      └── Auth / Storage / MQ / WebSocket 基础框架
                 │
                 ▼
          MySQL / Redis / 文件存储
```

## 单入口与双入口

### 单入口

只启动 `yeah-admin`，由它组合 Admin、App 和公开模块。优点是部署简单、端口少，适合快速交付、中小项目和公开 Demo。

### 双入口

分别启动 `yeah-admin` 与 `yeah-app`。适合以下场景：

- 管理端与 App 需要独立扩容。
- 两类接口需要不同网络边界。
- 发布周期和可用性要求不同。
- 希望分别设置限流、线程池或资源配额。

无论采用哪种模式，接口仍通过 `/admin`、`/app` 和 `/public` 区分语义。

## 请求处理链路

典型受保护请求会经历：

1. Trace ID 过滤器建立请求上下文。
2. Spring Security 判断是否为公开接口。
3. Bearer Token 解析并验证 JWT。
4. Redis 校验服务端 Token 是否仍有效。
5. 查询当前用户、启用角色和启用资源。
6. `@PreAuthorize` 检查权限字符串。
7. Controller 校验协议参数。
8. Service 执行业务规则与事务。
9. Repo、Mapper 访问数据库。
10. 统一返回结构附带 `traceId`。

## 代码职责

| 层次       | 主要职责                               | 不建议承担的职责   |
| ---------- | -------------------------------------- | ------------------ |
| Controller | 路由、权限入口、参数校验、返回封装     | 复杂事务和跨表规则 |
| Service    | 业务规则、关联校验、事务、外部能力协调 | 直接拼接客户端 SQL |
| Repo       | 可复用查询和数据操作                   | HTTP 协议逻辑      |
| Mapper     | MyBatis 映射与明确 SQL                 | 页面展示判断       |
| 前端 View  | 交互、展示、表单和状态反馈             | 代替后端鉴权       |

## 设计原则

- 前端隐藏不等于安全，后端必须独立鉴权。
- 通用 CRUD 适合基础操作，复杂业务使用专用接口。
- 配置分为启动配置和运行时系统参数。
- 逻辑删除提供数据恢复可能，但重要操作仍需业务关联检查。
- 优先使用现有 Service、Repo 和统一工具，不重复实现相同规则。
