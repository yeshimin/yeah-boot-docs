---
title: 日志与数据安全
description: Trace ID、接口日志、系统日志、敏感数据注解和生产日志建议。
---

# 日志与数据安全

## 请求日志

每个请求生成唯一标识并写入 MDC。日志前缀中的 `reqId` 用于关联同一次请求产生的鉴权、SQL、业务和异常日志；认证成功后还可以带当前用户 ID。

开发环境开启 P6Spy 可以观察 SQL 与耗时，生产环境不建议长期输出全部 SQL。

## 系统日志注解

关键管理操作使用：

```java
@SysLog(
    value = "新增用户",
    category = SysLogCategoryEnum.DATA
)
```

`triggerType` 默认是系统触发，`category` 默认 `NONE`。常见类别包括鉴权、数据操作、定时任务和上传下载。

建议记录：

- 登录、退出、解除登录限制。
- 用户、角色、资源、组织等写操作。
- 文件上传、下载和强制删除。
- 系统参数变更和缓存刷新。

纯查询接口一般不需要系统操作日志，必要时依赖访问日志和 Trace ID。

## 敏感数据注解

```java
@SensitiveData(type = SensitiveType.MOBILE)
private String mobile;
```

默认在响应和日志两个场景脱敏，也可以仅指定日志：

```java
@SensitiveData(scenes = SensitiveScene.LOG)
private String password;
```

支持类型：

| 类型    | 用途     |
| ------- | -------- |
| FULL    | 完全隐藏 |
| NAME    | 姓名     |
| MOBILE  | 手机号   |
| EMAIL   | 邮箱     |
| ADDRESS | 地址     |
| CERT    | 证件号码 |

日志处理会根据字段注解决定规则，而不是只猜测字段名称。响应脱敏由 Jackson 序列化器处理；项目使用 Jackson 作为 Spring MVC 主 JSON 序列化，Fastjson2用于部分内部 JSON 能力。

## 永不返回密码

用户实体密码字段应通过序列化忽略确保任何接口场景都不返回。编辑页面不依赖密码回显；重置密码使用独立表单和接口。

## 生产日志检查

- 关闭 root DEBUG。
- 关闭 SQL 全量打印或进行采样。
- 不记录 Authorization、Cookie、密码、验证码和密钥。
- 配置日志滚动、大小和保留天数。
- 异常响应不包含堆栈和服务器绝对路径。
- 系统参数初始化只输出普通配置，敏感配置统一显示 `******`。
