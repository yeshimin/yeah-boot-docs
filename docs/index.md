---
layout: doc
title: 开始使用
description: YeahBoot 文档首页，包含项目启动、模块说明、开发、接口与部署文档入口。
---

# 开始使用

YeahBoot 是一套开源后台快速开发框架，基于 Java 21、Spring Boot 3.5 与 Vue 3。本文档记录项目的启动、配置、模块使用、前后端开发、接口参考和部署方式。

## 推荐阅读顺序

1. [快速开始](/guide/quick-start)：准备环境、初始化数据库并启动后端和管理后台。
2. [运行配置](/guide/configuration)：区分本地、测试和生产环境配置。
3. [项目结构](/guide/project-structure)：了解后端模块和管理后台目录的职责。
4. [管理功能](/modules/user)：了解内置的用户、角色、资源、文件和系统参数等模块。
5. [新增业务模块](/backend/new-module) 与 [新增业务页面](/frontend/new-page)：在现有项目上开发具体业务。
6. [部署方案](/deployment/overview) 与 [后端服务](/deployment/backend-service)：构建、发布、运行和上线检查。

## 当前技术基线

| 组成 | 技术 |
| --- | --- |
| 后端 | Java 21、Spring Boot 3.5、Spring Security、MyBatis-Plus |
| 管理后台 | Vue 3、TypeScript、Vite、Element Plus、Pinia |
| 数据与缓存 | MySQL、Redis |
| 常用扩展 | MinIO / 七牛、短信通知、WebSocket、Redis 消息队列 |

## 常用入口

- [项目介绍](/guide/introduction)
- [数据库初始化](/guide/database)
- [整体架构](/architecture/overview)
- [接口约定](/api/overview)
- [常见问题](/troubleshooting/common)

::: warning 演示环境
公开 Demo 只用于体验界面和交互，请勿录入真实账号、客户资料、联系方式或其他敏感数据。
:::
