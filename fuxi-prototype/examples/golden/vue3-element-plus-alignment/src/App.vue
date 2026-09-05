<script setup>
import { ref } from 'vue'

const keyword = ref('')
const appliedKeyword = ref('全部项目')
function applyFilter() {
  appliedKeyword.value = keyword.value || '全部项目'
}
</script>

<template>
  <main class="workspace">
    <header><strong>伏羲原型</strong><span>项目列表 / {{ appliedKeyword }}</span></header>
    <section class="query-bar">
      <el-input v-model="keyword" placeholder="输入项目名称" aria-label="项目名称" />
      <el-button type="primary" @click="applyFilter">筛选</el-button>
    </section>
    <section class="table-shell" aria-label="项目列表">
      <div class="table-head"><span>项目</span><span>状态</span><span>更新时间</span></div>
      <div class="table-row"><span>黄金样例</span><span>草稿</span><span>本地 fixture</span></div>
    </section>
  </main>
</template>

<style scoped>
.workspace { min-height: 360px; color: #171d2a; background: #fff; border: 1px solid #c9d0dc; font: 14px Arial, sans-serif; }
header { display: flex; justify-content: space-between; padding: 12px 16px; color: #fff; background: #2d5cf6; }
.query-bar { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid #dfe3ea; }
.table-head, .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 10px 16px; border-bottom: 1px solid #dfe3ea; }
.table-head { background: #f7f8fa; font-weight: 600; }
</style>
