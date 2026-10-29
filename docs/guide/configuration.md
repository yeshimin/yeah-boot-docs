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
| API 报文加密 | `api.encryption`                               | 加密模式、套件、密钥标识与私钥注入 |
| 全局权限   | `yeah-boot.safe-mode`、`yeah-boot.super-admin` | 安全模式与超级管理员账号         |
| 跨域访问   | `yeah-boot.cors`                                | 跨来源浏览器请求规则             |
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

## 跨域访问

管理后台和 API 同源部署时，浏览器请求统一走 `/api/**`，不需要开启 CORS。只有前端与 API 必须使用不同来源时，才启用 `yeah-boot.cors`：

```yaml
yeah-boot:
  cors:
    enabled: true
    path-pattern: /**
    allowed-origin-patterns:
      - https://admin.example.com
      - https://*.example.com
    allowed-methods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS
    allowed-headers:
      - Authorization
      - Content-Type
      - Idempotency-Key
    exposed-headers:
      - Content-Disposition
      - Content-Length
    allow-credentials: false
    max-age: 3600
```

- CORS 默认关闭。启用时 `allowed-origin-patterns`、`allowed-methods`、`allowed-headers` 均不能为空；应用启动时会校验。
- `allowed-origin-patterns` 应使用明确的可信来源；受控子域可使用 `https://*.example.com`。不要在生产环境无约束地开放来源。
- 管理后台默认使用 `Authorization: Bearer <token>`，不依赖 Cookie，因此一般保持 `allow-credentials: false`。只有确实需要携带 Cookie 等浏览器凭证时才启用它。
- 文件下载时浏览器若需读取 `Content-Disposition`，必须将该响应头列入 `exposed-headers`；默认配置已包含它。

同源反向代理优先于跨域部署。Nginx 配置见[管理后台与 API 代理](/deployment/nginx)。

## 服务端 Token 策略

`auth.token` 可以按主体和终端配置在线数量。主体用于区分 Admin 与 App，终端用于区分 Web、App 等客户端。登录签发 JWT 后，Redis 中还会保存对应服务端 Token；只验证 JWT 而找不到服务端 Token 时，认证仍然失败。

## 存储配置

`yeah-boot.storage.enabled` 控制存储模块。启用后至少需要一个有效 Provider，并为各实现配置优先级和公共桶。未显式指定 `storageType` 时，系统选择启用 Provider 中优先级最高的实现。

本地存储应使用独立绝对目录；对象存储的 AccessKey、SecretKey 只能来自服务器安全配置。

## 运行时系统参数

运行时参数保存在 `sys_config`，由 `DynamicConfigService` 缓存到 Redis。当前内置参数包括：

| 参数键                                             | 类型   |  默认值 | 作用               |
| -------------------------------------------------- | ------ | ------: | ------------------ |
| `admin.auth.login.captcha-enabled`                 | 布尔   |  `true` | 管理后台图形验证码 |
| `admin.auth.login.failure-window-seconds`          | 长整数 |   `600` | 登录失败统计窗口   |
| `admin.auth.login.failure-count`                   | 长整数 |     `5` | 最大失败次数       |
| `admin.auth.login.lock-seconds`                    | 长整数 |   `600` | 临时锁定时长       |
| `global.sms.code-length`                           | 整数   |     `6` | 短信验证码长度     |
| `global.sms.code-exp-seconds`                      | 整数   |   `300` | 短信验证码有效期   |
| `global.sms.aliyun.template-code`                  | 字符串 |      空 | 短信模板编号       |
| `global.sms.aliyun.sign-name`                      | 字符串 |      空 | 短信签名           |
| `admin.import-export.sys-user-excel.max-import-file-size-mb` | 长整数 | `5` | 导入文件大小上限 |
| `admin.import-export.sys-user-excel.max-import-rows`         | 整数   | `1000` | 单次导入行数上限 |
| `admin.import-export.sys-user-excel.max-export-rows`         | 整数   | `10000` | 单次导出行数上限 |
| `admin.import-export.sys-user-excel.max-error-messages`      | 整数   | `20` | 导入错误展示数量 |

参数缺失、禁用或格式错误时使用代码枚举中的默认值。数据变更后会刷新缓存，也可以在系统参数页面手动重新加载。

登录失败限制、密码提示规则和上传策略同样属于运行时系统参数。完整参数表与安全边界见[应用安全基线](/security/application-security-baseline)。

## 配置优先级建议

1. 密钥、连接和基础设施：环境变量或安全配置中心。
2. 启动行为：本地未提交配置或部署平台配置。
3. 可在线调整的非敏感业务参数：`sys_config`。
4. 前端展示常量：前端常量或后端字典，不与密钥配置混用。
