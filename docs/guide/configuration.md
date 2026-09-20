---
title: 运行配置
description: YeahBoot 的数据源、Redis、认证、存储和动态系统参数配置边界。
---

# 运行配置

YeahBoot 的配置分为两类：启动时基础配置和运行时业务参数。

## 启动时配置

这类配置决定应用能否连接外部基础设施，应放在服务器配置、环境变量或安全配置中心，不应通过管理页面动态修改。

| 分类       | 典型前缀                                       | 说明                             |
| ---------- | ---------------------------------------------- | -------------------------------- |
| 数据源     | `spring.datasource`                            | JDBC 地址、驱动、账号与密码      |
| Redis      | `spring.redis`                                 | 地址、端口、数据库和认证信息     |
| JWT        | `auth.token.jwt`                               | 签名密钥、有效期与时钟偏差       |
| Token 策略 | `auth.token`                                   | subject、terminal 与在线数量限制 |
| 全局权限   | `yeah-boot.safe-mode`、`yeah-boot.super-admin` | 安全模式与超级管理员账号         |
| 文件存储   | `yeah-boot.storage`                            | 本地、七牛和 MinIO 实现          |
| WebSocket  | `yeah-boot.websocket`                          | 是否启用、心跳间隔和超时         |
| ID 生成    | `yeah-boot.id-generator`                       | 编码字符集与最小长度             |

示意配置只展示结构，不包含可用凭据：

```yaml
spring:
  datasource:
    url: jdbc:mysql://<db-host>:3306/<database>
    username: <db-user>
    password: <db-password>
  redis:
    host: <redis-host>
    port: 6379

auth:
  token:
    jwt:
      secret: <replace-with-a-strong-random-secret>
      expire-seconds: 7200

yeah-boot:
  safe-mode: false
  super-admin: <optional-super-admin-username>
```

::: danger 生产环境
生产环境必须关闭 `safe-mode`，并替换 JWT、数据库、Redis、短信与对象存储相关凭据。不要将真实值提交到 Git。
:::

## 服务端 Token 策略

`auth.token` 可以按主体和终端配置在线数量。主体用于区分 Admin 与 App，终端用于区分 Web、App 等客户端。登录签发 JWT 后，Redis 中还会保存对应服务端 Token；只验证 JWT 而找不到服务端 Token 时，认证仍然失败。

## 存储配置

`yeah-boot.storage.enabled` 控制存储模块。启用后至少需要一个有效 Provider，并为各实现配置优先级和公共桶。未显式指定 `storageType` 时，系统选择启用 Provider 中优先级最高的实现。

本地存储应使用独立绝对目录；对象存储的 AccessKey、SecretKey 只能来自服务器安全配置。

## 运行时系统参数

运行时参数保存在 `sys_config`，由 `DynamicConfigService` 缓存到 Redis。当前内置参数包括：

| 参数键                                             | 类型   |  默认值 | 作用               |
| -------------------------------------------------- | ------ | ------: | ------------------ |
| `yeah-boot.captcha-enabled`                        | 布尔   |  `true` | 管理后台图形验证码 |
| `auth.admin-login.failure-window-seconds`          | 长整数 |   `600` | 登录失败统计窗口   |
| `auth.admin-login.max-failure-count`               | 长整数 |     `5` | 最大失败次数       |
| `auth.admin-login.lock-seconds`                    | 长整数 |   `600` | 临时锁定时长       |
| `yeah-boot.sms-code-length`                        | 整数   |     `6` | 短信验证码长度     |
| `yeah-boot.sms-code-exp-seconds`                   | 整数   |   `300` | 短信验证码有效期   |
| `yeah-boot.notification.aliyun.sms.template-code`  | 字符串 |      空 | 短信模板编号       |
| `yeah-boot.notification.aliyun.sms.sign-name`      | 字符串 |      空 | 短信签名           |
| `yeah-boot.sys-user-excel.max-import-file-size-mb` | 长整数 |     `5` | 导入文件大小上限   |
| `yeah-boot.sys-user-excel.max-import-rows`         | 整数   |  `1000` | 单次导入行数上限   |
| `yeah-boot.sys-user-excel.max-export-rows`         | 整数   | `10000` | 单次导出行数上限   |
| `yeah-boot.sys-user-excel.max-error-messages`      | 整数   |    `20` | 导入错误展示数量   |

参数缺失、禁用或格式错误时使用代码枚举中的默认值。数据变更后会刷新缓存，也可以在系统参数页面手动重新加载。

## 配置优先级建议

1. 密钥、连接和基础设施：环境变量或安全配置中心。
2. 启动行为：本地未提交配置或部署平台配置。
3. 可在线调整的非敏感业务参数：`sys_config`。
4. 前端展示常量：前端常量或后端字典，不与密钥配置混用。
