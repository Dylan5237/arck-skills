<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
const notice = ref('等待查询')
function query() { notice.value = keyword.value ? `查询：${keyword.value}` : '查询全部项目' }
function reset() { keyword.value = ''; notice.value = '已重置' }
</script>

<template>
  <main class="workspace">
    <header>伏羲原型 / SkyUI 严格实现样例</header>
    <section class="query-bar">
      <sky-input v-model="keyword" placeholder="输入项目名称" allow-clear />
      <sky-button type="primary" @click="query">查询</sky-button>
      <sky-button @click="reset">重置</sky-button>
    </section>
    <sky-table bordered size="small" :pagination="false" :data="[{ name: '黄金样例', status: '待验证' }]" :columns="[{ title: '项目', dataIndex: 'name' }, { title: '状态', dataIndex: 'status' }]" />
    <p class="notice">{{ notice }}</p>
  </main>
</template>

<style scoped>
.workspace { min-height: 360px; color: #171d2a; border: 1px solid #c9d0dc; font: 14px Arial, sans-serif; }
header { padding: 12px 16px; color: #fff; background: #2d5cf6; }
.query-bar { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid #dfe3ea; }
.notice { padding: 0 12px; color: #4f5d73; }
</style>
