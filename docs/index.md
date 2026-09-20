---
layout: home
title: YeahBoot 文档
titleTemplate: false
description: YeahBoot 后台开发基础项目的安装、架构、权限、功能开发与部署文档。

hero:
  name: YeahBoot
  text: 清晰、实用的后台开发基础项目
  tagline: 基于 Java 8、Spring Boot 2.7 与 Vue 3，提供认证权限、系统管理、文件存储、运行时配置和常用工程能力。
  image:
    src: /logo.svg
    alt: YeahBoot
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 理解权限模型
      link: /architecture/permission
    - theme: alt
      text: 在线演示
      link: https://demo.yeahboot.com

features:
  - icon: 🔐
    title: 认证与权限
    details: JWT 与 Redis 联合维护登录状态，菜单、页面、按钮和接口权限各司其职。
  - icon: 🧩
    title: 模块化后端
    details: 启动工程、业务模块、通用数据和基础框架分层清晰，可完整使用也可按需裁剪。
  - icon: 🗂️
    title: 系统管理
    details: 用户、角色、资源、组织、岗位、字典、日志和动态系统参数形成完整闭环。
  - icon: 📦
    title: 文件存储
    details: 统一抽象本地、MinIO 和七牛存储，支持上传、下载、预览和引用保护。
  - icon: 🛠️
    title: 工程能力
    details: 统一异常、Trace ID、限流、数据脱敏、逻辑删除和 Excel 导入导出。
  - icon: 🚀
    title: 可直接部署
    details: 文档和官网使用静态托管，管理后台与 API 通过 Nginx 同源发布。
---

## 从哪里开始

- 第一次运行项目：阅读[快速开始](/guide/quick-start)。
- 准备配置环境：阅读[运行配置](/guide/configuration)。
- 理解授权设计：阅读[资源权限模型](/architecture/permission)。
- 开发新功能：阅读[新增业务模块](/backend/new-module)和[新增业务页面](/frontend/new-page)。
- 准备上线：阅读[部署方案](/deployment/overview)和[上线检查清单](/deployment/checklist)。

::: warning 演示环境
公开 Demo 只用于体验界面和交互，请勿录入真实账号、客户资料、联系方式或其他敏感数据。
:::
