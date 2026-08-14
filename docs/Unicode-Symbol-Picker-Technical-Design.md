# Unicode Picker 技术方案

> 参考项目：[wangruofeng/emoji-picker](https://github.com/wangruofeng/emoji-picker)
>
> 项目名：unicode-picker
>
> Unicode 数据版本：17.0.0

## 1. 方案结论

建议新建独立项目 unicode-picker，复用 emoji-picker 的产品体验和视觉体系，但不继续采用“单个 HTML 内嵌全部数据”的实现。

推荐架构：

> Astro 静态站点 + 原生 TypeScript 交互模块 + 构建期 Unicode 数据生成 + GitHub Pages + PWA

不需要后端和数据库，也不需要 React 运行时。

## 2. 现有项目分析

根据仓库的 [README](https://github.com/wangruofeng/emoji-picker/blob/main/README.md)、[项目约定](https://github.com/wangruofeng/emoji-picker/blob/main/CLAUDE.md) 和 [index.html](https://github.com/wangruofeng/emoji-picker/blob/main/index.html)，当前实现具有这些特点：

- 单个 index.html，零构建、零依赖
- Emoji 数据直接内嵌为 JavaScript 数组
- 支持 7 种语言
- 分类、搜索、收藏、最近使用
- Unicode、UTF-8、HTML、CSS、JavaScript 编码查看
- 深浅色主题
- PWA 离线缓存
- Cloudflare Pages 静态部署
- 动态内容使用 textContent，XSS 处理比较规范

但当前 index.html 已超过 3.5 万行，并且：

- 搜索使用数组全量 filter
- 分类切换会清空并重建整个网格
- 所有数据随 HTML 一次性加载
- 收藏查询会重复构建 Map
- Emoji 数据、UI、搜索、编码逻辑耦合在一个文件里

Unicode 符号首版包含 9,555 个 S* + P* 符号码点，以及 `Enclosed Alphanumerics` 区块内常作列表与标签符号使用的 `No` 字符；继续内嵌会让 HTML 更大，因此需要拆分数据层。

另外，现有详情复制逻辑存在一个迁移时应修正的问题：

~~~js
copyAndToast(t('copied', { x: value }), t('copiedShort'));
~~~

这里复制进去的是“已复制 U+21E3”这样的提示文本，正确实现应该是：

~~~js
copyAndToast(value, t('copiedShort'));
~~~

## 3. 技术选型

| 方案 | 优点 | 问题 | 结论 |
|---|---|---|---|
| 单文件 HTML | 部署简单、无构建 | 数据过大、难维护、SEO 页面受限 | 不推荐 |
| Vite + 原生 TypeScript | 轻量、开发体验好 | 分类页、详情页静态生成能力较弱 | 可选 |
| Astro + 原生 TypeScript | 静态输出、SEO 友好、支持交互岛 | 引入构建步骤 | 推荐 |
| Next.js/React | 生态完整 | 对纯静态工具偏重 | 不需要 |

Astro 只负责页面结构、静态生成和数据装载，选择器交互仍使用原生 TypeScript。

## 4. 总体架构

~~~mermaid
flowchart TD
    A["Unicode UCD / CLDR"] --> B["数据生成与校验脚本"]
    B --> C["分类数据与搜索索引"]
    C --> D["Astro 静态构建"]
    D --> E["GitHub Pages"]
    E --> F["选择器 / 收藏 / PWA"]
~~~

核心原则：

- Unicode 官方数据只在构建阶段处理
- 浏览器只加载当前需要的数据
- 数据使用版本化静态 JSON
- 收藏、主题、最近使用全部保存在本地
- 不上传用户输入
- Emoji 完整序列继续由原来的 Emoji Picker 承载

## 5. 产品范围

### 5.1 MVP：Unicode 核心符号

使用 Unicode 17.0 中以下 General Category：

~~~text
Sm  数学符号
Sc  货币符号
Sk  修饰符号
So  其他符号

Pc  连接标点
Pd  破折号
Ps  开始标点
Pe  结束标点
Pi  前置引号
Pf  后置引号
Po  其他标点
~~~

另纳入 `Enclosed Alphanumerics` 区块内的 82 个 `No`（Other Number）字符，包括带圈和括号数字；共 9,555 个码点，数据来自 [Unicode Character Database 17.0](https://www.unicode.org/Public/17.0.0/ucd/)。

### 5.2 与 Emoji Picker 的关系

Unicode Picker 保留 Emoji 相关单码点，但添加属性：

~~~ts
isEmoji: true
~~~

详情页提供：

~~~text
查看完整 Emoji、肤色和组合变体 →
emoji-picker.wangruofeng007.com
~~~

不在新项目里重复维护 3,953 个 Emoji 序列。

### 5.3 后续扩展

- 全部 159,801 个 Unicode 字符
- 组合音标
- 罗马数字、上下标
- 数学字母
- 盲文
- 不可见字符
- 控制字符与双向文本字符

## 6. 项目目录

以下为当前实现的实际结构：

~~~text
unicode-picker/
├── public/
│   ├── data/
│   │   └── 17.0.0/
│   │       ├── manifest.json
│   │       ├── catalog.zh-CN.json
│   │       ├── catalog.en.json
│   │       ├── hot.json
│   │       ├── categories/
│   │       ├── blocks/
│   │       └── details/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── robots.txt
│   ├── sitemap.xml
│   └── sw.js
├── scripts/
│   ├── download-unicode.mjs
│   ├── parse-ucd.mjs
│   ├── classify-symbols.mjs
│   ├── name-zh.mjs
│   ├── build-search-index.mjs
│   └── validate-data.mjs
├── src/
│   ├── assets/
│   │   └── fonts/            # 自托管符号字体 + OFL 许可证
│   ├── client/
│   │   └── app.ts            # 选择器全部交互逻辑
│   ├── components/
│   │   ├── Header.astro
│   │   ├── SearchBar.astro
│   │   ├── CategoryTabs.astro
│   │   ├── SymbolGrid.astro
│   │   ├── DetailPanel.astro
│   │   └── DetailModal.astro
│   ├── lib/
│   │   ├── types.ts
│   │   ├── catalog.ts
│   │   ├── search.ts
│   │   ├── encoding.ts
│   │   ├── clipboard.ts
│   │   ├── storage.ts
│   │   ├── i18n.ts
│   │   ├── taxonomy.ts
│   │   └── build-data.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── category/[slug].astro
│   │   ├── block/[slug].astro
│   │   └── symbol/[codepoint].astro
│   └── styles/
│       └── global.css
├── tests/
├── astro.config.mjs
└── package.json
~~~

## 7. 数据结构

~~~ts
interface UnicodeSymbol {
  id: string;                    // u-21e3
  value: string;                 // ⇣
  codePoints: string[];          // ["U+21E3"]

  name: string;                  // DOWNWARDS DASHED ARROW
  nameZh?: string;               // 向下虚线箭头
  aliases: string[];
  keywords: string[];

  generalCategory: string;       // So
  block: string;                 // Arrows
  script: string;                // Common
  plane: number;
  unicodeVersion: string;

  categories: string[];          // ["arrows", "ui"]
  isEmoji: boolean;
  isInvisible: boolean;
  isCombining: boolean;

  htmlHex: string;               // &#x21E3;
  htmlDecimal: string;           // &#8675;
  cssEscape: string;             // \21E3
  jsEscape: string;              // \u21E3
  utf8: string;                  // E2 87 A3
}
~~~

不要使用字符本身作为收藏主键，建议使用稳定 ID：

~~~text
单码点：u-21e3
多码点：seq-1f468-200d-1f4bb
~~~

这样可以避免变体选择符和规范化造成匹配错误。

## 8. 数据生成流程

### 8.1 输入文件

~~~text
UnicodeData.txt
DerivedName.txt
Blocks.txt
Scripts.txt
DerivedAge.txt
NameAliases.txt
PropList.txt
emoji-data.txt
~~~

### 8.2 处理步骤

1. 下载固定版本的 UCD.zip
2. 解析 UnicodeData.txt
3. 展开 First / Last 范围
4. 过滤 S* 和 P*
5. 合并 Block、Script、Age、Alias
6. 标注 Emoji 属性
7. 根据规则生成产品分类
8. 生成中英文搜索文本
9. 生成分类和详情分片
10. 校验数量、重复 ID 和非法码点

版本信息写入：

~~~json
{
  "unicodeVersion": "17.0.0",
  "generatedAt": "2026-08-10T00:00:00Z",
  "symbolCount": 9555,
  "schemaVersion": 1,
  "checksum": "..."
}
~~~

构建时必须断言：

~~~ts
assert(symbols.length === 9555);
assert(new Set(symbols.map(x => x.id)).size === symbols.length);
~~~

## 9. 产品分类

官方分类用于数据过滤，产品分类用于用户浏览：

~~~text
热门符号
箭头
数学
货币
标点
括号与引号
几何图形
星星与装饰
对勾与状态
UI 与键盘
方框与制表
圆圈字符
上下标
音乐
游戏与棋类
天文与星座
宗教与文化
天气与自然
其他符号
~~~

分类规则独立配置：

~~~ts
interface CategoryRule {
  id: string;
  names: Record<string, string>;
  blocks?: string[];
  ranges?: Array<[number, number]>;
  include?: string[];
  exclude?: string[];
  keywords?: string[];
  priority: number;
}
~~~

一个字符可以属于多个分类。

### 9.1 虚拟分类

分类栏除产品分类外还有四个客户端内置的**虚拟分类**，不参与数据生成，也不出现在静态分类页：

~~~text
all        全部
recent     最近使用（本地存储）
favorites  收藏（本地存储）
emoji      Emoji —— 按 isEmoji 字段过滤，不修改符号的 categories
~~~

虚拟分类与分类过滤逻辑集中在 `src/lib/taxonomy.ts`：`VIRTUAL_CATEGORY_IDS` 声明 ID 列表，`isVirtualCategory` 校验 URL 参数，`filterSymbolsByCategory` 统一处理筛选，`CATEGORY_ORDER` 定义分类栏展示顺序。URL `?category=emoji` 可保存并恢复该筛选状态。

## 10. 数据加载策略

不建议首次打开就加载全部详情。

### 10.1 首屏加载

只加载：

~~~text
manifest.json
热门符号
分类元数据
当前语言的轻量搜索目录
~~~

### 10.2 搜索目录

只保留：

~~~ts
{
  id,
  value,
  name,
  nameZh,
  keywords,
  category,
  block
}
~~~

用户选中符号后，再按 Block 加载详细数据。

### 10.3 缓存策略

| 资源 | 策略 |
|---|---|
| HTML | Network First |
| 带版本号的 JSON | Cache First |
| 搜索目录 | Stale While Revalidate |
| 字体 | Cache First |
| manifest | Network First |

PWA 缓存名包含 Unicode 版本：

~~~js
const CACHE_NAME = 'unicode-picker-17.0.0-v1';
~~~

不要像现有项目一样首次安装时缓存全部数据。

## 11. 搜索方案

9,555 条数据不必一开始引入复杂搜索服务，可以在构建阶段生成标准化搜索字段。

~~~ts
searchText = [
  value,
  codePoint,
  name,
  nameZh,
  ...aliases,
  ...keywords
]
  .join('\u0001')
  .normalize('NFKC')
  .toLowerCase();
~~~

支持以下输入：

~~~text
⇣
U+21E3
21E3
&#x21E3;
down arrow
dashed arrow
向下箭头
虚线箭头
~~~

排序权重：

1. 字符完全匹配
2. Unicode 码点匹配
3. 名称完全匹配
4. 名称前缀匹配
5. 中文名称匹配
6. 关键词匹配
7. 模糊包含匹配

搜索结果先限制 200 条，滚动时继续加载。

如果以后扩展到全部 159,801 个字符，再把搜索放进 Web Worker。

## 12. 网格渲染

现有项目的 buildGrid 会一次创建全部 DOM。新项目建议：

- 默认每次渲染不超过 300～500 个节点
- 使用行级虚拟滚动
- 搜索结果分页或增量加载
- 使用事件委托，避免每个卡片绑定多个监听器
- 收藏状态使用 Set，不要频繁调用数组 includes

~~~ts
const favorites = new Set<string>();

grid.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest('[data-symbol-id]');
  if (!button) return;

  selectSymbol(button.dataset.symbolId!);
});
~~~

符号单元应使用真正的按钮：

~~~html
<button
  class="symbol-cell"
  data-symbol-id="u-21e3"
  aria-label="⇣ 向下虚线箭头 U+21E3"
>
  <span aria-hidden="true">⇣</span>
</button>
~~~

## 13. 详情面板

保留现有 Emoji Picker 的左右布局，新增：

- Unicode 码点
- 十进制编码
- UTF-8
- HTML 十六进制实体
- HTML 十进制实体
- CSS content
- JavaScript 转义
- General Category
- Unicode Block
- Script
- 加入版本
- 别名
- 相似字符
- 字体显示支持
- Emoji 跳转提示
- 分享链接

URL 状态同步：

~~~text
/?category=arrows&symbol=U%2B21E3
/?q=down-arrow&symbol=U%2B21E3
~~~

这样刷新和分享后仍能恢复当前界面。

## 14. 字体与显示兼容

符号字体已自托管在 `src/assets/fonts/`（随仓库提交 OFL 许可证文本），避免依赖外链 CDN：

- `Noto Sans Symbols 2` —— 主符号字体，全量加载
- `Noto Sans SignWriting`、`Unifont Symbols`、`Unifont Legacy Computing` —— subset 子集，按 `unicode-range` 覆盖 SignWriting、古笔画等缺字区域，按需加载

全局字体栈变量 `--symbol-font`：

~~~css
--symbol-font:
  "Noto Sans Symbols 2", "Noto Sans SignWriting", "Unifont Symbols", "Unifont Legacy Computing",
  "Noto Sans Symbols", "Segoe UI Symbol", "Apple Symbols", "Noto Color Emoji", sans-serif;
~~~

详情面板与弹窗的大字符改为渲染到 `<canvas>`：先以设备像素比绘制到临时画布，用像素级"已绘制边界"检测（`paintedBounds`）计算字形实际占位并居中缩放，避免不同字体度量导致视觉偏移；`document.fonts.ready` 后重绘一次保证自托管字体加载完成后的字形正确。

注意：

- Unicode 编码的是字符，不保证各平台字形完全一致
- 不要给所有符号强行添加 FE0F
- 组合字符预览时可加虚线圆圈 ◌
- 复制时只能复制原始字符，不能复制预览辅助字符
- RTL 和双向文本字符必须隔离显示
- 不可见字符需要使用占位图形和安全提示

## 15. 本地存储设计

使用命名空间，避免与 Emoji Picker 冲突：

~~~text
unicode-picker:theme
unicode-picker:lang
unicode-picker:recent
unicode-picker:favorites
unicode-picker:settings
~~~

存储结构带版本：

~~~json
{
  "version": 1,
  "items": ["u-21e3", "u-2193"]
}
~~~

收藏和最近使用建议保存 50～100 条。

## 16. SEO 页面

建议生成：

~~~text
/
/category/arrows/
/category/math/
/category/currency/
/block/arrows/
/block/mathematical-operators/
/symbol/u-21e3/
~~~

首版可以只生成：

- 首页
- 19 个产品分类页
- Unicode Block 聚合页
- 热门符号详情页

不必立即为全部字符生成 9,555 个低信息量页面。详情内容完善后再逐步开放索引。

复用现有项目中的：

- canonical
- Open Graph
- WebApplication JSON-LD
- sitemap
- robots.txt
- PWA manifest

## 17. 测试与验收

### 17.1 数据测试

- 总数等于 9,555
- ID 无重复
- 每项至少有一个码点
- 码点能还原原始字符
- 分类和 Block 有效
- 编码转换结果正确
- Unicode 版本一致

### 17.2 功能测试

- 搜索字符、中文、英文、码点
- 点击复制
- 编码字段复制
- 收藏、取消收藏
- 最近使用
- URL 状态恢复
- 深浅色模式
- 语言切换
- PWA 离线访问

### 17.3 性能目标

- 首屏 HTML：小于 100 KB gzip
- 初始 JavaScript：小于 100 KB gzip
- 首次数据：小于 250 KB gzip
- 搜索响应：P95 小于 50 ms
- 网格 DOM：少于 500 个节点
- 移动端 Lighthouse Performance：不低于 90

## 18. 实施阶段

### Phase 1：数据基础

- 建立 Astro 项目
- 编写 Unicode 下载和解析脚本
- 生成 9,555 条核心符号
- 建立产品分类规则
- 数据校验

### Phase 2：MVP 选择器

- 移植现有 UI
- 分类和搜索
- 点击复制
- 详情面板
- 收藏和最近使用
- 深浅色主题
- 响应式布局

### Phase 3：体验增强

- 多语言
- 搜索排序
- 相似符号
- URL 状态同步
- 字体兼容提示
- PWA 离线支持
- SEO 分类页

### Phase 4：平台化

- 全部 Unicode 字符浏览
- 文本字符反查
- 符号组合编辑器
- 收藏夹导入导出
- 与 Emoji Picker、SVG Studio 联动

## 19. 最终建议

保留 emoji-picker 作为轻量 Emoji 专用工具，新建 unicode-picker。两者共享设计语言和交互习惯，但 Unicode 项目采用可生成、可分片、可升级的数据架构。

这样后续 Unicode 18 发布时，只需升级数据版本并重新构建，不需要手动维护数千条符号。

## 20. 参考资料

- [wangruofeng/emoji-picker](https://github.com/wangruofeng/emoji-picker)
- [Unicode Standard 17.0](https://www.unicode.org/versions/Unicode17.0.0/)
- [Unicode Character Database 17.0](https://www.unicode.org/Public/17.0.0/ucd/)
- [Unicode Emoji Charts 17.0](https://www.unicode.org/emoji/charts-17.0/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [Unicode License v3](https://www.unicode.org/license.txt)
