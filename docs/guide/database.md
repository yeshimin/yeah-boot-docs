---
title: 数据库初始化
description: YeahBoot 数据库脚本、核心表、逻辑删除和初始化检查说明。
---

# 数据库初始化

## 脚本顺序

后端仓库 `sql/` 目录将表结构、基础数据和地区数据拆分为多个压缩包。首次部署应先备份目标库，再按顺序导入；街道、村庄数据量较大，按实际业务选择。

推荐顺序：

1. 导入 `01.structure.sql.zip`：核心表结构与索引。
2. 导入 `02.data_without_area.sql.zip`：基础初始化数据，不含地区数据。
3. 导入 `03.data_area_level_1_to_3.sql.zip`：省、市、区县地区数据。
4. 按需导入 `04.data_area_level_4_to_5.sql.zip`：街道与村庄地区数据。

如只需要基础地区信息，导入前 3 个包即可；需要完整地区树时再导入第 4 个包。

对于已有环境，应按本项目发布时提供的数据库迁移方案升级；不要把全量初始化脚本直接覆盖到保留业务数据的库。

## MySQL 5.7 兼容导入

初始化脚本以 MySQL 8 为基线。若目标数据库为 MySQL 5.7.6+，可在后端仓库根目录使用 `script/mysql8_to_mysql57.py` 转换常见的 MySQL 8 排序规则和函数唯一索引。

函数唯一索引会转换为“存储生成列 + 普通唯一索引”，以保留逻辑删除场景下的唯一性约束。因此数据 Dump 使用 `INSERT INTO table VALUES (...)` 时，必须让脚本补充原始物理列名，避免把新增生成列计入值数量。

```bash
# 仅结构 SQL
python3 script/mysql8_to_mysql57.py \
  --input yeahboot_structure.sql \
  --output output/structure.mysql57.sql

# 仅数据 SQL：必须指定对应的原始结构 SQL
python3 script/mysql8_to_mysql57.py \
  --input yeahboot_data.sql \
  --schema yeahboot_structure.sql \
  --output output/data.mysql57.sql

# 结构和数据在同一个 SQL 文件时，不需要 --schema
python3 script/mysql8_to_mysql57.py \
  --input yeahboot_full.sql \
  --output output/yeahboot_full.mysql57.sql
```

结构与数据分开时，先导入转换后的结构文件，再导入转换后的数据文件。始终保留原始 MySQL 8 Dump；该脚本用于初始化空库，不用于覆盖已有业务数据的环境。

## 核心表

| 分类     | 主要表                            | 作用                   |
| -------- | --------------------------------- | ---------------------- |
| 用户权限 | `sys_user`、`sys_role`、`sys_res` | 用户、角色和资源主数据 |
| 授权关系 | `sys_user_role`、`sys_role_res`   | 用户角色与角色资源关系 |
| 资源管理 | `sys_res_group`、`sys_res_mount`  | 接口分组和视图接口挂载 |
| 组织岗位 | `sys_org`、`sys_post` 及关联表    | 组织树、岗位和用户关系 |
| 基础数据 | `sys_dict`、地区相关表            | 字典与行政区划         |
| 文件能力 | `sys_file`、`sys_storage`         | 业务文件与底层存储记录 |
| 运维管理 | `sys_log`、`sys_config`           | 系统日志和动态参数     |
| App      | `app_user`                        | App 用户信息           |

## 资源关系

`sys_res` 同时保存菜单、页面、按钮、接口和分组。接口资源通过 `group_id` 进入接口分组，通过 `sys_res_mount` 多对多挂载到视图资源。

角色授权最终仍落在 `sys_role_res`。其中视图资源直接保存资源 ID；通过挂载位置授权的接口资源还会记录挂载 ID，用于准确恢复授权树中的勾选位置。

## 逻辑删除

核心业务表使用 `deleted` 与 `delete_time`：

- `deleted = 0`：有效数据。
- `deleted = 1`：已逻辑删除。
- 删除时框架会同步填写 `delete_time`。

唯一约束如果需要允许“删除后重新创建相同业务编码”，必须结合当前数据库的索引设计验证，不能只依赖应用层校验。

## 初始化后检查

建议检查：

```sql
SELECT COUNT(*) FROM sys_user WHERE deleted = 0;
SELECT COUNT(*) FROM sys_role WHERE deleted = 0;
SELECT COUNT(*) FROM sys_res WHERE deleted = 0;
SELECT COUNT(*) FROM sys_role_res WHERE deleted = 0;
SELECT COUNT(*) FROM sys_config WHERE deleted = 0;
```

同时确认：

- 管理员用户已绑定管理员角色。
- 管理员角色拥有必要的视图与接口资源。
- 资源的 `permission` 全局唯一。
- 接口挂载不存在指向已删除资源的有效记录。
- 启用的动态参数可以在管理页面查询到。
- `sys_log` 包含 `client_ip` 字段，可用于审计来源检索。

::: warning 操作建议
公开 Demo 和生产环境不要直接执行带 `TRUNCATE` 的重建脚本。全量清理只适合确认无保留数据的本地开发库。
:::
