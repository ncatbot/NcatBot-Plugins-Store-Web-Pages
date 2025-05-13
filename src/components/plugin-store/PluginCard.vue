<template>  <div 
    class="plugin-card ripple" 
    :class="{ 'highlight': highlightText && hasMatch }"
    @mouseenter="animateCard" 
    @mouseleave="resetCard"
  >
    <div class="plugin-header">
      <h2 class="plugin-name">{{ plugin.nameEn }}</h2>
      <h3 class="plugin-name-zh" v-if="plugin.nameZh">{{ plugin.nameZh }}</h3>
      <a :href="plugin.link" target="_blank" class="plugin-link">
        <div class="github-icon-wrapper">
          <i-mdi-github />
        </div>
      </a>
    </div>    
    <div class="plugin-description">
      <div class="custom-collapse" @click="toggleDescription">
        <div class="custom-collapse-header" :class="{'is-active': isDescriptionOpen}">
          <div class="description-title">
            <i-mdi-text-box-outline class="icon"></i-mdi-text-box-outline>
            <span>简介</span>
          </div>
          <div class="collapse-indicator">
            <i-mdi-chevron-down class="collapse-icon" :class="{'is-active': isDescriptionOpen}"></i-mdi-chevron-down>
          </div>
        </div>
        <div class="custom-collapse-content" :class="{'is-active': isDescriptionOpen}">
          <div class="description-content">
            <p v-html="highlightedDescription"></p>
          </div>
        </div>
      </div>
    </div>
      <div class="card-content">
      <div class="plugin-dependencies">
        <h4><i-mdi-puzzle-outline class="icon"></i-mdi-puzzle-outline> 依赖项</h4>
        <ul>
            <template v-if="plugin.dependencies && plugin.dependencies.length > 0">
              <li v-for="dep in plugin.dependencies" 
                  :key="dep" 
                  :class="{ 'missing': !isPluginExist(dep) }">
                <el-tooltip v-if="!isPluginExist(dep)" content="插件状态异常" placement="top" effect="light" popper-class="custom-tooltip">
                  <a @click="handleMissingPlugin(dep)">{{ dep }}</a>
                </el-tooltip>
                <a v-else-if="dep === 'NcatBot'" href="https://github.com/liyihao1110/NcatBot" target="_blank">{{ dep }}</a>
                <a v-else href="#" @click.prevent="searchForPlugin(dep)">{{ dep }}</a>
              </li>
            </template>
            <li v-else class="no-dependency">
              <span>无依赖</span>
            </li>
        </ul>
      </div>
    </div>
    
    <div class="plugin-meta">
      <div class="plugin-author">
        <span><i-mdi-account class="icon"></i-mdi-account> 作者:</span>
        <a v-if="typeof plugin.author === 'object' && plugin.author.name !== 'Unknown'" 
           :href="plugin.author.github" 
           target="_blank" 
           v-html="highlightedAuthor"></a>
        <a v-else-if="typeof plugin.author === 'string' && plugin.author !== 'Unknown'"
           :href="`https://github.com/${plugin.author}`" 
           target="_blank" 
           v-html="highlightedAuthor"></a>
        <span v-else v-html="highlightedAuthor"></span>
      </div>
      
      <div class="plugin-license">
        <span><i-mdi-license class="icon"></i-mdi-license> 许可证:</span>
        <a v-if="plugin.license?.type" :href="plugin.license.link" target="_blank">{{ plugin.license.type }}</a>
        <span v-else>未指定</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Plugin } from '../../types/plugin';
import { plugins } from '../../data/plugins';

const props = defineProps<{
  plugin: Plugin;
  highlightText?: string;
}>();

// 控制描述折叠状态
const isDescriptionOpen = ref(false);

// 切换描述展开/折叠
function toggleDescription() {
  isDescriptionOpen.value = !isDescriptionOpen.value;
}

const emit = defineEmits(['search']);

const hasMatch = computed(() => {
  if (!props.highlightText) return false;
  
  const searchText = props.highlightText.toLowerCase();
  return (
    props.plugin.nameEn.toLowerCase().includes(searchText) ||
    (props.plugin.nameZh && props.plugin.nameZh.toLowerCase().includes(searchText)) ||
    props.plugin.description.toLowerCase().includes(searchText) ||
    (typeof props.plugin.author === 'string' && props.plugin.author.toLowerCase().includes(searchText)) ||
    (typeof props.plugin.author === 'object' && props.plugin.author.name && props.plugin.author.name.toLowerCase().includes(searchText))
    );
  });

  const highlightedDescription = computed(() => {
    if (!props.highlightText) return props.plugin.description.replace(/\n/g, '<br>');
    
    return props.plugin.description.replace(/\n/g, '<br>').replace(
    new RegExp(`(${props.highlightText})`, 'gi'),
    '<span class="highlight-text">$1</span>'
    );
  });

  const highlightedAuthor = computed(() => {
    if (!props.highlightText) {
    return typeof props.plugin.author === 'string' 
      ? props.plugin.author 
      : props.plugin.author.name || 'Unknown';
    }
    
    const authorName = typeof props.plugin.author === 'string' 
    ? props.plugin.author 
    : props.plugin.author.name || 'Unknown';
    
    return authorName.replace(
    new RegExp(`(${props.highlightText})`, 'gi'),
    '<span class="highlight-text">$1</span>'
    );
  });

// 检查插件是否存在
function isPluginExist(pluginName: string) {
  // 检查 NcatBot 是特殊情况，始终存在
  if (pluginName === 'NcatBot') return true;
  
  return plugins.value.some(p => 
    p.nameEn === pluginName || 
    (p.id && p.id.toLowerCase() === pluginName.toLowerCase())
  );
}

// 处理缺失的插件
function handleMissingPlugin(name: string) {
  // 可以弹出提示或执行其他操作
  alert(`插件 ${name} 状态异常，无法访问`);
}

// 搜索插件
function searchForPlugin(name: string) {
  emit('search', name);
}

// 添加悬停动画
function animateCard(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement;
  card.style.transform = 'translateY(-5px)';
  card.style.boxShadow = '0 15px 30px rgba(255, 105, 180, 0.3)';
}

// 重置卡片动画
function resetCard(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement;
  card.style.transform = '';
  card.style.boxShadow = '';
}
</script>

<style scoped>
.plugin-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.plugin-card:hover {
  box-shadow: 0 10px 25px rgba(255, 105, 180, 0.15);
  transform: translateY(-5px);
}

.plugin-card.ripple:after {
  background-image: radial-gradient(circle, rgba(255, 105, 180, 0.2) 10%, transparent 10.01%);
}

.plugin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, #ff69b4, #ffb6c1);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.plugin-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transition: left 0.8s ease-out;
}

.plugin-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(255, 105, 180, 0.2);
  border-color: rgba(255, 105, 180, 0.4);
}

.plugin-card:hover::before {
  opacity: 1;
}

.plugin-card:hover::after {
  left: 100%;
}

.plugin-card.highlight {
  border: 2px solid #ff69b4;
  background-color: rgba(255, 192, 203, 0.05);
  transform: translateY(-3px);
}

.plugin-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  position: relative;
}

.plugin-name {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(45deg, #ff69b4, #ff1493);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 10px;
  position: relative;
}

.plugin-name::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(to right, #ff69b4, transparent);
  transition: width 0.3s ease;
}

.plugin-card:hover .plugin-name::after {
  width: 70%;
}

.plugin-name-zh {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
  color: #888;
  margin-right: auto;
  margin-top: 5px;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.plugin-card:hover .plugin-name-zh {
  opacity: 1;
}

.plugin-link {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff69b4;
  font-size: 1.2rem;
  transition: all 0.3s;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
}

.plugin-link:hover {
  transform: scale(1.1) rotate(5deg);
  background-color: rgba(255, 192, 203, 0.2);
  color: #ff1493;
  box-shadow: 0 3px 6px rgba(255, 105, 180, 0.15);
}

.github-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.plugin-description {
  margin-bottom: 1rem;
  color: #555;
  line-height: 1.6;
}

.card-content {
  flex: 1;
}

/* 自定义折叠面板样式 */
.custom-collapse {
  width: 100%;
  cursor: pointer;
}

.custom-collapse-header {
  background-color: rgba(255, 192, 203, 0.08);
  border: 1px solid rgba(255, 192, 203, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-collapse-header:hover {
  background-color: rgba(255, 192, 203, 0.15);
  border-color: rgba(255, 192, 203, 0.4);
  box-shadow: 0 2px 6px rgba(255, 105, 180, 0.1);
}

.collapse-indicator {
  display: flex;
  align-items: center;
}

.collapse-icon {
  color: #ff69b4;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.collapse-icon.is-active {
  transform: rotate(180deg);
}

.custom-collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0;
  opacity: 0;
}

.custom-collapse-content.is-active {
  max-height: 500px; /* 足够大以适应内容 */
  padding: 1rem 0.5rem;
  opacity: 1;
  transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in, padding 0.3s ease;
}

.description-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff69b4;
  font-weight: 500;
  font-size: 0.9rem;
}

.description-content {
  padding: 0.5rem;
  line-height: 1.6;
  color: #555;
}

.icon {
  font-size: 1.1em;
  color: #ff69b4;
  vertical-align: middle;
  margin-right: 4px;
}

.plugin-dependencies {
  margin-bottom: 1rem;
}

.plugin-dependencies h4 {
  font-size: 0.9rem;
  color: #ff69b4;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.plugin-dependencies ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.plugin-dependencies li {
  background-color: rgba(255, 192, 203, 0.1);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.85rem;
  transition: all 0.3s;
  border: 1px solid rgba(255, 192, 203, 0.2);
  position: relative;
  overflow: hidden;
}

.plugin-dependencies li::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 192, 203, 0.2);
  transition: left 0.3s ease;
  z-index: 0;
}

.plugin-dependencies li:hover {
  background-color: rgba(255, 192, 203, 0.1);
  border-color: rgba(255, 192, 203, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(255, 105, 180, 0.1);
}

.plugin-dependencies li:hover::after {
  left: 0;
}

.plugin-dependencies li.missing {
  background-color: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.plugin-dependencies li.missing:hover {
  background-color: rgba(255, 0, 0, 0.08);
  border-color: rgba(255, 0, 0, 0.3);
}

.plugin-dependencies li.no-dependency {
  background-color: rgba(154, 205, 50, 0.1);
  border: 1px solid rgba(154, 205, 50, 0.3);
  color: #6b8e23;
}

.plugin-dependencies li.no-dependency:hover {
  background-color: rgba(154, 205, 50, 0.15);
  border-color: rgba(154, 205, 50, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(154, 205, 50, 0.1);
}

.plugin-dependencies li.no-dependency span {
  color: #6b8e23;
  position: relative;
  z-index: 1;
}

.plugin-dependencies a {
  color: #ff69b4;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  z-index: 1;
  padding: 2px 0;
}

.plugin-dependencies li.missing a {
  color: #ff4040;
}

.plugin-dependencies a:hover {
  color: #ff1493;
  text-shadow: 0 0 1px rgba(255, 20, 147, 0.3);
}

.plugin-meta {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
  font-size: 0.85rem;
  color: #888;
  border-top: 1px dashed rgba(255, 192, 203, 0.3);
}

.plugin-author,
.plugin-license {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plugin-author a,
.plugin-license a {
  color: #ff69b4;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.plugin-author a::after,
.plugin-license a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: #ff1493;
  transition: width 0.3s ease;
}

.plugin-author a:hover::after,
.plugin-license a:hover::after {
  width: 100%;
}

:deep(.highlight-text) {
  background-color: rgba(255, 105, 180, 0.2);
  padding: 0 2px;
  border-radius: 4px;
  font-weight: 500;
  color: #ff1493;
}

@media (max-width: 768px) {
  .plugin-card {
    padding: 1rem;
  }
  
  .plugin-header {
    flex-direction: column;
  }
  
  .plugin-name-zh {
    margin-top: 2px;
    margin-bottom: 8px;
  }
  
  .plugin-link {
    align-self: flex-start;
  }
  
  .plugin-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
