# Marshuo's Blog

个人博客源码，使用 Hexo 与自定义 Marshuo Journal 主题。

- 在线网站：https://codemarshuo.github.io/
- 本分支 `source` 保存源码，`main` 保存生成的静态页面。
- 原始项目位置：`D:\marshuoblog\myblog`。

## 本地预览

使用 Node.js 22 或更新的 LTS 版本，运行：

```sh
npm ci
npm run build
npm run server
```

文章位于 `source/_posts/`，支持 Markdown。主题源码位于 `themes/marshuo/`；归档、标签和分类由 Hexo 自动生成。搜索数据在构建时生成，无需令牌或第三方服务。

## 发布

```sh
npm run clean
npm run build
npm run deploy
```

部署使用 Git 凭据管理器或 SSH 认证，不要将访问令牌写入任何项目文件。每次更新后，将源码提交并推送到 `source` 分支，再部署生成页面。`admin-server.js` 与 `admin-ui` 仅供本地编辑使用，不会发布到 GitHub Pages。
