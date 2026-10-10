---
title: 部署方案
description: YeahBoot 后端服务和管理后台的构建、发布与验证建议。
---

# 部署方案

本文档仅介绍 YeahBoot 应用的构建与发布思路。官网和文档站属于项目维护方的静态站点，不提供给下游项目作为部署模板。

生产环境通常将管理后台与 API 放在同一来源下，由 Nginx、其他反向代理或网关将 `/api/**` 请求转发到后端服务，避免浏览器跨域配置。具体 Nginx 示例见[管理后台与 API 代理](/deployment/nginx)。

## 构建产物

管理后台：

```bash
npm ci
npm run build
```

产物：

```text
dist
```

后端：

```bash
mvn clean package -DskipTests
```

单入口主要产物：

```text
yeah-admin/target/yeah-admin.jar
```

## 发布原则

- 管理后台构建时固定设置 `VITE_API_BASE_URL=/api`，由环境已有的网关或反向代理处理同源转发。
- 后端采用“构建 Jar → 上传 Jar → 重启服务”的发布方式，具体进程托管参考[后端服务](/deployment/backend-service)。
- 数据库、上传目录、配置文件和日志目录应位于独立持久化位置，不放入 Jar 或前端构建产物。

## 发布顺序

1. 备份数据库和文件目录。
2. 执行经过确认的数据库增量脚本。
3. 发布后端并完成健康检查。
4. 发布管理后台构建产物。
5. 验证登录、权限、上传下载和关键页面。

静态构建产物建议使用“新目录上传 → 原子切换软链接”，减少同步中间状态。后端建议由 systemd、容器编排或进程管理平台托管。
