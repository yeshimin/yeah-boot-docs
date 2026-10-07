import { defineConfig } from "vitepress";

const SITE_URL = "https://docs.yeahboot.com/";
const DEFAULT_DESCRIPTION =
  "YeahBoot 后台开发基础项目的安装、架构、权限、功能开发与部署文档。";

function getCanonicalUrl(relativePath: string) {
  const pagePath = relativePath
    .replace(/(^|\/)index\.md$/, "$1")
    .replace(/\.md$/, "");
  return new URL(pagePath, SITE_URL).toString();
}

export default defineConfig({
  lang: "zh-CN",
  title: "YeahBoot 文档",
  description: DEFAULT_DESCRIPTION,
  base: "/",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://docs.yeahboot.com",
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#315cf4" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "YeahBoot 文档" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
  ],
  transformHead({ pageData }) {
    const canonicalUrl = getCanonicalUrl(pageData.relativePath);
    const description = pageData.description || DEFAULT_DESCRIPTION;
    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:title", content: pageData.title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { name: "twitter:card", content: "summary" }],
    ];
  },
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "YeahBoot",
    nav: [
      { text: "开始使用", link: "/" },
      { text: "架构", link: "/architecture/overview" },
      { text: "功能", link: "/modules/user" },
      { text: "开发", link: "/backend/crud" },
      { text: "部署", link: "/deployment/overview" },
      { text: "官网", link: "https://yeahboot.com" },
      { text: "在线演示", link: "https://demo.yeahboot.com" },
      {
        text: '<img class="vp-source-icon" src="/github.favicon.ico" alt="" aria-hidden="true">GitHub',
        link: "https://github.com/yeshimin/yeah-boot",
        target: "_blank",
        rel: "noopener noreferrer",
        noIcon: true,
      },
      {
        text: '<img class="vp-source-icon" src="/gitee.favicon.ico" alt="" aria-hidden="true">Gitee',
        link: "https://gitee.com/yeshimin/yeah-boot.git",
        target: "_blank",
        rel: "noopener noreferrer",
        noIcon: true,
      },
    ],
    sidebar: [
      {
        text: "开始使用",
        items: [
          { text: "文档首页", link: "/" },
          { text: "项目介绍", link: "/guide/introduction" },
          { text: "快速开始", link: "/guide/quick-start" },
          { text: "数据库初始化", link: "/guide/database" },
          { text: "运行配置", link: "/guide/configuration" },
          { text: "项目结构", link: "/guide/project-structure" },
        ],
      },
      {
        text: "架构设计",
        items: [
          { text: "整体架构", link: "/architecture/overview" },
          { text: "认证与 Token", link: "/architecture/authentication" },
          { text: "资源权限模型", link: "/architecture/permission" },
          { text: "数据与通用能力", link: "/architecture/data-layer" },
        ],
      },
      {
        text: "管理功能",
        items: [
          { text: "用户管理", link: "/modules/user" },
          { text: "角色与资源", link: "/modules/role-resource" },
          { text: "组织与岗位", link: "/modules/org-post" },
          { text: "字典管理", link: "/modules/dict" },
          { text: "地区管理", link: "/modules/area" },
          { text: "文件与存储", link: "/modules/file-storage" },
          { text: "日志与系统参数", link: "/modules/log-config" },
        ],
      },
      {
        text: "后端开发",
        items: [
          { text: "通用 CRUD", link: "/backend/crud" },
          { text: "接口返回与异常", link: "/backend/response-error" },
          { text: "系统参数", link: "/backend/system-config" },
          { text: "文件存储", link: "/backend/storage" },
          { text: "日志与数据安全", link: "/backend/logging-security" },
          { text: "限流", link: "/backend/rate-limit" },
          { text: "Excel 导入导出", link: "/backend/excel" },
          { text: "新增业务模块", link: "/backend/new-module" },
        ],
      },
      {
        text: "前端开发",
        items: [
          { text: "管理后台概览", link: "/frontend/overview" },
          { text: "请求与登录状态", link: "/frontend/request-auth" },
          { text: "菜单、路由与权限", link: "/frontend/menu-permission" },
          { text: "新增业务页面", link: "/frontend/new-page" },
        ],
      },
      {
        text: "接口参考",
        items: [
          { text: "接口约定", link: "/api/overview" },
          { text: "认证接口", link: "/api/auth" },
          { text: "管理接口", link: "/api/admin" },
          { text: "文件与公开接口", link: "/api/file" },
        ],
      },
      {
        text: "部署运维",
        items: [
          { text: "部署方案", link: "/deployment/overview" },
          { text: "Nginx 配置", link: "/deployment/nginx" },
          { text: "后端服务", link: "/deployment/backend-service" },
          { text: "公开 Demo", link: "/deployment/demo" },
          { text: "上线检查清单", link: "/deployment/checklist" },
        ],
      },
      {
        text: "帮助与参与",
        items: [
          { text: "常见问题", link: "/troubleshooting/common" },
          { text: "参与开发", link: "/contributing" },
          { text: "更新日志", link: "/changelog" },
          { text: "项目路线图", link: "/roadmap" },
        ],
      },
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "没有找到相关内容",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    outline: { level: [2, 3], label: "本页目录" },
    docFooter: { prev: "上一篇", next: "下一篇" },
    lastUpdated: { text: "最后更新于" },
    editLink: {
      pattern:
        "https://github.com/yeshimin/yeah-boot-docs/edit/master/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    footer: {
      message:
        'YeahBoot 官方技术文档 · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备2024075106号-6</a>',
      copyright: "Copyright © 2026 YeahBoot",
    },
    returnToTopLabel: "返回顶部",
    sidebarMenuLabel: "文档菜单",
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
});
