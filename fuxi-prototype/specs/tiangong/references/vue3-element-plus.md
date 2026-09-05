# Tiangong Profile: Vue 3 + Element Plus

Use this profile only for explicit Element Plus work or compatible existing prototypes. The design semantics live in the Tiangong main references; this file maps them to Element Plus components.

## 表格（el-table）

### 强制属性

```vue
<el-table :data="list" border style="width: 100%" size="small">
```

### 禁止
- `stripe`（斑马纹）
- 默认尺寸（必须用 `size="small"`）

### 操作列规范

```vue
<el-table-column label="操作" width="90" fixed="right">
  <template #default="{ row }">
    <el-button link type="primary" size="small">查看详情</el-button>
  </template>
</el-table-column>
```

操作列宽度：
- 单按钮：`width="90"`
- 双按钮（查看+编辑）：`width="120"`

### 表格底部操作栏

当表格下方需要主操作按钮时：

```vue
<div class="tab-pane-body">
  <div class="scroll-table-area">
    <el-table ... />
  </div>
  <div class="bottom-action-bar">
    <el-button type="primary">提交</el-button>
  </div>
</div>
```

## 页签（Tabs）

### 页面级页签（page-tabs）

用于多页面导航，支持关闭：

```vue
<div class="page-tabs">
  <div
    v-for="tab in pageTabs"
    :key="tab.key"
    class="tab-item"
    :class="{ active: activePageTab === tab.key }"
    @click="activePageTab = tab.key"
  >
    <span>{{ tab.label }}</span>
    <el-icon v-if="tab.closable" class="close-icon" @click.stop="closeTab(tab.key)">
      <Close />
    </el-icon>
  </div>
</div>
```

样式：灰底 `#f5f7fa`，active 有 `#2b5ffa` 下划线。

### 主内容页签（main-tabs）

用于内容区域内部的多视图切换：

```vue
<el-tabs v-model="activeMainTab" type="border-card" class="main-tabs">
```

通过 CSS 覆盖为扁平下划线风格：

```css
.main-tabs :deep(.el-tabs__item.is-active) {
  color: #2b5ffa;
  font-weight: 500;
}
.main-tabs :deep(.el-tabs__active-bar) {
  background-color: #2b5ffa;
  height: 2px;
}
```

### 二级页签（sub-tabs-bar）

用于详情页内部的多维度切换：

```vue
<div class="sub-tabs-bar">
  <div class="sub-tabs">
    <div
      v-for="tab in subTabs"
      :key="tab.key"
      class="sub-tab"
      :class="{ active: activeSubTab === tab.key }"
      @click="activeSubTab = tab.key"
    >
      <span class="sub-tab-icon"><el-icon><Document /></el-icon></span>
      <span class="sub-tab-label">{{ tab.label }}</span>
    </div>
  </div>
</div>
```

active 样式：
- `color: #2b5ffa`
- `background: #f0f5ff`
- `border-bottom-color: #2b5ffa`

## 弹窗（el-dialog）

### 详情弹窗

用于展示只读信息：

```vue
<el-dialog v-model="visible" title="详情" width="520px" align-center>
```

内容格式：标签-值两栏列表

```vue
<div class="detail-body">
  <div v-for="item in detailItems" :key="item.label" class="detail-row">
    <div class="detail-label">{{ item.label }}</div>
    <div class="detail-value">{{ item.value || '-' }}</div>
  </div>
</div>
```

### 操作弹窗

用于表单提交等操作：

```vue
<el-dialog v-model="visible" title="编辑" width="720px" align-center destroy-on-close>
```

Footer 按钮：右对齐，主操作在右。

## 表单（el-form）

### 必填项标记

不使用 label 中的 `*字段名:` 硬编码，而用 slot：

```vue
<el-form-item>
  <template #label>
    <span class="required-label">
      <span class="star">*</span>字段名称
    </span>
  </template>
  <el-input v-model="form.field" />
</el-form-item>
```

星号样式：

```css
.required-label .star {
  color: #f56c6c;
  margin-right: 2px;
}
```

### 只读字段

系统生成的字段应设置为 `disabled`：

```vue
<el-form-item label="编号">
  <el-input v-model="form.code" disabled />
</el-form-item>
```

## 树（tree-panel）

### 树节点样式

- 文件夹节点：`<el-icon><Folder /></el-icon>` 颜色 `#faad14`
- 叶子节点：`<el-icon><Document /></el-icon>` 颜色 `#52c41a`
- active 状态：`background: #e6f7ff; color: #1890ff`

### 使用建议

- 左侧树面板负责层级导航，宽度固定 `220px`
- 点击叶子节点可在右侧详情面板展示对应数据
- 树的深度建议控制在 3-4 层以内，保持清晰

## 标签（el-tag）

状态标签规范：

```vue
<!-- 主要状态 -->
<el-tag size="small" type="primary">主要</el-tag>

<!-- 警告状态 -->
<el-tag size="small" type="warning">警告</el-tag>

<!-- 成功状态 -->
<el-tag size="small" type="success">成功</el-tag>

<!-- 信息状态 -->
<el-tag size="small" type="info">信息</el-tag>

<!-- 危险状态 -->
<el-tag size="small" type="danger">危险</el-tag>
```

## 下拉框（el-select）

带标签选项的下拉框：

```vue
<el-select v-model="selectedId" size="small" style="width: 180px">
  <el-option
    v-for="item in list"
    :key="item.id"
    :label="item.name"
    :value="item.id"
  >
    <span style="float: left">{{ item.name }}</span>
    <el-tag
      size="small"
      :type="item.status === 'active' ? 'success' : 'info'"
      style="float: right; margin-top: 2px;"
    >
      {{ item.statusText }}
    </el-tag>
  </el-option>
</el-select>
```
