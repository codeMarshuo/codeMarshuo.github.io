# Marshuo's Blog

Java 后端学习博客，使用 Hexo 与自定义 Marshuo 主题。线上：https://codemarshuo.github.io/

`source` 分支保存源码，`main` 保存生成页面。原始项目位置为 `D:\marshuoblog\myblog`；在其他本地副本编辑前，请先拉取最新 `source` 分支，避免用旧主题覆盖线上改版。

## 预览与发布

Node.js 22 或更新的 LTS 版本。安装依赖后构建、预览：

```sh
npm ci
npm run clean
npm run build
npm run server
```

发布时先将源码提交到 `source` 分支，然后运行 `npm run deploy`。`admin-server.js` 与 `admin-ui` 仅在本地使用。

## 写入技术栏目

文章位于 `source/_posts/`。文章开头的 `categories` 使用以下名称之一（区分大小写）：Java、Spring Boot、Redis、MySQL、JVM、JUC、Kafka、Spring Cloud、Elasticsearch。

```yaml
---
title: 我的第一篇 Redis 笔记
date: 2026-11-09 12:00:00
categories:
  - Redis
tags:
  - 缓存
---
```

本地后台的新建文章分类框提供这九个名称。新文章脚手架默认归入 Java，请按内容修改。多项平级分类请使用 Hexo 的独立分类列表格式，避免无意建立层级分类。

## 首页与待学清单

学习方向与知识点的唯一配置为 `source/_data/learning.json`。修改后重新构建即可更新首页和栏目页面。空栏目会自动生成；该栏目有文章后，由 Hexo 标准分类生成器接管，自动列出文章、更新篇数，保留待学入口。

勾选进度保存在每位访客自己的浏览器 `localStorage` 中，可取消勾选；首页和栏目页共享进度，不跨设备同步，不会修改作者的公开学习状态。无外部字体、动画库或图片依赖。深浅色、搜索、移动端、键盘导航均保留。
