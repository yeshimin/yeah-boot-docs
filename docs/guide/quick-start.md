---
title: 快速开始
description: 从源码、数据库和 Redis 准备到启动 YeahBoot 前后端的完整步骤。
---

# 快速开始

本节以单入口模式为例：只启动 `yeah-admin`，同时承载管理端和 App 端接口。

## 环境要求

| 环境    |         建议版本 | 说明                          |
| ------- | ---------------: | ----------------------------- |
| JDK     |              21+ | 后端编译目标为 Java 21        |
| Maven   |             3.8+ | 用于多模块构建                |
| MySQL   |              8.x | 保存业务数据                  |
| Redis   |             6.x+ | Token、动态参数和验证码等缓存 |
| Node.js | 20.19+ 或 22.12+ | 管理后台 Vite 7 的运行要求    |
| npm     |     与 Node 配套 | 安装前端依赖                  |

## 1. 获取源码

<RepoCloneTabs :repos="['yeah-boot', 'yeah-boot-admin']" />

## 2. 初始化数据库

后端仓库 `sql/` 目录提供初始化数据。先导入主库脚本；只有确实需要街道、村庄数据时，才导入大体量地区扩展脚本。

完成后至少应看到用户、角色、资源、组织、岗位、字典、文件、存储、日志和系统参数等核心表。详细说明见[数据库初始化](/guide/database)。

## 3. 准备运行配置

在本地配置中填写自己的 MySQL、Redis、JWT 和文件目录。密钥类配置不要提交到公开仓库。只使用本地存储时，可以不配置七牛或 MinIO 凭据。

配置分类和安全边界见[运行配置](/guide/configuration)。

## 4. 启动后端

在后端仓库执行：

```bash
mvn clean package -DskipTests
java -jar yeah-admin/target/yeah-admin.jar
```

开发阶段也可以直接运行：

```bash
mvn -pl yeah-admin -am spring-boot:run
```

启动成功后，先确认后端端口可访问，再启动前端。若启动阶段报数据库、Redis 或存储初始化错误，先检查对应配置，不要用跳过异常的方式继续运行。

## 5. 启动管理后台

```bash
cd yeah-boot-admin
npm install
npm run dev
```

开发服务器默认把 `/api` 代理到本机后端，并去掉 `/api` 前缀。例如浏览器请求 `/api/admin/auth/login`，后端实际收到 `/admin/auth/login`。

## 6. 首次验证

依次验证：

1. 获取图形验证码并完成登录。
2. 打开首页和个人中心。
3. 打开用户、角色和资源页面。
4. 检查浏览器请求是否携带 `Authorization: Bearer <token>`。
5. 使用普通角色验证按钮隐藏与接口 403 拦截是否同时生效。
6. 上传一个测试文件并验证预览或下载。

## 7. 构建检查

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

::: tip 推荐顺序
先让后端接口独立启动成功，再启动前端；遇到页面异常时先看浏览器 Network，再使用响应中的 `traceId` 关联后端日志。
:::

## 下一步

- [理解项目结构](/guide/project-structure)
- [配置资源权限](/architecture/permission)
- [部署到服务器](/deployment/overview)
