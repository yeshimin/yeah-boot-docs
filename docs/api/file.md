---
title: 文件与公开接口
description: 文件、存储、公开下载和公开预览接口摘要。
---

# 文件与公开接口

## 文件管理

基础路径：`/basic/file`

| 方法 | 路径           | 权限用途                  |
| ---- | -------------- | ------------------------- |
| GET  | `/crud/query`  | 文件列表                  |
| GET  | `/crud/detail` | 文件详情                  |
| POST | `/upload`      | 上传业务文件              |
| GET  | `/download`    | 下载文件                  |
| POST | `/delete`      | 按 ID 或 fileKey 批量删除 |

上传使用 `multipart/form-data`，文件字段名为 `file`。具体接口可以同时接收桶、路径和存储类型参数。

## 存储管理

基础路径：`/basic/storage`

| 方法 | 路径           | 权限用途             |
| ---- | -------------- | -------------------- |
| GET  | `/crud/query`  | 存储记录列表         |
| GET  | `/crud/detail` | 存储记录详情         |
| POST | `/upload`      | 直接上传存储对象     |
| GET  | `/download`    | 私有下载             |
| POST | `/delete`      | 删除底层记录，可强制 |

删除请求：

```json
{
  "ids": [1, 2],
  "fileKeys": [],
  "force": false
}
```

后端优先使用 `ids`。目标不存在时忽略；正在使用且 `force` 不为 `true` 时拒绝删除。

## 公开访问

```http
GET /public/storage/download?fileKey=<file-key>
GET /public/storage/preview?fileKey=<file-key>
```

这两个接口允许匿名访问，但只应返回被标记为公开的存储对象。

- `download`：附件下载。
- `preview`：浏览器内联预览。

## 响应处理

正常响应是文件流。失败时可能返回 JSON 错误，前端不能无条件把所有响应保存为文件。

公开文件 URL 不应包含磁盘绝对路径、AccessKey 或内部桶凭据。需要临时访问私有对象时，应扩展有过期时间的签名 URL，而不是把对象改成永久公开。
