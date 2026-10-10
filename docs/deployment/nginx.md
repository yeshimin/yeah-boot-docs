---
title: 管理后台与 API 代理
description: YeahBoot 管理后台静态资源与后端 API 的 Nginx 同源代理示例。
---

# 管理后台与 API 代理

本页仅说明下游项目部署管理后台和 YeahBoot 后端 API 时的 Nginx 配置，不包含官方主站或文档站的部署方式。

推荐让浏览器访问管理后台和 API 时使用同一来源：前端请求 `/api/**`，Nginx 去掉 `/api` 前缀后转发给 `yeah-admin` 服务。这样无需在浏览器处理跨域。

## 示例

以下示例假定：

- 管理后台构建产物位于 `/srv/your-app/admin`。
- 后端 `yeah-admin` 监听本机 `8080` 端口。
- 管理后台构建时设置 `VITE_API_BASE_URL=/api`。

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /srv/your-app/admin;
    index index.html;
    client_max_body_size 20m;

    # /api/admin/auth/login -> http://127.0.0.1:8080/admin/auth/login
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }

    # Vue Router history 模式回退。
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Vite 产物文件名带内容哈希，可长期缓存。
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
}
```

生产环境应在外层配置 HTTPS，并按实际证书、域名和网络边界调整监听端口与安全策略。

## 上传大小

`client_max_body_size`、Spring 上传限制和业务运行时参数必须保持一致。三者任一层较小，上传都会在该层被拒绝。

## 发布检查

1. 访问管理后台首页，确认 Vue Router 刷新页面不会 404。
2. 在浏览器 Network 中确认 `/api/**` 请求成功转发到后端。
3. 登录并验证 Token、401 跳转和普通角色的 403 响应。
4. 上传文件时验证大小限制与文件预览、下载。
