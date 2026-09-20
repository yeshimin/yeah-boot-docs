---
title: 部署方案
description: YeahBoot 官网、文档、管理后台和后端 API 的推荐生产部署结构。
---

# 部署方案

推荐使用三个域名入口：

| 域名                | 内容              | 部署方式                  |
| ------------------- | ----------------- | ------------------------- |
| `yeahboot.com`      | 官方主站          | 原生静态文件              |
| `docs.yeahboot.com` | VitePress 文档    | 构建后的静态文件          |
| `demo.yeahboot.com` | 管理后台与 `/api` | Vue dist + Nginx 反向代理 |

管理后台和 API 同源：

```text
https://demo.yeahboot.com/
https://demo.yeahboot.com/api/**
```

这样只需要为浏览器配置一个演示域名，避免额外跨域。

## 推荐目录

```text
/srv/yeahboot/site               官网
/srv/yeahboot/docs               文档构建结果
/srv/yeahboot/admin              管理后台 dist
/opt/yeahboot/backend            后端 Jar
/var/lib/yeahboot/upload         本地上传文件
/var/log/yeahboot                应用日志
```

## 构建产物

主站无需构建，直接同步 HTML、CSS、JS 和图片。

文档：

```bash
npm ci
npm run build
```

产物：

```text
docs/.vitepress/dist
```

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

## 发布顺序

1. 备份数据库和文件目录。
2. 执行经过确认的数据库增量脚本。
3. 发布后端并完成健康检查。
4. 发布管理后台静态文件。
5. 发布文档和主站。
6. 验证登录、权限、上传下载和关键页面。

静态目录建议使用“新目录上传 → 原子切换软链接”，减少同步中间状态。后端建议由 systemd、容器编排或进程管理平台托管。
