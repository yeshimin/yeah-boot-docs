# YeahBoot Docs

YeahBoot 官方技术文档，使用 VitePress 生成静态 HTML。

## 本地开发

```bash
npm install
npm run dev
```

默认访问地址为 `http://localhost:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

构建结果位于 `docs/.vitepress/dist`。本站仓库仅维护文档源码和构建产物，不包含服务器、域名或反向代理部署配置。

## 内容约定

- 文档源码位于 `docs/`。
- 导航和 SEO 配置位于 `docs/.vitepress/config.mts`。
- 样式位于 `docs/.vitepress/theme/custom.css`。
- 文档中的账号、密码、Token、密钥和连接地址只能使用示例占位值。
