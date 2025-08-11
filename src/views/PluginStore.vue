<template>
  <div class="store-container with-sidebar">
    <aside class="sidebar">
      <div class="sidebar-title"><i-mdi-tag-multiple class="icon" /> 标签筛选</div>
      <div class="tag-list">
        <div
          v-for="tag in allTags"
          :key="tag.name"
          class="tag-filter-item"
          :class="{ selected: selectedTags.includes(tag.name) }"
          @click="toggleTag(tag.name)"
        >
          <i-mdi-tag class="icon" />
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">({{ tag.count }})</span>
        </div>
        <div
          class="tag-filter-item unclassified"
          :class="{ selected: selectedTags.includes('__unclassified__') }"
          @click="toggleTag('__unclassified__')"
        >
          <i-mdi-tag-off class="icon" />
          <span class="tag-name">未分类</span>
          <span class="tag-count">({{ unclassifiedCount }})</span>
        </div>
      </div>
    </aside>
    <main class="main-content">
      <header class="store-header">
        <div class="store-title">
          <h1>NcatBot 插件商店</h1>
          <div v-if="lastUpdate" class="last-update">最后更新: {{ formatDate(lastUpdate) }}</div>
        </div>
        <div class="social-links">
          <a v-for="link in socialLinks" :key="link.link" :href="link.link" target="_blank" class="social-link">
            <el-tooltip :content="link.text" placement="bottom" effect="light" popper-class="custom-tooltip">
              <div class="link-content">
                <i-mdi-github v-if="link.icon === 'github'" />
                <i-mdi-web v-else-if="link.icon === 'web'" />
                <i-mdi-help-circle v-else-if="link.icon === 'help-circle'" />
                <i-mdi-discord v-else-if="link.icon === 'discord'" />
                <i-mdi-qqchat v-else-if="link.icon === 'qqchat'" />
              </div>
            </el-tooltip>
          </a>
        </div>
      </header>
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载插件中...</div>
      </div>

      <div v-else>
        <div class="search-container">
          <div class="search-wrapper">
            <div class="custom-search-input">
              <div class="search-icon-wrapper">
                <i-mdi-magnify class="search-icon" />
              </div>
              <input
                type="text"
                v-model="searchText"
                placeholder="搜索插件..."
                class="search-field"
              />
              <div v-if="searchText" class="clear-icon-wrapper" @click="clearSearch">
                <i-mdi-close class="clear-icon" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredPlugins.length === 0" class="no-results">
          没有找到匹配的插件 😢
        </div>
        <div class="plugin-list">
          <plugin-card
            v-for="(plugin, index) in paginatedPlugins"
            :key="plugin.id"
            :plugin="plugin"
            :highlight-text="searchText"
            @search="searchForPlugin"
            @plugin-title-click="goToPluginDetail"
            :style="{
              animationDelay: `${index * 0.1 + 0.1}s`,
              animationName: 'fadeInUp',
              animationDuration: '0.6s',
              animationFillMode: 'both',
              animationTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            }"
          />
        </div>

        <div v-if="filteredPlugins.length > pageSize" class="custom-pagination">
          <div class="pagination-container">
            <div
              class="pagination-arrow prev"
              :class="{ 'disabled': currentPage === 1 }"
              @click="currentPage > 1 && handlePageChange(currentPage - 1)"
            >
              <i-mdi-chevron-left />
            </div>

            <div class="pagination-pages">
              <div
                v-for="page in displayedPages"
                :key="page"
                class="page-number"
                :class="{ 'active': currentPage === page }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </div>
            </div>

            <div
              class="pagination-arrow next"
              :class="{ 'disabled': currentPage === totalPages }"
              @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
            >
              <i-mdi-chevron-right />
            </div>
          </div>

          <div class="pagination-info">
            <span>{{ currentPage }} / {{ totalPages }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PluginCard from '../components/plugin-store/PluginCard.vue';
import { plugins, socialLinks, loadPluginsFromAPI, lastUpdate } from '../data/plugins';
import type { Plugin } from '../types/plugin';
import { useRouter } from 'vue-router';
const router = useRouter();

// 搜索
const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(4); // 初始每页显示的数量，后面会动态调整
const windowWidth = ref(window.innerWidth);

// API加载状态
const isLoading = ref(true);

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth;
  adjustPageSize();
}

// 计算每页显示的数量
function adjustPageSize() {
  // 根据屏幕宽度计算每列能显示的数量
  let columns = 1;
  if (windowWidth.value >= 1600) {
    columns = 4;
  } else if (windowWidth.value >= 1200) {
    columns = 3;
  } else if (windowWidth.value >= 768) {
    columns = 2;
  } else {
    columns = 1;
  }

  // 设置为两行的总数量
  pageSize.value = columns * 3;

  // 如果当前页因为pageSize变化而超出范围，则重置为最后一页
  const maxPage = Math.ceil(filteredPlugins.value.length / pageSize.value);
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage;
  }
}

// 在组件挂载和卸载时添加/移除窗口大小变化的监听器
onMounted(async () => {
  window.addEventListener('resize', handleResize);

  // 从API加载插件
  try {
    isLoading.value = true;
    await loadPluginsFromAPI();
  } catch {
    console.error('加载插件失败');
  } finally {
    isLoading.value = false;
  }

  adjustPageSize(); // 初始调整
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 清除搜索
const clearSearch = () => {
  searchText.value = '';
};
const searchForPlugin = (name: string) => {
  searchText.value = name;
  currentPage.value = 1; // 重置分页
};

// tag 相关
const selectedTags = ref<string[]>([]);

const allTags = computed(() => {
  const tagMap: Record<string, number> = {};
  plugins.value.forEach((p) => {
    if (Array.isArray(p.tags) && p.tags.length > 0) {
      p.tags.forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    }
  });
  return Object.entries(tagMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});

const unclassifiedCount = computed(() =>
  plugins.value.filter((p) => !p.tags || p.tags.length === 0).length
);

function toggleTag(tag: string) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
  currentPage.value = 1;
}

// 过滤插件（支持tag和搜索）
const filteredPlugins = computed(() => {
  let filtered = plugins.value;
  // tag过滤
  if (selectedTags.value.length > 0) {
    if (selectedTags.value.includes('__unclassified__')) {
      // 只显示未分类
      filtered = filtered.filter((p) => !p.tags || p.tags.length === 0);
    } else {
      // 只显示包含所选tag之一的插件
      filtered = filtered.filter(
        (p) => Array.isArray(p.tags) && p.tags.some((t) => selectedTags.value.includes(t))
      );
    }
  }
  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    filtered = filtered.filter((plugin: Plugin) => {
      return (
        plugin.nameEn.toLowerCase().includes(searchLower) ||
        (plugin.nameZh && plugin.nameZh.toLowerCase().includes(searchLower)) ||
        plugin.description.toLowerCase().includes(searchLower) ||
        (typeof plugin.author === 'string'
          ? plugin.author.toLowerCase().includes(searchLower)
          : plugin.author.name.toLowerCase().includes(searchLower))
      );
    });
  }
  return filtered;
});

// 分页处理
const paginatedPlugins = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredPlugins.value.slice(startIndex, startIndex + pageSize.value);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredPlugins.value.length / pageSize.value);
});

// 计算要显示的页码
const displayedPages = computed(() => {
  const pages = [];
  const maxDisplayPages = 5; // 最多显示5个页码

  // 总页数小于等于最大显示页数，显示所有页码
  if (totalPages.value <= maxDisplayPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  }
  // 总页数大于最大显示页数
  else {
    // 当前页接近开始
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    }
    // 当前页接近结尾
    else if (currentPage.value >= totalPages.value - 2) {
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
        pages.push(i);
      }
    }
    // 当前页在中间
    else {
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
        pages.push(i);
      }
    }
  }

  return pages;
});

// 页面改变事件
const handlePageChange = (page: number) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function goToPluginDetail(id: string) {
  router.push(`/plugin/${id}`);
}
</script>

<style scoped>
.store-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: radial-gradient(circle at top right, rgba(255, 105, 180, 0.05) 0%, rgba(255, 192, 203, 0.02) 50%, transparent 70%);
  position: relative;
}

.store-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #ff69b4, #ffb6c1, #ff69b4);
  z-index: 100;
}

.store-container.with-sidebar {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.sidebar {
  width: 220px;
  min-width: 180px;
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.08);
  margin-right: 2rem;
  padding: 1.2rem 1rem 1.5rem 1rem;
  position: sticky;
  top: 30px;
  height: fit-content;
  z-index: 10;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ff69b4;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.98rem;
  color: #ff69b4;
  background: rgba(255, 192, 203, 0.08);
  border: 1px solid rgba(255, 192, 203, 0.15);
  transition: all 0.2s;
  user-select: none;
}

.tag-filter-item.selected {
  background: linear-gradient(90deg, #ffb6c1 0%, #fff 100%);
  color: #fff;
  border: 1.5px solid #ff69b4;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.08);
}

.tag-filter-item.unclassified {
  color: #888;
  background: rgba(200,200,200,0.08);
  border: 1px dashed #ccc;
}

.tag-filter-item.unclassified.selected {
  background: linear-gradient(90deg, #eee 0%, #fff 100%);
  color: #ff69b4;
  border: 1.5px solid #ff69b4;
}

.tag-name {
  flex: 1;
  text-align: left;
}

.tag-count {
  font-size: 0.92em;
  color: #aaa;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 192, 203, 0.3);
  border-top: 4px solid #ff69b4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #ff69b4;
  font-size: 1.2rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.last-update {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.2rem;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.1);
  position: sticky;
  top: 10px;
  z-index: 100;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 192, 203, 0.2);
}

.store-header:hover {
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.15);
  border-color: rgba(255, 192, 203, 0.4);
}

.store-title h1 {
  font-size: 1.8rem;
  margin: 0;
  background: linear-gradient(45deg, #ff69b4, #ff1493);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  position: relative;
  padding-bottom: 5px;
  letter-spacing: -0.5px;
}

.store-title h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #ff69b4, rgba(255, 105, 180, 0.2));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.store-title:hover h1::after {
  width: 70px;
}

.social-links {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.social-link {
  color: #999;
  font-size: 1.5rem;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  position: relative;
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 50%;
  background-color: rgba(255, 192, 203, 0.1);
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 105, 180, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
}

.link-content {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.social-link:hover {
  color: #ff69b4;
  transform: translateY(-3px) scale(1.05);
  background-color: rgba(255, 192, 203, 0.2);
  box-shadow: 0 4px 8px rgba(255, 105, 180, 0.2);
  border-color: rgba(255, 192, 203, 0.4);
}

.search-container {
  margin-bottom: 2rem;
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.search-wrapper {  width: 100%;
  max-width: 600px;
  position: relative;
  animation: fadeInUp 0.7s ease-out both;
}

.custom-search-input {
  width: 100%;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 192, 203, 0.4);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.1);
  position: relative;
  overflow: hidden;
}

.custom-search-input::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 105, 180, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-search-input:focus-within {
  border-color: rgba(255, 105, 180, 0.6);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.15);
  background: #fff;
}

.custom-search-input:focus-within::before {
  opacity: 1;
}

.search-icon-wrapper {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 192, 203, 0.1);
  margin-left: 4px;
  transition: all 0.3s ease;
}

.search-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  padding: 0 15px;
  color: #333;
}

.search-field::placeholder {
  color: #aaa;
  font-weight: 300;
}

.clear-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.25s ease;
  margin-right: 6px;
}

.clear-icon-wrapper:hover {
  background: rgba(255, 192, 203, 0.2);
}

.search-icon {
  color: #ff69b4;
  font-size: 1.3rem;
}

.clear-icon {
  color: #999;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.clear-icon-wrapper:hover .clear-icon {
  color: #ff69b4;
  transform: rotate(90deg);
}

.clear-button:hover {
  color: #ff69b4;
  background: rgba(255, 192, 203, 0.1);
}

.plugin-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* 自定义分页样式 */
.custom-pagination {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  animation: fadeInUp 0.7s ease-out both;
}

.pagination-container {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 30px;
  padding: 0.4rem;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.3);
  transition: all 0.3s ease;
}

.pagination-container:hover {
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.15);
  border-color: rgba(255, 192, 203, 0.5);
}

.pagination-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #ff69b4;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
}

.pagination-arrow:hover:not(.disabled) {
  background-color: rgba(255, 192, 203, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 105, 180, 0.15);
  border-color: rgba(255, 192, 203, 0.4);
}

.pagination-arrow.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #999;
}

.pagination-pages {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0.8rem;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #777;
  font-size: 0.9rem;
}

.page-number:hover:not(.active) {
  background-color: rgba(255, 192, 203, 0.1);
  color: #ff69b4;
  transform: translateY(-2px);
}

.page-number.active {
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  color: white;
  box-shadow: 0 3px 10px rgba(255, 105, 180, 0.3);
  transform: scale(1.05);
  font-weight: 600;
}

.pagination-info {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.2rem;
}

.no-results {
  text-align: center;
  font-size: 1.2rem;
  color: #777;
  padding: 3rem 0;
}

@media (min-width: 768px) {
  .plugin-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .store-header {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 12px;
  }

  .social-links {
    width: 100%;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  .link-text {
    display: none;
  }

  .store-container {
    padding: 0.8rem;
  }

  .store-title h1 {
    font-size: 1.5rem;
    text-align: center;
  }

  .store-title h1::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .search-wrapper {
    max-width: 100%;
  }
    .pagination-pages {
    gap: 0.2rem;
  }

  .page-number {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  .pagination-arrow {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 768px) {
  .store-container.with-sidebar {
    flex-direction: column;
    display: block;
  }

  .sidebar {
    display: none;
  }
}

@media (min-width: 1200px) {
  .plugin-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1600px) {
  .plugin-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

.plugin-title {
  cursor: pointer;
  color: #ff69b4;
}
</style>
