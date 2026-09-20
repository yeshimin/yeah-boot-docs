---
title: 后端服务
description: YeahBoot Jar 发布、systemd 托管、配置注入、日志和健康检查建议。
---

# 后端服务

## 发布目录

```text
/opt/yeahboot/backend/
├── yeah-admin.jar
├── config/          服务器运行配置，不提交 Git
└── releases/        可选的历史版本
```

上传文件放在 `/var/lib/yeahboot/upload` 等独立持久化目录，不放进 Jar 或版本发布目录。

## systemd 示例

```ini
[Unit]
Description=YeahBoot Admin Service
After=network.target

[Service]
Type=simple
User=yeahboot
WorkingDirectory=/opt/yeahboot/backend
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/yeahboot/backend/yeah-admin.jar
Restart=on-failure
RestartSec=5
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

数据库、Redis、JWT 和存储凭据通过服务器配置文件、环境变量或配置中心注入，不直接写在 unit 文件或公开仓库。

## 常用命令

```bash
systemctl daemon-reload
systemctl enable yeahboot
systemctl start yeahboot
systemctl status yeahboot
journalctl -u yeahboot -f
```

## 发布与回滚

1. 保留当前可运行 Jar。
2. 上传新 Jar 到临时名称。
3. 校验文件大小或摘要。
4. 停止服务并替换。
5. 启动后检查日志和关键接口。
6. 失败时恢复旧 Jar 和兼容数据库版本。

数据库变更如果不可向后兼容，单纯回滚 Jar 可能无效；正式发布脚本应明确数据库回滚策略。

## 日志

- 生产环境 INFO 为主。
- root DEBUG 和 P6Spy 全量 SQL 只用于短期排查。
- 设置滚动大小、保留天数和磁盘告警。
- 使用 `reqId` / `traceId` 关联请求。
- 不打印认证头、密码、验证码和密钥。

## 健康检查

至少验证：

- 进程和端口正常。
- 数据库与 Redis 可用。
- 验证码接口可访问。
- 普通账号可以登录并读取自身信息。
- 上传存储已启用时，测试文件生命周期正常。

公开健康检查只返回必要状态，不泄露数据库、Redis、版本路径或异常堆栈。
