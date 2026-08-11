# Emoji 分类过滤设计

## 目标

在现有分类栏中增加 `Emoji` 过滤项。用户选择该项后，只展示目录数据中 `isEmoji === true` 的符号，并可通过 URL 保存和恢复选择状态。

## 范围

- 将 `emoji` 作为客户端内置分类，位置与“全部”“最近使用”“收藏”等内置筛选项相邻。
- 中文标签为 `Emoji`，英文标签为 `Emoji`。
- 使用现有 `CatalogSymbol.isEmoji` 字段筛选，不修改符号的 `categories` 数组。
- 支持 `?category=emoji`，刷新或分享链接后仍保持 Emoji 分类。
- 搜索、分页、详情、收藏和最近使用行为保持不变。

## 实现设计

分类栏渲染时把 `emoji` 加入内置分类 ID 列表。分类名称解析为 `Emoji`。基础数据筛选识别该 ID，并返回 `state.catalog.filter(symbol => symbol.isEmoji)`。URL 初始状态校验把 `emoji` 视为合法内置分类。

该方案复用目录已有的 Emoji 标记，不重建 Unicode 数据文件，也不新增静态分类页。搜索行为沿用现有规则：存在搜索词时仍在完整目录中搜索，因此分类选择不限制全局搜索结果。

## 边界与失败处理

- 当没有 Emoji 数据时，沿用现有空状态界面。
- 无效分类参数继续回退到 `popular`。
- 不改变 Emoji 的 Unicode 定义；是否属于 Emoji 完全以构建数据中的 `isEmoji` 为准。

## 验证

- 单元测试覆盖 `emoji` 仅返回 `isEmoji === true` 的符号。
- 验证 `?category=emoji` 可被接受并在 URL 中保留。
- 运行项目现有测试、类型检查和生产构建。
