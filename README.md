# Unicode 符号选择器

> 搜索、复制 Unicode 核心符号，并查看码点、UTF-8、HTML、CSS 与 JavaScript 编码。

🌐 **在线演示**：<https://unicode.wangruofeng007.com/>

基于 Unicode 17.0.0 的纯前端符号选择器：Astro 静态站点 + 原生 TypeScript，无后端、无运行时框架。

## 特性

- **9473 个符号** —— 覆盖 Unicode 17.0.0 标点、货币、数学、箭头、几何、装饰、星座、棋类、音乐等核心区段
- **中英双语** —— 简体中文 / English 一键切换，搜索同时匹配字符、码点、中英文名称与关键词
- **一键复制** —— 点击符号即复制到剪贴板，悬浮显示名称与码点
- **完整编码** —— Unicode 码点、十进制、UTF-8、HTML（十六进制/十进制）、CSS content、JavaScript 转义
- **收藏与最近使用** —— 本地存储，常用字符随取随用
- **SEO 静态页** —— 分类 / 区段 / 符号详情页预渲染，便于搜索引擎收录
- **PWA 离线** —— Service Worker 缓存应用骨架与版本化数据
- **深浅色主题** —— 跟随系统或手动切换

## 技术栈

- [Astro](https://astro.build/) 5.x —— 静态站点生成（零客户端框架）
- 原生 TypeScript —— 交互逻辑（搜索、复制、i18n、状态管理）
- 构建期脚本 —— 从 Unicode 官方 UCD 解析、分类、生成中文名与搜索索引

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器 http://localhost:4321
```

## 构建

```bash
npm run build      # 生成静态站点到 dist/
npm run preview    # 本地预览构建产物
```

## 数据管线

符号数据在构建期由脚本从 Unicode 官方 [UCD](https://www.unicode.org/ucd/) 生成，产物位于 `public/data/17.0.0/`。

```bash
npm run data:download   # 下载 Unicode 17.0.0 UCD 原始数据到 data/ucd/
npm run data:parse      # 解析 UCD，生成 data/generated/symbols.json（含中文名）
npm run data:index      # 生成 catalog / 分类 / 区段 / 详情 / sitemap 分片到 public/data/
npm run data:validate   # 校验数据完整性（9473 条记录）
npm run data:build      # 以上四步的完整流水线
```

> 仓库已提交生成好的 `public/data/`，日常开发无需重跑数据管线。仅当升级 Unicode 版本或调整分类/翻译规则时才需要重新生成。

## 部署

本项目部署在 GitHub Pages，使用自定义域名 `unicode.wangruofeng007.com`。

- 推送到 `main` 分支即触发 `.github/workflows/deploy.yml`，自动构建并部署。
- 仓库 Settings → Pages → Source 设为 **GitHub Actions**。
- 自定义域名通过 `public/CNAME` 声明。

### 配置自定义域名

在你的 DNS 服务商添加以下记录：

| 类型  | 主机名  | 值                          |
| ----- | ------- | --------------------------- |
| CNAME | unicode | wangruofeng.github.io       |

DNS 生效后，在仓库 **Settings → Pages → Custom domain** 填入 `unicode.wangruofeng007.com` 并启用 **Enforce HTTPS**。

## License

[MIT](./LICENSE)
