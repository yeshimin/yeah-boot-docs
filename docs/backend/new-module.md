---
title: 新增业务模块
description: 在 YeahBoot 后端新增实体、DTO、Repo、Service、Controller、权限和文档的推荐流程。
---

# 新增业务模块

以下流程适用于新增一个管理端业务实体。示例使用 `Example`，请替换为真实业务名称。

## 二次开发与升级边界

YeahBoot 的 `yeah-framework`、`yeah-biz-common` 和内置 `yeah-upms`、`yeah-basic`、`yeah-public` 模块应视为上游基线。除可回馈的通用缺陷修复外，不要将具体项目业务直接写入这些模块。

推荐为项目领域创建独立 Maven 模块，例如 `yeah-biz-order`、`yeah-biz-member`，并在模块内维护自己的 Entity、DTO、Mapper、Repo、Service 和 Controller。仅在根聚合、启动工程依赖、资源数据和数据库迁移处做最小接入，这样升级上游时更容易保留业务代码。

## 1. 确定模块位置

- 项目专属领域业务：新建独立 `yeah-biz-<domain>` 模块。
- 准备回馈给框架的系统权限能力：评估放入 `yeah-upms`。
- 准备回馈给框架的文件、地区等基础能力：评估放入 `yeah-basic`。
- 多个业务模块确实需要共享且不含领域语义的数据：评估放入 `yeah-biz-common`。
- 与业务无关、可复用的基础设施：评估放入 `yeah-framework`。

后二至四项属于框架演进，必须先确认它不是项目私有需求；普通二开默认选择独立业务模块。

## 2. 设计表和实体

表结构包含统一主键、逻辑删除和审计字段。根据查询设计必要索引，业务唯一性尽量由数据库约束兜底。

实体字段类型与数据库语义保持一致，并为状态、类型等值提供 Enum。

## 3. 数据访问

创建 Mapper 和 Repo：

- 简单单表查询复用 MyBatis-Plus。
- 列表需要关联名称时，避免逐行查询造成 N+1。
- 高频鉴权路径使用明确的聚合 SQL。

## 4. DTO 与校验

创建、更新和查询使用不同 DTO。对必填、长度、枚举、集合 ID 和业务唯一性分别校验。

```java
@NotBlank(message = "名称不能为空")
@Size(max = 64, message = "名称不能超过64个字符")
private String name;
```

密码、手机号等字段增加敏感注解；响应不应直接返回内部字段。

## 5. Service

Service 负责：

- 存在性和唯一性检查。
- 关联 ID 检查。
- 状态变更副作用。
- 文件使用标记。
- 事务边界。
- 删除关联保护。

优先复用已有 Repo、PasswordService、StorageManager、TokenService 等基础服务。

## 6. Controller 与权限

每个受保护接口添加 `api:` 权限：

```java
@PreAuthorize("@pms.hasPermission(this.getModule() + ':create')")
@PostMapping("/create")
public R<ExampleEntity> create(@Valid @RequestBody ExampleCreateDto dto) {
    return R.ok(exampleService.create(dto));
}
```

仅保留实际需要的通用 CRUD。写操作按重要程度增加 `@SysLog`。

## 7. 资源数据

在资源管理中：

1. 新增页面资源。
2. 按需新增 `view:` 按钮资源。
3. 新增所有后端 `api:` 接口资源。
4. 将接口挂载到相应页面或按钮。
5. 给测试角色授权并验证。

## 8. 验证

- 参数边界和重复数据。
- 普通角色的按钮展示。
- 无接口权限时返回 403。
- 禁用和删除的关联影响。
- 列表分页、排序和空数据。
- 日志中无敏感原值。
- Maven 构建通过。

最后同步新增前端页面文档和接口说明，避免功能存在但无人知道如何授权。

## 9. 升级验证

升级 YeahBoot 时，在独立升级分支先合并上游版本，再恢复自定义模块的最小集成改动。重点检查：

- Maven 模块与依赖版本是否仍能解析。
- 数据库迁移、资源权限和运行时系统参数是否完整。
- 管理后台的组件路径、`view:` 按钮资源与 `api:` 接口资源是否仍一致。
- `mvn clean package -DskipTests`、前端类型检查和生产构建是否通过。
