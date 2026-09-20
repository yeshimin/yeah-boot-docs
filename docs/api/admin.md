---
title: 管理接口
description: 用户、角色、资源、组织、岗位、字典、日志和系统参数接口摘要。
---

# 管理接口

以下路径是当前管理后台实际使用的主要接口。除个人信息接口外，管理操作都应配置对应 `api:` 权限资源。

## 用户

基础路径：`/admin/sysUser`

| 方法 | 路径              | 说明                 |
| ---- | ----------------- | -------------------- |
| GET  | `/query`          | 用户分页列表         |
| GET  | `/detail`         | 用户详情             |
| POST | `/create`         | 新增用户             |
| POST | `/update`         | 编辑用户和关联关系   |
| POST | `/resetPassword`  | 重置密码，不主动踢下 |
| POST | `/delete`         | 批量删除             |
| GET  | `/importTemplate` | 下载导入模板         |
| POST | `/import`         | 导入用户             |
| GET  | `/export`         | 按 ID 或条件导出     |
| GET  | `/mine`           | 当前用户、角色和权限 |
| GET  | `/mineResources`  | 当前用户资源树       |
| POST | `/updateMine`     | 更新个人资料和密码   |

后端还保留用户角色、组织、岗位和资源查询或独立设置接口；当前页面创建、编辑主要通过用户 DTO 一次提交关联 ID。

## 角色

基础路径：`/admin/sysRole`

| 方法 | 路径                 | 说明                       |
| ---- | -------------------- | -------------------------- |
| GET  | `/crud/query`        | 角色分页列表               |
| GET  | `/detail`            | 角色详情                   |
| POST | `/create`            | 新增角色                   |
| POST | `/update`            | 编辑角色                   |
| POST | `/delete`            | 批量删除角色               |
| GET  | `/queryResourceTree` | 查询角色授权树             |
| POST | `/setResources`      | 全量设置视图资源与挂载接口 |

## 资源

基础路径：`/admin/sysRes`

| 方法 | 路径           | 说明                 |
| ---- | -------------- | -------------------- |
| GET  | `/viewTree`    | 视图资源树           |
| GET  | `/apiTree`     | 接口分组与接口资源树 |
| GET  | `/crud/detail` | 资源详情             |
| POST | `/create`      | 新增资源             |
| POST | `/update`      | 编辑资源             |
| POST | `/delete`      | 删除资源             |

接口分组：

| 方法 | 路径                        |
| ---- | --------------------------- |
| GET  | `/admin/sysResGroup/tree`   |
| POST | `/admin/sysResGroup/create` |
| POST | `/admin/sysResGroup/update` |
| POST | `/admin/sysResGroup/delete` |

挂载关系：

| 方法 | 路径                                  |
| ---- | ------------------------------------- |
| GET  | `/admin/sysResMount/queryByViewResId` |
| POST | `/admin/sysResMount/saveByViewResId`  |

## 组织和岗位

组织：

| 方法 | 路径                        |
| ---- | --------------------------- |
| GET  | `/admin/sysOrg/tree`        |
| GET  | `/admin/sysOrg/crud/detail` |
| POST | `/admin/sysOrg/create`      |
| POST | `/admin/sysOrg/update`      |
| POST | `/admin/sysOrg/delete`      |

岗位：

| 方法 | 路径                         |
| ---- | ---------------------------- |
| GET  | `/admin/sysPost/crud/query`  |
| GET  | `/admin/sysPost/crud/detail` |
| POST | `/admin/sysPost/create`      |
| POST | `/admin/sysPost/update`      |
| POST | `/admin/sysPost/delete`      |

## 字典

基础路径：`/admin/sysDict`

| 方法 | 路径           | 说明               |
| ---- | -------------- | ------------------ |
| GET  | `/tree`        | 字典树             |
| GET  | `/crud/detail` | 字典详情           |
| POST | `/create`      | 新增节点           |
| POST | `/update`      | 编辑或移动节点     |
| POST | `/delete`      | 删除，支持强制确认 |

## 日志和系统参数

| 方法 | 路径                            | 说明                    |
| ---- | ------------------------------- | ----------------------- |
| GET  | `/admin/sysLog/crud/query`      | 日志分页列表            |
| GET  | `/admin/sysLog/detail`          | 日志详情                |
| GET  | `/admin/sysConfig/crud/query`   | 参数分页列表            |
| GET  | `/admin/sysConfig/crud/detail`  | 参数详情                |
| POST | `/admin/sysConfig/create`       | 新增参数                |
| POST | `/admin/sysConfig/update`       | 编辑参数                |
| POST | `/admin/sysConfig/delete`       | 删除参数                |
| POST | `/admin/sysConfig/refreshCache` | 从数据库刷新 Redis 快照 |

## 地区

管理页面使用：

- `/area/tree`
- `/area/province/crud/*`
- `/area/city/crud/*`
- `/area/district/crud/*`

其中省份分页查询、街道和村庄的通用接口按当前产品范围被禁用；不要为已禁用入口创建可授权资源。
