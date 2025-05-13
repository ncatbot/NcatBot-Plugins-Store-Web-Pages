<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <el-config-provider namespace="ep">
    <router-view />
  </el-config-provider>
</template>

<style>
:root {
  --primary-color: #ff69b4;
  --primary-color-dark: #ff1493;
  --primary-color-light: #ffb6c1;
  --text-color: #333;
  --text-color-light: #666;
  --background-color: #f9f9f9;
}

html {
  scroll-behavior: smooth;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}
</style>
