# Git Hooks

启用项目提供的轻量提交检查：

```sh
git config core.hooksPath .githooks
```

默认 Hook 只检查暂存区空白错误。需要在每次提交前构建文档时：

```sh
YEAH_BOOT_RUN_DOCS_BUILD_ON_COMMIT=1 git commit -m "..."
```

完整构建、链接检查、SonarQube 和依赖漏洞扫描应由 CI 或交付安全流程执行。
