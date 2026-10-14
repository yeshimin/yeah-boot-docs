---
title: 文件存储
description: StorageManager、StorageProvider、本地、七牛、MinIO 和业务引用管理。
---

# 文件存储

存储模块通过 `StorageProvider` 屏蔽本地、七牛和 MinIO 差异，业务统一调用 `StorageManager`。

## 核心对象

- `StorageManager`：选择 Provider、持久化存储记录、处理读写删除和使用标记。
- `StorageProvider`：具体存储实现接口。
- `SysStorageEntity`：保存最终 Provider、桶、路径、文件键、后缀和状态。
- `sys_file`：可选的上层业务文件记录。

## Provider 选择

调用上传时可以指定 `StorageTypeEnum`：

|  值 | 实现  |
| --: | ----- |
|   1 | 本地  |
|   2 | 七牛  |
|   3 | MinIO |

未指定时，已启用 Provider 按 `priority` 排序，选择第一项。指定但没有可用 Provider 时返回“不支持的存储类型”。

## 上传

```java
SysStorageEntity storage = storageManager.put(
    bucket,
    path,
    file,
    storageType,
    false,
    false
);
```

后两个布尔值分别表示是否公开和是否已经被业务使用。新上传但未引用的文件会设置可清理时间，便于后续垃圾文件清理。

## 上传策略

上传策略由 `sys_config` 动态控制：

- `admin.storage.upload.max-size-mb`：单文件应用层大小上限；还需与 Spring Multipart 和 Nginx 的请求体上限保持一致。
- `admin.storage.upload.validation.enabled`：是否执行扩展名、MIME 和已支持类型的文件头校验；文件非空和大小限制始终执行。
- `admin.storage.upload.allowed-extensions`、`admin.storage.upload.allowed-mime-types`：上传类型白名单。允许类型由配置决定，配置 HTML 等主动内容时应只用于私有下载场景。
- `admin.storage.upload.public-preview.enabled`、`admin.storage.upload.public-preview.allowed-extensions`：是否允许标记公开预览及其独立扩展名白名单。

公开预览入口会再次校验预览白名单。默认仅包含 JPG、JPEG、PNG、WebP；不要将 HTML、SVG、JavaScript 等可执行内容加入公开预览白名单。文件头校验只覆盖已实现魔数识别的二进制格式，其中 `docx/xlsx` 还会检查 Office ZIP 容器的必要条目；文本类文件没有通用魔数。

## 下载和预览

私有管理接口需要登录和接口权限；公开接口必须同时满足文件公开条件。下载返回附件响应，预览返回 inline 响应。

前端下载工具需要同时处理：

- 正常二进制响应。
- 后端返回 JSON 错误。
- 401 登录失效。
- 403 权限不足。

## 使用标记

```java
storageManager.markUse(newFileKey);
storageManager.unmarkUse(oldFileKey);
```

更新业务文件时建议：

1. 校验新文件存在。
2. 保存业务数据。
3. 标记新文件已使用。
4. 解除旧文件标记。

具体步骤应放在同一业务事务边界内，并考虑对象存储操作无法随数据库事务自动回滚。

## 删除

`StorageManager.delete` 对不存在记录保持幂等。删除底层记录后再调用对应 Provider 删除实际对象。

管理页面删除已使用文件时默认拒绝；只有用户明确二次确认并提交 `force = true` 才继续。

## 生产建议

- 上传目录不要放在应用发布目录内。
- 对公开桶和私有桶使用不同访问策略。
- 限制扩展名、MIME、大小和上传频率。
- 公开预览白名单优先只保留图片等非主动内容类型。
- 对对象存储开启生命周期或定期清理未使用记录。
- 备份时同时考虑数据库元数据和实际文件。
- 外部存储配置错误时查看服务端异常链，不向前端回显完整供应商响应和凭据。
