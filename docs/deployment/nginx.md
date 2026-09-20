---
title: Nginx 配置
description: yeahboot.com、docs.yeahboot.com 和 demo.yeahboot.com 的 Nginx 核心配置。
---

# Nginx 配置

以下片段只展示核心逻辑，证书路径、日志路径和安全策略按服务器环境填写。

## 官网

```nginx
server {
    listen 443 ssl http2;
    server_name yeahboot.com www.yeahboot.com;

    root /srv/yeahboot/site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
}
```

## 文档

VitePress 开启 `cleanUrls` 后，Nginx 需要把无扩展名路径映射到 `.html`：

```nginx
server {
    listen 443 ssl http2;
    server_name docs.yeahboot.com;

    root /srv/yeahboot/docs;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    error_page 404 /404.html;
}
```

VitePress 产物中的带哈希资源可以长期缓存；HTML 不建议设置同样长的不可变缓存。

## 管理后台和 API

```nginx
server {
    listen 443 ssl http2;
    server_name demo.yeahboot.com;

    root /srv/yeahboot/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

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
}
```

`proxy_pass` 尾部的 `/` 会移除浏览器路径中的 `/api/` 前缀。

## 上传大小

需要上传文件或导入 Excel 时设置合理上限：

```nginx
client_max_body_size 20m;
```

Nginx 上限、Spring 上传上限和业务动态参数应保持一致，否则请求可能在进入后端前被拒绝。

## 安全响应头

可以逐步增加：

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

内容安全策略 CSP 应根据实际第三方资源测试后启用，不建议未经验证直接复制严格模板。

## 检查与加载

```bash
nginx -t
systemctl reload nginx
```

先执行语法检查，再平滑加载。HTTPS 跳转、证书续期和多个子域名证书策略由服务器环境统一配置。
