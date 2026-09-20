---
title: 接口约定
description: YeahBoot API 前缀、认证、分页、统一响应、文件响应和 OpenAPI 使用说明。
---

# 接口约定

## 路径前缀

| 前缀      | 用途         | 默认认证                       |
| --------- | ------------ | ------------------------------ |
| `/admin`  | 管理后台业务 | 需要认证和接口权限             |
| `/app`    | App 业务     | 除登录等公开接口外需要认证     |
| `/public` | 明确公开访问 | 不要求登录，但仍需业务安全校验 |
| `/auth`   | 通用认证操作 | 例如退出登录                   |

浏览器生产环境建议请求同源 `/api/**`，Nginx 转发时去掉 `/api`：

```text
/api/admin/sysUser/query
             ↓
/admin/sysUser/query
```

## 认证

```http
Authorization: Bearer <token>
```

未认证返回 401，无权限返回 403。公开接口通过后端公开访问注解明确放行，不能只依赖路径名称。

## JSON 响应

```json
{
  "code": 0,
  "message": "成功",
  "data": {},
  "traceId": "request-trace-id"
}
```

文件下载、预览和 Excel 导出直接返回二进制响应，不使用 `R<T>` 包裹。

## 分页

```http
GET /admin/sysRole/crud/query?current=1&size=10
```

分页响应通常包含：

```json
{
  "records": [],
  "total": 0,
  "size": 10,
  "current": 1,
  "pages": 0
}
```

不要将超大 `size` 当作导出功能。导出使用专用接口并设置服务端上限。

## 批量参数

通用批量 ID DTO：

```json
{
  "ids": [1, 2, 3]
}
```

文件删除还兼容 `fileKeys`，但前端批量操作优先提交 `ids`。

## OpenAPI

后端集成 SpringDoc OpenAPI。未修改默认路径时常用入口为：

```text
/v3/api-docs
/swagger-ui.html
```

公开 Demo 不建议对互联网完全开放接口文档。可以通过 Nginx IP 白名单、认证或生产配置关闭。

## 接口调试顺序

1. 先获取验证码状态并登录。
2. 保存返回 Token。
3. 在请求头添加 Bearer Token。
4. 使用普通角色验证 403。
5. 使用响应 `traceId` 对照服务端日志。

::: warning
本文列出的是业务入口摘要。字段、校验和最终响应模型以当前 OpenAPI 和源码 DTO 为准。
:::
