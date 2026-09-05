import { createApp } from 'vue';
import type { Plugin } from 'vue';
import SkyUI from '@sky/sky-ui';
import '@sky/sky-ui/icon/iconIFontSvg/iconfont.js';
import '@sky/sky-ui/icon/iconfont/iconfont.css';
import '@sky/sky-ui/dist/sky.min.css';
import App from './App.vue';
import './style.css';

createApp(App).use(SkyUI as Plugin).mount('#app');
