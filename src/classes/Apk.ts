import JSZip from 'jszip'

export default class ApkReader {
  texts: Record<string, Record<string, string>>
  codeMap: Record<string, string>
  files: JSZip | null

  constructor() {
    this.texts = {}
    this.codeMap = {
      brazilianportuguese: 'pt-br',
      chinesetraditional: 'zh-tw',
      english: 'en',
      french: 'fr',
      german: 'de',
      hindi: 'hi',
      indonesian: 'id',
      italian: 'it',
      japanese: 'ja',
      korean: 'ko',
      russian: 'ru',
      spanish: 'es',
      thai: 'th',
      turkish: 'tr',
    }
    this.files = null
  }

  removeEscapes(str: string) {
    return str.replace(/\r/g, '').replace(/\n/g, '').replace(/\"/g, '”')
  }

  async fetchApk() {
    try {
      const index = await fetch('https://mirror.unownhash.com/index.json')

      if (!index.ok) {
        throw new Error('Unable to fetch index')
      }
      const data = await index.json()
      const first = data[0].filename

      const response = await fetch(`https://mirror.unownhash.com/apks/${first}`)
      const apk = await response.arrayBuffer()
      const zip = new JSZip()
      this.files = await zip.loadAsync(apk)
    } catch (e) {
      console.warn(e, 'Issue with downloading APK')
    }
  }

  async extractTexts() {
    if (!this.files) return
    try {
      const textFiles = Object.keys(this.files.files).filter((file) =>
        file.startsWith('assets/text'),
      )
      await Promise.all(
        textFiles.map(async (file) => {
          try {
            const text = await this.files.file(file)?.async('text')
            const { data } = JSON.parse(text)
            const relativePath = file
              .replace('assets/text/', '')
              .replace('.json', '')
              .replace('i18n_', '')
            const code = this.codeMap[relativePath]

            if (!code) {
              throw new Error(relativePath)
            }

            this.texts[code] = {}
            for (let i = 0; i < data.length; i += 2) {
              this.texts[code][data[i]] = this.removeEscapes(data[i + 1])
            }
          } catch (e) {
            console.error('Unknown language code', e)
          }
        }),
      )
    } catch (e) {
      console.warn(e, 'Issue with extracting texts')
    }
  }

  cleanup() {
    if (this.files) delete this.files
  }
}
