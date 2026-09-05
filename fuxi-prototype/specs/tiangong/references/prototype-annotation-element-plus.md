# Tiangong Annotation Implementation: Element Plus

This is the legacy full implementation profile for Element Plus. Read the component-independent `prototype-annotation.md` first, then use this file only for `.el-dialog__body`, `.el-drawer__body`, z-index, and Vue implementation details.

> 每个天宫平台原型**必须**包含原型说明系统。该系统在页面右侧展示功能说明面板，左侧界面各功能区块悬停时整体高亮并显示连线，帮助查看者快速理解界面功能。

---

## 系统概述

原型说明系统由三部分组成：

1. **右侧说明面板**（`.annotation-panel`）：固定宽度 340px，展示各功能区块的编号、标题和描述
2. **左侧高亮区块**（`.proto-element`）：界面各功能区块本身即为可交互区域，悬停时整体高亮
3. **SVG 连线层**：覆盖整个 `#app`，悬停时从左侧区块右边缘到右侧说明项左边缘绘制蓝色贝塞尔连线，连线中间带编号标签

弹窗/详情视图打开时，通过切换 `data-proto-id` 属性将说明系统切换到弹窗的独立说明内容。

---

## 布局规范

### 全局结构调整

生成原型时，在 `#app` 根元素内采用以下结构：

```html
<div id="app">
  <!-- Header 保持全宽 -->
  <div class="top-header">...</div>

  <!-- 原型容器 -->
  <div class="prototype-wrapper">
    <!-- 左侧主体（原有内容整体移入） -->
    <div class="main-body">
      <div class="layout">...</div>
    </div>

    <!-- 右侧说明面板 -->
    <div class="annotation-panel">...</div>
  </div>

  <!-- SVG 连线层（覆盖全屏，在 prototype-wrapper 之外） -->
  <svg id="proto-connections" class="proto-svg-layer"></svg>
</div>
```

### 关键约束

- `.prototype-wrapper`：`display: flex; height: calc(100vh - 48px); overflow: hidden;`
- `.main-body`：`flex: 1; overflow: hidden; min-width: 0;`
- `.annotation-panel`：`width: 340px; flex-shrink: 0;`
- `#proto-connections`：`position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 80;`
- Header（`.top-header`）**必须**放在 `.prototype-wrapper` 之外，保持全宽

---

## 视觉规范

### 说明面板

| 元素 | 样式 |
|------|------|
| 面板背景 | `#fffbe6` |
| 面板左边框 | `2px dashed #fa8c16` |
| `PROTOTYPE` 角标 | 背景 `#fa8c16`，文字 `#ffffff`，字号 11px，字重 600，圆角 3px，内边距 `2px 6px` |
| "原型说明" 标题 | 字号 15px，字重 600，颜色 `#262626` |
| 提示条 | 背景 `#fff3cd`，边框 `1px solid #ffe4a3`，文字 `#595959`，字号 12px，圆角 6px |
| 分组标题（如"功能说明"） | 字号 14px，字重 600，颜色 `#262626`，左侧带图标 |

### 说明项卡片

| 元素 | 样式 |
|------|------|
| 卡片背景 | `#fffbeb` |
| 卡片边框 | `1px solid #fde68a` |
| 圆角 | `6px` |
| 编号圆圈 | 背景 `#fa8c16`，文字 `#ffffff`，直径 24px，字号 12px，字重 600 |
| 标题 | 字号 13px，字重 600，颜色 `#262626` |
| 描述 | 字号 12px，颜色 `#8c8c8c`，行高 1.5 |
| 悬停态 | 卡片背景 `#fef3c7`，边框色 `#f59e0b`，阴影 `0 2px 8px rgba(245,158,11,0.15)` |
| 激活高亮态 | 卡片背景 `#fde68a`，边框色 `#d97706`，阴影 `0 2px 8px rgba(245,158,11,0.25)` |

### 左侧高亮区块

| 元素 | 样式 |
|------|------|
| 默认态 | 无特殊样式（和正常区块一致） |
| 悬停态 | `box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.15); background-color: rgba(43, 95, 250, 0.03); border-radius: 6px;` |
| 激活高亮态 | `box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.2); background-color: rgba(43, 95, 250, 0.05); border-radius: 6px;` |
| 过渡动画 | `transition: all 0.2s ease;` |

### 连线与标签

| 元素 | 样式 |
|------|------|
| 连线颜色 | `#2b5ffa` |
| 连线线宽 | `2px`（默认），`3px`（激活） |
| 连线透明度 | `0.6`（默认），`1`（激活） |
| 编号标签背景 | 圆形 `#2b5ffa`，直径 22px |
| 编号标签文字 | `#ffffff`，12px，字重 600，居中 |

---

## 标记规范

### 哪些元素需要标记？

每个**独立的功能区块**都应是一个 `.proto-element`，并带有 `data-proto-id`：

| 区块类型 | 示例 |
|----------|------|
| 数据概览/统计卡片 | 订单总数、待处理数等统计区域 |
| 筛选/搜索栏 | 状态筛选、日期范围、关键词搜索 |
| 批量操作栏 | 全选、批量发货、导出数据 |
| 数据表格 | 列表主体（含表头和数据行） |
| 底部操作栏 | `.bottom-action-bar` 中的按钮组 |
| 树形导航 | 左侧树面板（如果功能复杂） |
| 详情信息区 | 弹窗/详情页中的基本信息区块 |
| 表单分区 | 弹窗中按功能分组的表单区域 |

### 编号规则

- 主页面：从 `1` 开始递增（`1, 2, 3, 4...`）
- 弹窗/详情页：加前缀 `d`（`d1, d2, d3...`）
- 次级视图（如抽屉、二级弹窗）：可加前缀 `s`（`s1, s2...`）

### 放置方式

- 在目标元素的 `class` 中添加 `proto-element`
- 在目标元素上添加 `data-proto-id="1"` 属性
- **不要**给目标元素添加独立的圆点标记，高亮效果由 CSS 统一控制

```html
<!-- 示例 -->
<div class="stats-section proto-element" data-proto-id="1">
  <!-- 统计卡片内容 -->
</div>
<div class="filter-section proto-element" data-proto-id="2">
  <!-- 筛选栏内容 -->
</div>
```

---

## 说明内容编写规范

### 标题

- 长度：**4-8 个汉字**
- 风格：名词短语，概括该区块的核心功能
- 示例：`数据统计卡片`、`综合筛选与搜索`、`批量操作栏`、`订单基本信息`

### 描述

- 长度：**30-60 个汉字**
- 内容要素：该区块展示什么数据、支持什么操作、起到什么作用
- 风格：客观说明，不用"请""您可以"等主观表达
- 示例：
  - ✅ `支持多维度筛选：按订单状态、下单时间范围、关键词进行精确查询，快速定位目标订单。`
  - ❌ `在这里您可以筛选订单。`（过于简略，缺少具体维度）

---

## 弹窗说明处理

### 切换机制

弹窗打开/关闭时，通过操作 DOM 的 `data-proto-id` 属性切换说明系统：

```javascript
// 弹窗打开时
function switchToModalMode() {
  // 隐藏主页面说明，显示弹窗说明
  document.getElementById('main-descs').style.display = 'none';
  document.getElementById('modal-descs').style.display = 'block';
  document.getElementById('desc-title').textContent = '订单详情说明';

  // 弹窗模式：面板移到左侧并提升层级，避免遮挡右侧弹窗/抽屉
  const panel = document.querySelector('.annotation-panel');
  const svg = document.getElementById('proto-connections');
  if (panel) {
    panel.classList.add('modal-mode');
    panel.style.zIndex = '2100';
    panel.style.position = 'fixed';
  }
  if (svg) {
    svg.classList.add('modal-mode');
    svg.style.zIndex = '2100';
    svg.style.position = 'fixed';
  }

  // 移除主页面元素的 data-proto-id，避免干扰连线
  document.querySelectorAll('.main-body .proto-element[data-proto-id]').forEach(el => {
    el.dataset.mainProtoId = el.getAttribute('data-proto-id');
    el.removeAttribute('data-proto-id');
  });

  // 给弹窗内元素添加 data-proto-id
  document.querySelectorAll('.el-dialog__body .modal-proto-element, .el-drawer__body .modal-proto-element').forEach((el, i) => {
    el.setAttribute('data-proto-id', 'd' + (i + 1));
    el.classList.add('proto-element');
  });

  // 重新绘制连线
  setTimeout(() => ProtoAnnotation.refresh(), 60);
}

// 弹窗关闭时
function switchToMainMode() {
  document.getElementById('modal-descs').style.display = 'none';
  document.getElementById('main-descs').style.display = 'block';
  document.getElementById('desc-title').textContent = '功能说明';

  const panel = document.querySelector('.annotation-panel');
  const svg = document.getElementById('proto-connections');

  // 恢复说明面板和连线层的位置与层级
  if (panel) {
    panel.classList.remove('modal-mode');
    panel.style.zIndex = '';
    panel.style.position = '';
  }
  if (svg) {
    svg.classList.remove('modal-mode');
    svg.style.zIndex = '';
    svg.style.position = '';
  }

  // 移除弹窗内元素的 data-proto-id
  document.querySelectorAll('.el-dialog__body .modal-proto-element, .el-drawer__body .modal-proto-element').forEach(el => {
    el.removeAttribute('data-proto-id');
    el.classList.remove('proto-element');
  });

  // 恢复主页面元素的 data-proto-id
  document.querySelectorAll('.main-body .proto-element').forEach(el => {
    if (el.dataset.mainProtoId) {
      el.setAttribute('data-proto-id', el.dataset.mainProtoId);
      delete el.dataset.mainProtoId;
    }
  });

  setTimeout(() => ProtoAnnotation.refresh(), 60);
}
```

### Vue 中的使用

在 Vue 的 `watch` 中监听弹窗可见状态：

```javascript
watch(detailDialogVisible, (val) => {
  nextTick(() => {
    if (val) switchToModalMode();
    else switchToMainMode();
  });
});
```

---

## 代码模板

以下代码可直接嵌入单文件 HTML 原型中。

### 1. CSS 部分（在 `<style>` 中追加）

```css
/* ===== 原型说明系统 ===== */

/* 容器 */
.prototype-wrapper {
  display: flex;
  height: calc(100vh - 48px);
  overflow: hidden;
}
.prototype-wrapper .main-body {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

/* 左侧高亮区块 */
.proto-element {
  transition: all 0.2s ease;
  border-radius: 6px;
}
.proto-element:hover {
  box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.15);
  background-color: rgba(43, 95, 250, 0.03);
}
.proto-element.active-highlight {
  box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.2);
  background-color: rgba(43, 95, 250, 0.05);
}

/* 说明面板 */
.annotation-panel {
  width: 340px;
  flex-shrink: 0;
  background: #fffbe6;
  border-left: 2px dashed #fa8c16;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.annotation-panel-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.annotation-panel-header {
  padding: 10px 12px;
  background: #fff3cd;
  border: 1px solid #ffe4a3;
  border-radius: 6px;
  margin-bottom: 12px;
}
.annotation-badge {
  display: inline-block;
  background: #fa8c16;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.annotation-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}
.annotation-hint {
  font-size: 12px;
  color: #595959;
  line-height: 1.6;
}
.annotation-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}
.annotation-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.proto-desc {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.proto-desc:hover {
  background-color: #fef3c7;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}
.proto-desc.active-highlight {
  background-color: #fde68a;
  border-color: #d97706;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
}
.proto-number {
  width: 24px;
  height: 24px;
  min-width: 24px;
  background: #fa8c16;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
}
.proto-content {
  flex: 1;
}
.proto-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}
.proto-item-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
}

/* SVG 连线层 */
.proto-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 80;
}
.connection-line {
  fill: none;
  stroke: #2b5ffa;
  stroke-width: 2;
  opacity: 0.6;
  transition: all 0.2s ease;
}
.connection-line.active {
  stroke-width: 3;
  opacity: 1;
}
.connection-label-bg {
  fill: #2b5ffa;
}
.connection-label {
  fill: #fff;
  font-size: 12px;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: central;
}

/* 弹窗内待连线的区块 */
.modal-proto-element {
  position: relative;
  transition: all 0.2s ease;
  border-radius: 6px;
}
.modal-proto-element:hover {
  box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.15);
  background-color: rgba(43, 95, 250, 0.03);
}
.modal-proto-element.active-highlight {
  box-shadow: 0 0 0 2px #2b5ffa, 0 4px 12px rgba(43, 95, 250, 0.2);
  background-color: rgba(43, 95, 250, 0.05);
}

/* 弹窗打开时：说明面板定位到左侧，避免遮挡右侧弹窗/抽屉；同时提升层级 */
.annotation-panel.modal-mode {
  position: fixed;
  left: 0;
  right: auto;
  top: 48px;
  height: calc(100vh - 48px);
  z-index: 2100;
  border-left: none;
  border-right: 2px dashed #fa8c16;
}
.proto-svg-layer.modal-mode {
  z-index: 2101;
}

/* 响应式：移动端隐藏说明面板 */
@media (max-width: 768px) {
  .annotation-panel { display: none; }
  .proto-svg-layer { display: none; }
}
```

### 2. HTML/Vue 模板部分

```html
<div id="app">
  <!-- Header（全宽，在 prototype-wrapper 之外） -->
  <div class="top-header">...</div>

  <div class="prototype-wrapper">
    <!-- 左侧主体 -->
    <div class="main-body">
      <div class="layout">
        <!-- 功能区块示例：添加 proto-element 和 data-proto-id -->
        <div class="stats-section proto-element" data-proto-id="1">
          <!-- 统计卡片内容 -->
        </div>
        <div class="filter-section proto-element" data-proto-id="2">
          <!-- 筛选栏内容 -->
        </div>
        <div class="table-section proto-element" data-proto-id="3">
          <!-- 表格内容 -->
        </div>
      </div>
    </div>

    <!-- 右侧说明面板 -->
    <div class="annotation-panel">
      <div class="annotation-panel-inner">
        <div class="annotation-panel-header">
          <div style="margin-bottom: 4px;">
            <span class="annotation-badge">PROTOTYPE</span>
            <span class="annotation-title">原型说明</span>
          </div>
          <div class="annotation-hint">
            以下内容为界面元素的功能说明，悬停左侧对应区域可高亮连线。
          </div>
        </div>
        <div class="annotation-section-title">
          <el-icon><List /></el-icon>
          <span id="desc-title">功能说明</span>
        </div>

        <!-- 主页面说明 -->
        <div id="main-descs" class="annotation-list">
          <div
            v-for="item in mainAnnotations"
            :key="item.id"
            class="proto-desc"
            :data-proto-id="item.marker"
          >
            <div class="proto-number">{{ item.marker }}</div>
            <div class="proto-content">
              <div class="proto-item-title">{{ item.title }}</div>
              <div class="proto-item-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <!-- 弹窗说明（默认隐藏） -->
        <div id="modal-descs" class="annotation-list" style="display: none;">
          <div
            v-for="item in dialogAnnotations"
            :key="item.id"
            class="proto-desc"
            :data-proto-id="item.marker"
          >
            <div class="proto-number">{{ item.marker }}</div>
            <div class="proto-content">
              <div class="proto-item-title">{{ item.title }}</div>
              <div class="proto-item-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SVG 连线层 -->
  <svg id="proto-connections" class="proto-svg-layer"></svg>

  <!-- 弹窗内也需添加 modal-proto-element -->
  <el-dialog v-model="detailDialogVisible" title="订单详情" width="520px" align-center>
    <div class="modal-proto-element" data-modal-idx="0">
      <!-- 基本信息 -->
    </div>
    <div class="modal-proto-element" data-modal-idx="1">
      <!-- 用户信息 -->
    </div>
  </el-dialog>
</div>
```

### 3. JavaScript 部分

在 Vue `setup()` 中定义说明数据，在 `onMounted` 中初始化连线系统：

```javascript
const { createApp, ref, computed, watch, nextTick, onMounted, onUnmounted } = Vue;

// ===== 原型说明系统数据 =====
const mainAnnotations = ref([
  {
    id: 'stats',
    marker: '1',
    title: '数据统计卡片',
    desc: '页面顶部展示订单核心数据概览，包括订单总数、待处理订单、待发货订单和已完成订单四个维度。卡片实时更新，帮助管理员快速掌握订单整体状态。'
  },
  {
    id: 'filter',
    marker: '2',
    title: '综合筛选与搜索',
    desc: '支持多维度筛选：按订单状态（待处理/已付款/已发货/已完成/已取消）、下单时间范围、关键词（订单号/用户名/手机号）进行精确查询，快速定位目标订单。'
  },
  {
    id: 'table',
    marker: '3',
    title: '订单列表与单笔操作',
    desc: '表格展示订单核心信息：编号、用户、商品、金额、状态和下单时间。每笔订单支持查看详情、修改状态、添加备注等操作，满足日常订单处理需求。'
  }
]);

const dialogAnnotations = ref([
  {
    id: 'd-basic',
    marker: 'd1',
    title: '订单基本信息',
    desc: '展示订单的核心标识信息：订单编号、下单时间、当前状态标签、订单来源渠道。帮助管理员快速确认订单身份和所处处理阶段。'
  },
  {
    id: 'd-user',
    marker: 'd2',
    title: '收货人信息',
    desc: '显示下单用户的姓名、脱敏处理后的联系电话，以及完整的收货地址。用于发货前的信息核对，确保物流配送准确无误。'
  }
]);

// ===== 弹窗说明切换 =====
function switchToModalMode() {
  document.getElementById('main-descs').style.display = 'none';
  document.getElementById('modal-descs').style.display = 'flex';
  document.getElementById('desc-title').textContent = '订单详情说明';

  // 弹窗模式：面板移到左侧并提升层级
  const panel = document.querySelector('.annotation-panel');
  const svg = document.getElementById('proto-connections');
  if (panel) {
    panel.classList.add('modal-mode');
    panel.style.zIndex = '2100';
    panel.style.position = 'fixed';
  }
  if (svg) {
    svg.classList.add('modal-mode');
    svg.style.zIndex = '2100';
    svg.style.position = 'fixed';
  }

  document.querySelectorAll('.main-body .proto-element[data-proto-id]').forEach(el => {
    el.dataset.mainProtoId = el.getAttribute('data-proto-id');
    el.removeAttribute('data-proto-id');
  });

  document.querySelectorAll('.el-dialog__body .modal-proto-element, .el-drawer__body .modal-proto-element').forEach((el, i) => {
    el.setAttribute('data-proto-id', 'd' + (i + 1));
    el.classList.add('proto-element');
  });

  setTimeout(() => ProtoAnnotation.refresh(), 60);
}

function switchToMainMode() {
  document.getElementById('modal-descs').style.display = 'none';
  document.getElementById('main-descs').style.display = 'flex';
  document.getElementById('desc-title').textContent = '功能说明';

  // 恢复说明面板和连线层的位置与层级
  if (panel) {
    panel.classList.remove('modal-mode');
    panel.style.zIndex = '';
    panel.style.position = '';
  }
  if (svg) {
    svg.classList.remove('modal-mode');
    svg.style.zIndex = '';
    svg.style.position = '';
  }

  document.querySelectorAll('.el-dialog__body .modal-proto-element, .el-drawer__body .modal-proto-element').forEach(el => {
    el.removeAttribute('data-proto-id');
    el.classList.remove('proto-element');
  });

  document.querySelectorAll('.main-body .proto-element').forEach(el => {
    if (el.dataset.mainProtoId) {
      el.setAttribute('data-proto-id', el.dataset.mainProtoId);
      delete el.dataset.mainProtoId;
    }
  });

  setTimeout(() => ProtoAnnotation.refresh(), 60);
}

// 监听弹窗状态
watch(detailDialogVisible, (val) => {
  nextTick(() => {
    if (val) switchToModalMode();
    else switchToMainMode();
  });
});

// ===== ProtoAnnotation 纯 JS 引擎 =====
const ProtoAnnotation = {
  svg: null,
  connections: [],

  init() {
    this.svg = document.getElementById('proto-connections');
    if (!this.svg) return;
    this.refresh();
    this.bindEvents();
    window.addEventListener('resize', () => this.refresh());
  },

  refresh() {
    if (!this.svg) return;
    this.drawConnections();
    this.bindEvents();
  },

  drawConnections() {
    this.svg.innerHTML = '';
    this.connections = [];

    const sourceEls = document.querySelectorAll('.proto-element[data-proto-id]');
    const descEls = document.querySelectorAll('.proto-desc[data-proto-id]');
    if (!sourceEls.length || !descEls.length) return;
    const svgRect = this.svg.getBoundingClientRect();
    const isModal = document.querySelector('.annotation-panel')?.classList.contains('modal-mode');

    sourceEls.forEach(sourceEl => {
      const protoId = sourceEl.getAttribute('data-proto-id');
      const descEl = document.querySelector(`.proto-desc[data-proto-id="${protoId}"]`);
      if (!descEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const descRect = descEl.getBoundingClientRect();

      let x1, y1, x2, y2;
      if (isModal) {
        // 弹窗模式：说明面板在左侧，弹窗元素在右侧
        x1 = descRect.right - svgRect.left;
        y1 = descRect.top + descRect.height / 2 - svgRect.top;
        x2 = sourceRect.left - svgRect.left;
        y2 = sourceRect.top + sourceRect.height / 2 - svgRect.top;
      } else {
        // 主页面模式：主元素在左侧，说明面板在右侧
        x1 = sourceRect.right - svgRect.left;
        y1 = sourceRect.top + sourceRect.height / 2 - svgRect.top;
        x2 = descRect.left - svgRect.left;
        y2 = descRect.top + descRect.height / 2 - svgRect.top;
      }

      const cp1x = x1 + (x2 - x1) * 0.5;
      const cp1y = y1;
      const cp2x = x1 + (x2 - x1) * 0.5;
      const cp2y = y2;

      // 路径
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
      path.setAttribute('class', 'connection-line');
      path.setAttribute('data-proto-id', protoId);
      this.svg.appendChild(path);

      // 编号标签
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bg.setAttribute('cx', midX);
      bg.setAttribute('cy', midY);
      bg.setAttribute('r', 11);
      bg.setAttribute('class', 'connection-label-bg');
      this.svg.appendChild(bg);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY);
      text.setAttribute('dy', '0.05em');
      text.setAttribute('class', 'connection-label');
      text.textContent = protoId.replace(/^d/, '');
      this.svg.appendChild(text);

      this.connections.push({ protoId, path, sourceEl, descEl });
    });
  },

  bindEvents() {
    // 清除旧事件（通过克隆替换）
    const newSvg = this.svg.cloneNode(true);
    this.svg.parentNode.replaceChild(newSvg, this.svg);
    this.svg = newSvg;

    document.querySelectorAll('.proto-element[data-proto-id]').forEach(el => {
      el.addEventListener('mouseenter', () => this.highlight(el.getAttribute('data-proto-id'), true));
      el.addEventListener('mouseleave', () => this.highlight(el.getAttribute('data-proto-id'), false));
    });

    document.querySelectorAll('.proto-desc[data-proto-id]').forEach(el => {
      el.addEventListener('mouseenter', () => this.highlight(el.getAttribute('data-proto-id'), true));
      el.addEventListener('mouseleave', () => this.highlight(el.getAttribute('data-proto-id'), false));
    });
  },

  highlight(protoId, active) {
    const conn = this.connections.find(c => c.protoId === protoId);
    if (!conn) return;
    if (active) {
      conn.path.classList.add('active');
      conn.sourceEl.classList.add('active-highlight');
      conn.descEl.classList.add('active-highlight');
    } else {
      conn.path.classList.remove('active');
      conn.sourceEl.classList.remove('active-highlight');
      conn.descEl.classList.remove('active-highlight');
    }
  }
};

// 在 Vue 挂载后初始化
onMounted(() => {
  setTimeout(() => ProtoAnnotation.init(), 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', ProtoAnnotation.refresh);
});
```

---

## 常见错误规避

1. **不要把 `.annotation-panel` 放进 `.main-body` 内部**。它必须是 `.prototype-wrapper` 的直接子元素，与 `.main-body` 并列。

2. **不要遗漏弹窗的说明内容**。弹窗打开时如果右侧面板仍显示主页面的说明，会造成信息不匹配。每个弹窗都应有独立的 `dialogAnnotations` 数组，并正确实现 `switchToModalMode`。

3. **说明描述不要过于简略**。"这里是筛选栏" 不如 "支持按订单状态、时间范围、关键词进行精确查询"。

4. **编号不要跳跃或重复**。主页面从 1 开始连续编号，弹窗从 d1 开始连续编号。

5. **SVG 连线层必须在 `#app` 内部、`.prototype-wrapper` 之外**。如果放在 `.prototype-wrapper` 内部，会被 `overflow: hidden` 裁切。

6. **弹窗内使用 `.modal-proto-element` 而非 `.proto-element`**。这是为了在弹窗关闭时能够精确区分和清理弹窗内的标记，避免和主页面元素混淆。

7. **弹窗模式下说明面板自动移动到左侧并提升 z-index**。Element Plus 的弹窗/抽屉通常从右侧出现，若说明面板仍留在右侧会遮挡弹窗内容。`switchToModalMode()` 中应给 `.annotation-panel` 添加 `modal-mode` 类（CSS 将其 `position: fixed; left: 0`），并设置 `z-index: 2100`，使其位于 Element Plus 遮罩（`z-index: 2000+`）之上。`switchToMainMode()` 中移除 `modal-mode` 类，面板回到 flex 布局的右侧。连线引擎需根据当前模式判断面板在左还是在右，动态调整贝塞尔曲线起点/终点。
