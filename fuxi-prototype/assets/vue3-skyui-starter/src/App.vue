<script setup lang="ts">
import { computed, ref } from 'vue';

type AssetRow = { id: string; name: string; code: string; category: string; status: '启用' | '停用'; owner: string; updatedAt: string };
const keyword = ref('');
const selectedCategory = ref('全部分类');
const modalVisible = ref(false);
const assetName = ref('');
const rows = ref<AssetRow[]>([
  { id: '1', name: '患者基础信息', code: 'patient_base', category: '业务数据', status: '启用', owner: '林燕燕', updatedAt: '2026-08-17 10:32' },
  { id: '2', name: '就诊记录', code: 'visit_record', category: '临床数据', status: '启用', owner: '陈产品', updatedAt: '2026-08-16 15:06' },
  { id: '3', name: '院区字典', code: 'hospital_area', category: '基础配置', status: '停用', owner: '叶产品', updatedAt: '2026-08-15 11:48' },
]);
const columns = [
  { title: '序号', dataIndex: 'id', width: 80 }, { title: '数据名称', dataIndex: 'name', minWidth: 180 },
  { title: '数据编码', dataIndex: 'code', width: 190 }, { title: '所属分类', dataIndex: 'category', width: 150 },
  { title: '状态', dataIndex: 'status', width: 90, slotName: 'status' }, { title: '修改人', dataIndex: 'owner', width: 120 },
  { title: '修改时间', dataIndex: 'updatedAt', width: 170 }, { title: '操作', width: 150, slotName: 'action' },
];
const filteredRows = computed(() => rows.value.filter((row) => {
  const query = keyword.value.trim().toLowerCase();
  return (!query || `${row.name}${row.code}`.toLowerCase().includes(query)) && (selectedCategory.value === '全部分类' || row.category === selectedCategory.value);
}));
function createAsset() {
  if (!assetName.value.trim()) return false;
  rows.value.unshift({ id: String(rows.value.length + 1), name: assetName.value, code: 'new_asset', category: '业务数据', status: '启用', owner: '当前用户', updatedAt: '2026-08-17 11:30' });
  assetName.value = ''; modalVisible.value = false; return true;
}
</script>

<template>
  <div class="app-shell">
    <header class="product-header"><div class="global-entry">◆　●　<strong>医院</strong></div><button>建模开发平台　×</button><button class="active">数据资产管理　×</button><span class="header-user">吴昇志⌄　▢</span></header>
    <div class="application-frame">
      <aside class="module-sidebar"><button class="active">数据资产</button><button>标准管理</button><button>映射管理</button><button>基础配置　⌄</button></aside>
      <section class="workspace-shell">
        <nav class="workspace-tabs"><button class="active">数据资产管理　×</button></nav>
        <div class="management-layout">
          <aside class="tree-pane"><sky-input placeholder="搜索分类" allow-clear /><div class="tree"><button class="selected">▼　全部分类</button><button v-for="item in ['业务数据', '临床数据', '基础配置', '公共数据']" :key="item" :class="{ selected: selectedCategory === item }" @click="selectedCategory = item">　▶　▱　{{ item }}</button></div></aside>
          <main class="data-pane">
            <div class="page-tabs"><button class="active">实体数据</button><button>字段配置</button><button>关联关系</button></div>
            <div class="query-bar"><label>名称：</label><sky-input v-model="keyword" placeholder="请输入关键字搜索" allow-clear /><label>状态：</label><sky-select model-value="全部状态" :options="['全部状态', '启用', '停用'].map(value => ({ label: value, value }))" :allow-search="false" /><sky-button type="primary">查询</sky-button><sky-button @click="keyword = ''; selectedCategory = '全部分类'">重置</sky-button></div>
            <div class="table-wrap"><sky-empty v-if="!filteredRows.length" show-img img-type="noData" description="暂无数据" /><sky-table v-else row-key="id" size="small" bordered :pagination="false" :columns="columns" :data="filteredRows"><template #status="{ record }"><span class="status" :data-status="record.status">{{ record.status }}</span></template><template #action><div class="row-actions"><button>编辑</button><button>血缘</button><button class="danger">删除</button></div></template></sky-table></div>
            <footer><span>共 {{ filteredRows.length }} 条　‹　<b>1</b>　›　30 条/页⌄</span><div><sky-button type="primary" @click="modalVisible = true">新增</sky-button><sky-button class="danger-button">批量删除</sky-button></div></footer>
          </main>
        </div>
      </section>
    </div>
    <sky-modal v-model:visible="modalVisible" title="新增数据资产" width="960px" :on-before-ok="createAsset"><sky-form :model="{ assetName }" class="starter-form" layout="horizontal"><sky-form-item label="资产名称" required><sky-input v-model="assetName" placeholder="请输入资产名称" /></sky-form-item><sky-form-item label="资产描述"><sky-textarea placeholder="请输入资产描述" :auto-size="{ minRows: 4, maxRows: 6 }" /></sky-form-item></sky-form></sky-modal>
  </div>
</template>
