# AGENTS.md

Unicode 符号选择器：搜索、复制 Unicode 17.0.0 核心符号（9473 个），查看码点与各语言编码。
Astro 静态站点 + 原生 TypeScript（无运行时框架），数据在构建期由脚本生成并提交进仓库。

## 命令速查

```bash
npm run dev        # 开发服务器 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
npm run check      # astro check 类型检查
npm test           # node --import tsx --test tests/**/*.test.ts
npm run data:build # 数据管线全流程（日常不需要，数据已提交在 public/data/）
```

数据管线各步骤：`data:download` → `data:parse` → `data:index` → `data:validate`。
修改分类规则 / 翻译 / Unicode 版本后必须重跑 `data:index` 并重新生成 `public/data/`。

## 架构事实（改代码前必读）

- **路径规则（红线）**：站点部署在 GitHub Pages 子路径 `/unicode-symbol-picker/` 下。
  Astro 模板与 TS 代码中的 URL 一律用 `import.meta.env.BASE_URL` 拼接，
  **禁止硬编码根相对路径**（`/data/...` 在子路径下会 404）。
  `public/sw.js` 与 `public/manifest.webmanifest` 是静态文件，无法用 BASE_URL，
  必须用相对路径（相对自身位置解析）。
- **分类体系**：分类过滤与虚拟分类的统一入口是 `src/lib/taxonomy.ts`
  （`VIRTUAL_CATEGORY_IDS` / `isVirtualCategory` / `filterSymbolsByCategory` / `CATEGORY_ORDER`）。
  虚拟分类有 `all` / `recent` / `favorites` / `emoji` 四个；`emoji` 按 `isEmoji` 字段过滤，
  不修改符号的 `categories`。新增分类必须改 taxonomy.ts，不要在其他文件硬编码分类 ID。
- **字符显示**：详情面板与弹窗的大字符通过 `<canvas>` 渲染
  （`src/client/app.ts` 的 `drawCenteredCharacter` / `paintedBounds`，像素级居中缩放，
  `document.fonts.ready` 后重绘）。画布 `aria-hidden`，可访问名称由容器 `aria-label` 提供。
- **字体**：符号字体自托管在 `src/assets/fonts/`（含 OFL 许可证文本），
  经 `@font-face` + `unicode-range` 按需加载，栈变量为 `--symbol-font`。
  新增缺字区域字体：提交 subset 字体 + 许可证文本，并扩展 `--symbol-font` 与 unicode-range。
- **存储**：localStorage 键统一前缀 `unicode-picker:`（favorites / recent / theme / lang）。
- **复制**：只能复制原始字符，禁止复制预览辅助字符（如组合字符占位圆圈）。
- **无障碍**：动画（如收藏按钮 `favorite-pop` / `favorite-unpop`）必须保留
  `prefers-reduced-motion` 降级；图标按钮必须带 `aria-label`。
- **部署**：推送 `main` 触发 `.github/workflows/deploy.yml`，自动构建部署到
  <https://wangruofeng.github.io/unicode-symbol-picker/>。

## 深入文档

- `docs/Unicode-Symbol-Picker-Technical-Design.md` —— 架构、数据结构、数据管线、SEO/性能设计
- `docs/superpowers/specs/2026-08-11-emoji-category-filter-design.md` —— Emoji 分类过滤设计 spec
- `README.md` —— 项目介绍、数据管线、部署说明
