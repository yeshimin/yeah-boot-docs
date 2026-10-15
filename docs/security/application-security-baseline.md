---
title: 应用安全基线
description: YeahBoot 应用层安全能力、系统参数、安全边界与生产部署责任。
---

# 应用安全基线

YeahBoot 提供认证、权限、审计、限流、日志脱敏、文件存储等应用层安全能力，可作为等级保护建设的代码基础。等保对象的定级、网络边界、主机加固、日志留存、备份恢复、制度和测评仍由实际项目负责。

本页不表示任何部署后的系统已经通过等保测评。

## 初始化数据

首次部署依次导入 `00.structure.sql.zip` 与 `01.data_without_area.sql.zip`，即可获得本页涉及的审计字段与系统参数，包括 `sys_log.client_ip`、登录策略、密码规则和上传策略。首次部署不需要额外执行安全增量脚本。

已有业务库升级时，应使用项目发布时提供的数据库迁移方案；不要将全量初始化脚本直接覆盖到保留业务数据的数据库。

## 鉴别与 Token

- 密码使用 BCrypt 存储。
- JWT 结合 Redis 服务端状态校验，支持退出登录和 Token 失效控制。
- Token、密码等敏感参数写入日志时会脱敏；不得在业务代码中直接打印凭据原文。
- 正常 API 使用 `Authorization: Bearer <token>`。

::: warning URL Token
框架为兼容图片预览、下载或对象存储跳转等场景保留 URL Token 支持，但长期 JWT 出现在 URL 可能进入浏览器历史、代理日志和 Referer。

生产 Profile 默认通过 `auth.token.allow-query-token=false` 关闭 URL Token。高安全场景应使用短时、一次性、绑定用途的 ticket，不应将长期 JWT 用于普通 API 的 URL 参数。
:::

## 加密报文与防重放

框架提供可选的 SM2 + SM4-GCM 报文加密能力。它是 HTTPS 之外的纵深保护，不替代 HTTPS、身份认证、权限控制或服务端的数据加密。

## 本地测试

后端在通用 `application.yml` 中预留了环境变量占位符，未配置时保持关闭。使用开发环境测试时，在 IntelliJ Run Configuration 的 Environment variables 中设置：

```bash
YEAH_BOOT_API_ENCRYPTION_MODE=OPTIONAL
YEAH_BOOT_API_ENCRYPTION_PRIVATE_KEY=<临时生成的 32 字节 SM2 私钥十六进制值>
```

临时私钥可使用以下命令生成后粘贴到 IDE 配置中，不要写入 YAML：

```bash
openssl rand -hex 32
```

随后按原开发 Profile 启动：

```bash
mvn -pl yeah-admin -am spring-boot:run \
  -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

`OPTIONAL` 模式适合联调：管理后台会先请求 `GET /encryption/public-key`，检测到加密启用后自动为 JSON 和查询参数请求创建 Envelope；文件上传、下载流等不支持该协议的场景仍保持明文。浏览器 Network 中应看到 `Api-Encryption: v1` 请求头，业务参数出现在 `ct` 密文中而非明文 JSON 中。

可通过重复发送同一份已加密请求验证防重放：首次请求正常处理，原样重放会返回“加密请求已失效或重复提交”。幂等重试应保持同一个 `Idempotency-Key`，但使用新的 Envelope、时间戳、nonce、对称密钥和 IV。

默认关闭。需要启用时，将私钥通过环境变量或密钥管理服务注入，不能写入 `sys_config`、源码或公开配置文件：

```yaml
api:
  encryption:
    mode: REQUIRED # OFF / OPTIONAL / REQUIRED
    suite: sm2-sm4-gcm-v1
    version: 1
    key-id: main-2026-01
    private-key: ${YEAH_BOOT_API_ENCRYPTION_PRIVATE_KEY:}
    bypass-routes:
      - /actuator/health
      - /encryption/public-key GET
      - /public/storage/preview GET
      - /public/storage/download GET
    timestamp-window-seconds: 300
    replay-ttl-seconds: 300
    max-payload-bytes: 65536
```

`private-key` 使用 SM2 私钥的十六进制值。应使用 CSPRNG 生成的 32 随机字节，即 64 位十六进制文本；不能使用 `123` 等短弱值。公钥由服务端根据私钥计算生成并通过公开引导接口返回。生产环境应由部署平台把受管密钥安全注入环境变量，框架不提供私钥生成或持久化功能。

- `OFF`：不处理加密 Envelope。
- `OPTIONAL`：兼容明文和加密请求，适合灰度发布。
- `REQUIRED`：除明确豁免的接口外，全部要求加密 Envelope。
- `suite`：服务端加密套件。当前内置 `sm2-sm4-gcm-v1`；管理后台仅支持该套件。
- `bypass-routes` 一行一个路径，HTTP 方法写在路径末尾且可省略；方法名不区分大小写，省略时表示该路径的所有方法均明文。框架拒绝 `/**` 这类宽泛规则。

接口可使用 `@ApiEncryption` 覆盖全局策略：`DEFAULT` 跟随 YAML 和全局模式，`REQUIRED` 仅接受加密报文，`BYPASS` 仅接受明文，`OPTIONAL` 同时接受明文和加密报文。`OPTIONAL` 仅用于指定 JSON 或查询接口的短期客户端迁移；加密请求返回加密响应，明文请求返回明文响应。不要将其用于文件流，也应在旧客户端完成升级后移除。

客户端先从 `GET /encryption/public-key` 读取公钥和协议元数据。每次请求生成新的 SM4 基础密钥，用服务端 SM2 公钥包装，再用派生的请求密钥加密 JSON Body 或查询参数。JWT 继续放在 `Authorization` 请求头，认证与报文加密相互独立。

加密请求和响应均使用 `Api-Encryption: v1` 标记协议版本；查询参数使用唯一的 `__enc` 参数承载 Base64URL 编码的加密 Envelope。

加密 Envelope 中的时间戳、随机 nonce、方法和路径会由 GCM AAD 保护。服务端只在 GCM 校验成功后，使用 Redis 原子写入 nonce 的短期记录；重复报文会被拒绝。防重放当前仅随加密 Envelope 启用，不能替代业务幂等。

请求处理顺序为：MDC → JWT 认证 → Spring Security 路径授权 → 加密查询参数解密 → MVC 限流 → 接口加密策略校验 → JSON 请求体解密 → Controller → JSON 响应加密。MVC 限流在加密策略之前执行，避免超限请求消耗解密和 JSON 解析资源。

文件上传、下载流、图片预览和浏览器原生跳转无法附带完整的加密协议上下文，应明确配置为明文豁免，并继续使用 HTTPS、鉴权和短时签名链接等保护措施。框架已对文件上传、存储上传、用户 Excel 导入、私有文件下载、私有存储下载、用户导入模板下载、用户导出、公开下载与公开预览使用方法级 `@ApiEncryption(BYPASS)`；该豁免不影响登录认证、资源权限、限流、审计和文件安全校验。

::: warning 密评边界
框架使用的 Provider 和前端库仅提供协议实现。生产系统是否必须使用经认证的密码产品、KMS/HSM 或接受密码应用安全性评估，应由项目密码应用方案、所属行业和测评范围确定。
:::

## 业务幂等

`@RateLimit` 只限制单位时间内的请求数量，不保证同一提交只执行一次。对创建、支付、审批等非幂等写操作，可使用 `@Idempotent`：

```java
@Idempotent
@PostMapping("/create")
public R<OrderVo> create(@Valid @RequestBody OrderCreateDto dto) {
    // ...
}
```

服务端按“method + path + Idempotency-Key”维护 Redis 状态，不依赖用户 ID 或 IP。前端首次提交时生成 UUID 并放入 `Idempotency-Key` 请求头；同一表单的连续点击和网络重试必须复用该 Key，用户修改提交内容后应生成新的 Key。

公开和受保护写接口使用相同注解：

```java
@PublicAccess
@Idempotent
@PostMapping("/register")
public R<Void> register(@Valid @RequestBody RegisterDto dto) {
    // ...
}
```

公开幂等适合注册、找回密码、公开表单等接口，但必须同时配置验证码和 IP 限流；不建议用于登录和普通公开查询。

- 首次请求进入 `PROCESSING` 并执行业务。
- 相同 Key 且相同明文请求摘要的并发请求返回“处理中”。
- 首次请求完成后仅保留已提交状态，后续相同请求提示刷新后查看结果。
- 相同 Key 携带不同请求摘要会被拒绝，避免一个 Key 被错误复用。

加密请求重试时必须生成新的加密 Envelope、时间戳和 nonce，但保留同一个 `Idempotency-Key`。防重放会拒绝原始密文包，幂等机制负责识别已提交状态。

## 登录策略

| 参数键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `admin.auth.login.failure-window-seconds` | LONG | `600` | 登录失败统计窗口，单位秒。 |
| `admin.auth.login.failure-count` | LONG | `5` | 窗口内最大失败次数。 |
| `admin.auth.login.lock-seconds` | LONG | `600` | 达到失败次数后的临时锁定时间，单位秒。 |
| `admin.auth.login.failure.include-ip.enabled` | BOOLEAN | `true` | 是否按用户名、终端和客户端 IP 统计失败次数。 |
| `admin.auth.login.ip-whitelist.enabled` | BOOLEAN | `false` | 是否启用管理后台登录 IP 白名单。 |
| `admin.auth.login.ip-whitelist.values` | STRING | 空 | 允许登录的单 IP 或 CIDR 网段，多个值用英文逗号分隔。启用白名单且为空时拒绝全部登录。 |

客户端 IP 由统一工具获取。部署在 Nginx 等反向代理后时，代理必须正确覆盖 `X-Real-IP`、`X-Forwarded-For`，且应用服务端口不应直接暴露到公网。

管理员解除登录限制时，会使指定账号所有 IP 维度的旧失败记录立即失效。

## 密码规则

以下系统参数用于管理后台的注册、创建用户、重置密码和个人中心修改密码的前端校验：

| 参数键 | 类型 | 默认值 |
| --- | --- | --- |
| `admin.auth.password.min-length` | INTEGER | `6` |
| `admin.auth.password.max-length` | INTEGER | `32` |
| `admin.auth.password.require-uppercase` | BOOLEAN | `false` |
| `admin.auth.password.require-lowercase` | BOOLEAN | `false` |
| `admin.auth.password.require-digit` | BOOLEAN | `false` |
| `admin.auth.password.require-special` | BOOLEAN | `false` |

这些参数需开启“公开访问”，以便登录页在匿名状态读取规则。

::: warning 当前协议边界
当前前端会先计算密码 Hash 再传给后端，因此后端无法验证原始密码是否满足复杂度。前端规则用于统一体验，不等同于服务端强制密码复杂度控制。
:::

## 文件上传策略

| 参数键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `admin.storage.upload.max-size-mb` | LONG | `10` | 单文件应用层大小上限，不设代码内置上限；还受 Spring Multipart 和网关限制。 |
| `admin.storage.upload.validation.enabled` | BOOLEAN | `true` | 是否校验扩展名、MIME 和已支持类型的文件头。 |
| `admin.storage.upload.allowed-extensions` | STRING | 常用图片、文档、压缩包 | 多个扩展名用英文逗号分隔；配置即允许上传。 |
| `admin.storage.upload.allowed-mime-types` | STRING | 常用图片、文档、压缩包 | 多个 MIME 类型用英文逗号分隔。 |
| `admin.storage.upload.public-preview.enabled` | BOOLEAN | `true` | 是否允许上传时标记为公开预览。 |
| `admin.storage.upload.public-preview.allowed-extensions` | STRING | `jpg,jpeg,png,webp` | 多个扩展名用英文逗号分隔；公开预览入口会再次校验。 |

文件非空和大小限制始终生效。启用类型校验时，框架校验扩展名和客户端 MIME；对 JPG、JPEG、PNG、WebP、PDF、ZIP、DOC、XLS 等已支持格式额外校验文件头，`docx/xlsx` 还会检查 Office ZIP 容器中的必要条目。文本类文件没有统一魔数，HTML、SVG、JavaScript 等主动内容即使被允许上传，也应保持私有下载，不应加入公开预览白名单。

## 审计日志

`@SysLog` 写入 `sys_log`。除既有操作信息外，安全增量后增加：

- `client_ip`：可索引的客户端来源 IP。
- `extra` JSON：`requestId`、终端、请求方法、路径、截断的 User-Agent 和异常摘要。

通用 CRUD 已自动审计。自定义接口应由人工验收确保登录、登出、写操作、权限变更、配置变更、上传下载、导出、删除和强制操作均标注 `@SysLog`。

## 接口文档

开发环境可启用 SpringDoc。生产环境应关闭：

```yaml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

安全链只会在 API Docs 启用时公开对应文档路径。

## 生产检查

- 确认 `safe-mode=false`。
- 替换测试 JWT、短信、存储等凭据。
- 关闭生产 SpringDoc。
- 确认反向代理正确传递真实客户端 IP。
- 执行上传、越权、审计和 Token 失效的安全验收。
- 对接 SonarQube、依赖漏洞扫描和专业渗透测试团队的交付流程。

## 开发与交付检查

项目提供可选的 `.githooks/` 模板。默认只检查暂存区空白错误，不强制在每次提交时运行完整构建：

```sh
git config core.hooksPath .githooks
```

建议在 CI、交付或测评前执行：

- 后端编译和自动化测试。
- 管理后台类型检查、静态检查和生产构建。
- 文档站生产构建和链接检查。
- SonarQube 代码质量扫描、依赖漏洞扫描和 SBOM 生成。
- 由专业团队执行渗透测试和正式等级测评。
