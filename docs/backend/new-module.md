---
title: 新增业务模块
description: 在 YeahBoot 后端新增实体、DTO、Repo、Service、Controller、权限和文档的推荐流程。
---

# 新增业务模块

以下流程适用于新增一个管理端业务实体。示例使用 `Example`，请替换为真实业务名称。

## 1. 确定模块位置

- 系统权限类业务：放在 `yeah-upms`。
- 文件、地区等基础业务：放在 `yeah-basic`。
- 跨业务共享实体：放在 `yeah-biz-data`。
- 可独立复用且不依赖具体业务：评估放入 `yeah-framework`。

不要为了一个简单页面新建 Maven 模块。

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
