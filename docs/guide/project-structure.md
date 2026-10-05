---
title: 项目结构
description: YeahBoot 后端模块、前端目录和代码放置原则。
---

# 项目结构

## 后端仓库

```text
yeah-boot
├── yeah-admin                 管理后台启动工程
├── yeah-app                   App 独立启动工程
├── yeah-biz-common
│   ├── yeah-biz-data          跨业务实体、Mapper 与 Repo
│   └── yeah-biz-service       跨业务服务
├── yeah-biz-module
│   ├── yeah-basic             地区、文件、存储
│   ├── yeah-public            公开文件访问
│   └── yeah-upms              用户、角色、资源、组织等
└── yeah-framework
    ├── yeah-auth              认证鉴权与 Token
    ├── yeah-common-core       返回、异常、日志、校验等
    ├── yeah-common-data       系统通用数据层
    ├── yeah-flowcontrol       接口限流
    ├── yeah-generator         代码生成
    ├── yeah-mq                消息队列抽象
    ├── yeah-notification      通知能力
    ├── yeah-storage           存储抽象与实现
    └── yeah-websocket         WebSocket
```

### 放置原则

- 启动类与入口组合放在 `yeah-admin` 或 `yeah-app`。
- 具体业务 Controller、DTO 和 Service 放在对应 `yeah-biz-module`。
- 跨多个业务模块共享的实体与查询放在 `yeah-biz-common`。
- 与业务无关、可复用的框架能力放在 `yeah-framework`。
- 不要为了复用一行代码制造跨模块反向依赖。

### 二次开发与升级

二次开发将 `yeah-framework`、`yeah-biz-common` 和 `yeah-upms`、`yeah-basic`、`yeah-public` 等内置模块视为上游基线。项目领域代码推荐创建独立的 `yeah-biz-<domain>` 模块，而不是直接修改内置模块；启动工程仅保留模块依赖与入口装配。

这样升级 YeahBoot 时，冲突会集中在少量 Maven 集成文件和资源数据，而不会扩散到认证、权限、存储等通用实现。环境差异与凭据应保留在部署环境或 Jar 同级 `config/`，不要写入默认配置。

## 管理后台仓库

```text
src
├── api             接口请求封装
├── assets          全局样式与静态资源
├── components      可复用组件
├── composables     可复用组合式逻辑
├── constants       资源类型等常量
├── layouts         页面整体布局
├── router          固定路由、动态路由和守卫
├── stores          Pinia 状态
├── types           请求与响应类型
├── utils           请求、Token、下载和会话处理
└── views           页面模块
```

### 页面调用链

```text
View
  → src/api
  → src/utils/request.ts
  → /api 代理或生产 API 地址
  → 后端 Controller
```

新增页面时应同时考虑 TypeScript 类型、API 封装、资源路径、按钮视图权限和后端接口权限，而不是只创建一个 `.vue` 文件。

### 二次开发与升级

项目业务页面放在 `src/views/<domain>/`，接口和类型分别放在 `src/api/<domain>.ts`、`src/types/<domain>.ts`。不要将项目业务直接写入 `utils/request.ts`、认证 Store、系统路由映射或布局组件；这些是后台框架基础设施。

自定义页面资源使用非 `/system/**` 的路径，例如 `/biz/order`，组件路径填写 `biz/order/index`。路由会按该路径从 `src/views` 解析，无需为普通业务页面修改内置系统路由映射。

## 三个入口的边界

- `/admin/**`：管理后台接口。
- `/app/**`：App 业务接口。
- `/public/**`：明确允许匿名访问的接口。

公开接口必须显式使用公开访问标记；其他接口默认进入认证链路。管理接口还应根据功能增加权限表达式。
