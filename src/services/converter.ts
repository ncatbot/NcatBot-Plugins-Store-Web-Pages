import type { Plugin, Author, License } from '../types/plugin'
import { licenseLinks } from '../types/plugin'
import type { ApiResponse } from './api'

/**
 * 将API返回的插件数据转换为应用内的Plugin类型
 */
export function convertApiPluginsToAppPlugins(apiResponse: ApiResponse): Plugin[] {
  const result: Plugin[] = []

  for (const [id, apiPlugin] of Object.entries(apiResponse.plugins)) {
    // 处理作者信息
    let author: string | Author = 'Unknown'
    if (apiPlugin.author && typeof apiPlugin.author === 'string') {
      author = apiPlugin.author
    }

    // 如果有仓库地址，添加作者的GitHub链接
    if (apiPlugin.repository && typeof author === 'string' && author !== 'Unknown') {
      const githubUsername = extractGithubUsername(apiPlugin.repository)
      if (githubUsername) {
        author = {
          name: author,
          github: `https://github.com/${githubUsername}`,
        }
      }
    }

    // 处理许可证信息
    const license: License | null = null
    // 如果将来API提供了许可证信息，可以在这里处理

    // 创建Plugin对象
    const plugin: Plugin = {
      id: id.toLowerCase(), // 使用小写ID作为标识符
      nameEn: apiPlugin.name,
      // 如果没有中文名，则使用英文名
      nameZh: undefined,
      link: apiPlugin.repository || '',
      description: apiPlugin.description || '这个插件没有提供描述。',
      dependencies: Object.keys(apiPlugin.plugin_dependencies || {}),
      author,
      license,
      latestVersion: apiPlugin.latest_version,
      tags: apiPlugin.tags || [],
    }

    result.push(plugin)
  }

  return result
}

/**
 * 从GitHub仓库URL中提取用户名
 */
function extractGithubUsername(repoUrl: string): string | null {
  try {
    // 处理GitHub URL
    if (repoUrl.includes('github.com')) {
      const url = new URL(repoUrl)
      const pathSegments = url.pathname.split('/').filter(Boolean)
      if (pathSegments.length >= 1) {
        return pathSegments[0] // 返回用户名
      }
    }
    return null
  } catch {
    return null
  }
}
