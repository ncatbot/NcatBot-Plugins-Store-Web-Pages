export interface Plugin {
  id: string
  nameEn: string
  nameZh?: string
  link: string
  description: string
  dependencies: string[]
  author: string | Author
  license: License | null
  latestVersion: string
  tags?: string[]
}

export interface Author {
  name: string
  github: string
}

export interface License {
  type: string
  link: string
}

export const licenseLinks = {
  MIT: 'https://opensource.org/licenses/MIT',
  GPL: 'https://www.gnu.org/licenses/gpl-3.0.html',
  'Apache-2.0': 'https://opensource.org/licenses/Apache-2.0',
  'BSD-3-Clause': 'https://opensource.org/licenses/BSD-3-Clause',
  LGPL: 'https://www.gnu.org/licenses/lgpl-3.0.html',
}
