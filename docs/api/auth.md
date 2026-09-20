---
title: 认证接口
description: 管理后台和 App 登录、验证码、退出以及解除登录限制接口摘要。
---

# 认证接口

## 管理后台

### 获取验证码

```http
GET /admin/auth/captcha
```

公开访问。响应包含是否启用验证码；启用时同时返回验证码标识和图片数据。前端必须根据 `enabled` 判断是否展示和提交验证码。

### 登录

```http
POST /admin/auth/login
Content-Type: application/json
```

```json
{
  "username": "example-user",
  "password": "<user-password>",
  "key": "<captcha-key>",
  "code": "<captcha-code>",
  "terminal": "web"
}
```

验证码关闭时可以不提交 `key` 和 `code`。登录成功返回 Token 和用户名。接口同时受到 IP 限流以及用户名、终端失败次数限制。

### 退出

```http
POST /auth/logout
Authorization: Bearer <token>
```

退出会删除当前服务端 Token。前端无论接口是否成功，都应清除本地认证状态。

### 解除登录限制

```http
POST /admin/auth/clearLoginLimit
```

```json
{
  "username": "example-user",
  "terminal": "web"
}
```

需要 `api:admin:auth:clearLoginLimit`。`terminal` 默认 Web，后端会清除该用户名和终端维度的失败统计。

## App

### 发送短信验证码

```http
POST /app/auth/sendSmsCode
```

```json
{
  "mobile": "<mobile-number>"
}
```

公开接口。验证码长度和有效期来自动态系统参数，实际发送通过消息队列和通知模块完成。

### App 登录

```http
POST /app/auth/login
```

密码方式：

```json
{
  "mobile": "<mobile-number>",
  "password": "<user-password>",
  "terminal": "app"
}
```

短信方式：

```json
{
  "mobile": "<mobile-number>",
  "smsCode": "<sms-code>",
  "terminal": "app"
}
```

两种认证方式至少提供一种。手机号尚未注册时，仅短信验证码验证成功才会自动创建用户。

## 安全提示

- 不在日志中打印密码、验证码和完整 Token。
- 登录错误提示不区分账号是否存在。
- 公开短信接口必须结合限流和供应商额度保护。
- 生产环境使用 HTTPS，避免凭据在传输中暴露。
