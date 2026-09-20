---
title: 通用 CRUD
description: CrudController 的使用、权限、禁用能力和安全查询条件说明。
---

# 通用 CRUD

`CrudController` 基于 MyBatis-Plus 提供创建、分页查询、详情、更新和删除五个基础入口。它适合规则简单的实体；涉及关联、状态流转或安全校验时应使用专用接口。

## 接入方式

Controller 继承通用类并设置稳定的接口权限模块：

```java
public ExampleController(ExampleService service) {
    super(service);
    this.setModule("api:admin:example");
}
```

生成的接口和权限：

| 方法 | 路径           | 权限                            |
| ---- | -------------- | ------------------------------- |
| POST | `/crud/create` | `api:admin:example:crud:create` |
| GET  | `/crud/query`  | `api:admin:example:crud:query`  |
| GET  | `/crud/detail` | `api:admin:example:crud:detail` |
| POST | `/crud/update` | `api:admin:example:crud:update` |
| POST | `/crud/delete` | `api:admin:example:crud:delete` |

每个入口都有独立 `@PreAuthorize`。创建、更新和删除还会记录数据操作系统日志。

## 禁用不安全或未使用入口

没有业务用途的通用接口必须显式关闭：

```java
this.setModule("api:admin:example")
        .disableCreate()
        .disableUpdate()
        .disableDelete();
```

禁用后接口仍可能存在路由映射，但会返回“该接口已被禁用”，不会执行数据库操作。资源管理中不应给角色配置这些已禁用能力。

## 参数校验分组

- 创建：使用 `Create` 校验组。
- 查询：使用 `Query` 校验组。
- 更新：使用 `Update` 校验组。
- 详情：要求 `id` 非空。
- 删除：Body 为 ID 集合。

复杂创建和编辑不要直接暴露 Entity，应定义 DTO 并在专用 Service 中处理。

## 分页查询

分页参数使用 MyBatis-Plus `Page`：

```text
current=1&size=10
```

列表接口应设置合理分页上限。一次获取大量权限或树数据时，优先使用明确的树或批量接口，不要用 `size=1000` 代替业务设计。

## 自定义条件

通用查询支持 `conditions_` 三段式条件：

```text
propertyName:operator:value
```

多个条件使用分号：

```text
username:likeRight:admin;createTime:sort:desc
```

字段必须是当前查询对象中的真实 Java 属性；后端会拒绝静态字段、合成字段和 `conditions_` 本身。操作符必须在固定枚举中，值通过 MyBatis 参数绑定进入 SQL。

::: warning
客户端传入的是 Java 属性名，不是数据库列名。字段到下划线列名的转换由查询工具统一完成。
:::

## 何时改为专用接口

出现以下任一情况时使用专用 Controller 和 Service：

- 操作多个表或关联关系。
- 删除前需要保护规则。
- 更新状态会触发 Token、文件或缓存处理。
- 返回 VO 而不是原始实体。
- 需要导入导出、树形组装或聚合查询。
- 需要与前端操作一一对应的权限和审计描述。
