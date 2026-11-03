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

## 紫色山景与动画

首页背景由内联 SVG、CSS 网格和少量渐变构成，无背景视频、远程图片或动画库。只有流星与三颗星星持续动画，使用 transform / opacity；手机保留两颗动态星星。

- 点击首屏右下角可暂停或播放，偏好保存在当前浏览器。
- 页面隐藏、首屏离开视野时自动暂停；尊重系统的“减少动态效果”。
- 搜索索引按需加载，站点资源带内容版本，更新后避免读取旧样式。
- 修改仓库入口：`themes/marshuo/layout/index.ejs` 中的项目卡片链接。
