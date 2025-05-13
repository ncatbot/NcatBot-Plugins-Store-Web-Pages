import { pluginsAPI } from '../data/plugins'

export interface ApiPluginConfig {
  name: string
  full_key: string
  default: null
  type: string
}

export interface ApiPluginFunction {
  name: string
  plugin_name: string
  description: string
  usage: string
  examples: string[]
  tags: string[]
  permission: string
  permission_raise: boolean
  reply: boolean
  metadata: Record<string, null>
}

export interface ApiPlugin {
  name: string
  versions: string[]
  latest_version: string
  description: string
  author: string
  plugin_dependencies: Record<string, string>
  tags: string[]
  homepage: string
  funcs: ApiPluginFunction[]
  configs: ApiPluginConfig[]
  repository: string
}

export interface ApiResponse {
  plugins: Record<string, ApiPlugin>
  last_update: string
}

export async function fetchPlugins(): Promise<ApiResponse> {
  try {
    // 对于生产环境中的GitHub raw URL，可能需要使用额外的参数
    const options: RequestInit = import.meta.env.PROD
      ? {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-cache' as RequestCache,
        }
      : {}

    const response = await fetch(pluginsAPI, options)
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取插件数据失败:', error)
    throw error
  }
}
