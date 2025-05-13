import type { Plugin } from '../types/plugin'
import { licenseLinks } from '../types/plugin'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { fetchPlugins } from '../services/api'
import { convertApiPluginsToAppPlugins } from '../services/converter'

const NCATBOT_GITHUB = 'https://github.com/liyihao1110/NcatBot'
const NCATBOT_DOCS = 'https://docs.ncatbot.xyz'
const NCATBOT_QQ =
  'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=Vu7KB9gEv9TftvJLYcl846CTqsLUc6Ey&authKey=8JBJhlZro%2B1%2FakeBZ3yJMVeHzlsFYTMHU0RJK%2FpMBmkpZSH7w2CbXU6M2X66PTCQ&noverify=0&group_code=201487478'

// 本地硬编码的插件列表
export const localPlugins: Plugin[] = []

// 存储从API获取的插件列表
export const apiPlugins: Ref<Plugin[]> = ref([])

// 合并本地和API插件
export const plugins: Ref<Plugin[]> = ref([...localPlugins])

// 最后更新时间
export const lastUpdate: Ref<string> = ref('')

// 从API获取插件
export async function loadPluginsFromAPI(): Promise<void> {
  try {
    const apiResponse = await fetchPlugins()
    const convertedPlugins = convertApiPluginsToAppPlugins(apiResponse)

    // 更新API插件列表
    apiPlugins.value = convertedPlugins

    // 更新合并后的插件列表
    // 注：暂时保留本地插件，以后可以移除
    plugins.value = [...localPlugins, ...convertedPlugins]

    // 更新最后更新时间
    lastUpdate.value = apiResponse.last_update

    console.log(`已从API加载 ${convertedPlugins.length} 个插件`)
  } catch (error) {
    console.error('加载插件失败:', error)
    // 加载失败时，使用本地插件
    plugins.value = [...localPlugins]
  }
}

export const socialLinks = [
  { icon: 'github', text: 'GitHub', link: NCATBOT_GITHUB },
  { icon: 'help-circle', text: '文档', link: NCATBOT_DOCS },
  { icon: 'qqchat', text: 'QQ群', link: NCATBOT_QQ },
]

export const pluginsAPI = import.meta.env.PROD
  ? 'https://raw.githubusercontent.com/ncatbot/NcatBot-Plugins/main/index.json'
  : '/api'
