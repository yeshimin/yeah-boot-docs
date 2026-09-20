---
title: 系统参数
description: 使用 SysConfigEnum 和 DynamicConfigService 管理运行时业务参数。
---

# 系统参数

系统参数用于无需重启即可调整的非敏感业务配置。参数定义以代码 `SysConfigEnum` 为准，数据库提供当前覆盖值，Redis 保存全部启用参数的快照。

## 新增参数

先在枚举定义键、类型和默认值：

```java
EXAMPLE_LIMIT(
    "example.limit",
    SysConfigValueTypeEnum.INTEGER,
    "100"
)
```

业务读取：

```java
Integer limit = dynamicConfigService.getInteger(SysConfigEnum.EXAMPLE_LIMIT);
```

支持：

```java
getString(config)
getInteger(config)
getLong(config)
getBoolean(config)
```

## 读取回退

1. 从 Redis 快照读取完整 Map。
2. 缓存不存在或损坏时，从数据库加载全部启用参数。
3. 指定键不存在时，使用枚举默认值。
4. 数字或布尔格式错误时记录警告并使用默认值。

这保证了数据库暂未初始化某条参数时，业务仍可按代码默认值运行。

## 数据变更

新增、编辑和删除由 Service 完成数据库事务；Controller 在成功返回前触发安全缓存刷新。缓存刷新失败不会把已经提交的数据伪装成失败，可以在管理页面点击“刷新缓存”恢复一致性。

## 参数类型

| 类型    | 输入示例  | 校验                 |
| ------- | --------- | -------------------- |
| STRING  | `example` | 普通字符串           |
| INTEGER | `100`     | 32 位整数格式        |
| LONG    | `600`     | 长整数格式           |
| BOOLEAN | `true`    | 仅 `true` 或 `false` |

## 不适合放入系统参数的内容

- 数据库和 Redis 连接信息。
- JWT 签名密钥。
- 云厂商 AccessKey、SecretKey。
- TLS 证书和私钥。
- 必须在 Spring Bean 初始化前确定的开关。

这些值应使用环境变量、服务器配置或安全配置中心。

## 缓存排查

参数页面与实际行为不一致时：

1. 确认记录处于启用状态。
2. 检查参数键是否与 `SysConfigEnum` 完全一致。
3. 检查值类型。
4. 点击“刷新缓存”。
5. 通过日志确认刷新数量和参数键，不查看密钥原值。
