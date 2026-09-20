---
title: 新增业务页面
description: 在 YeahBoot Admin 增加类型、接口、页面、路由和权限资源的完整步骤。
---

# 新增业务页面

## 1. 定义类型

在 `src/types` 定义实体、查询参数、创建参数和更新参数。不要在 View 中大量使用匿名对象或 `any`。

```ts
export interface ExampleItem {
  id: number;
  name: string;
  status: string;
}
```

## 2. 封装 API

在 `src/api` 中统一使用 `request<T>`：

```ts
export function queryExamples(params: ExampleQuery) {
  return request<PageResult<ExampleItem>>({
    url: "/admin/example/query",
    method: "get",
    params,
  });
}
```

下载和上传复用现有工具，不在页面重复解析 Blob 或 multipart。

## 3. 创建页面

页面放入 `src/views`，遵循现有列表结构：

- 搜索表单。
- 新增或批量操作区。
- 表格与分页。
- 详情、新增和编辑弹窗。

表单必须维护独立默认值：

```ts
function createDefaultForm() {
  return {
    id: undefined,
    name: "",
    status: "1",
  };
}
```

打开新增时创建新对象；关闭弹窗时先关闭，动画结束后再清理，避免用户看到字段瞬间切换。

## 4. 搜索和刷新

- 输入框和下拉框按 Enter 执行查询。
- 搜索时重置到第一页。
- 写操作完成后刷新当前数据。
- 关联关系变化时刷新所有受影响树或下拉项。
- 避免挂载阶段和 watch 同时触发相同查询。

## 5. 权限

视图按钮：

```vue
<el-button v-if="authStore.hasPermission('view:admin:example:create')">
  新增
</el-button>
```

接口仍直接调用，由后端 `api:` 权限决定是否成功。不要因为按钮可见就假设接口一定有权限。

## 6. 路由资源

在资源管理中配置页面路径和组件路径。系统页面可以补充固定组件映射；扩展页面可以使用与 `src/views` 相符的动态组件路径。

## 7. 验证

```bash
npm run type-check
npm run lint
npm run build
```

最后用至少两个角色验证：完整权限角色和只读角色。检查菜单、页面、按钮、接口 403、空数据、分页和弹窗重复打开。
