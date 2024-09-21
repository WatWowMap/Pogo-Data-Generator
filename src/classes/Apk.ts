import JSZip from 'jszip'

export default class ApkReader {
  texts: Record<string, Record<string, string>>
  codeMap: Record<string, string>
  files: JSZip | null

  constructor() {
    this.texts = {}
    this.codeMap = {
      'pt-br': 'pt-br',
      'zh-tw': 'zh-tw',
      'en-us': 'en',
      'fr-fr': 'fr',
      'de-de': 'de',
      'hi-in': 'hi',
      'id-id': 'id',
      'it-it': 'it',
      'ja-jp': 'ja',
      'ko-kr': 'ko',
      'ru-ru': 'ru',
      'es-es': 'es',
      'es-mx': 'es-mx',
      'th-th': 'th',
      'tr-tr': 'tr',
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
      const raw = await zip.loadAsync(apk)
      const file = raw.files['base.apk']
      const buffer = await file.async('nodebuffer')
      this.files = await zip.loadAsync(buffer)
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
            for (let i = 0; i < data.length; i++) {
              this.texts[code][data[i]] = this.removeEscapes(data[++i])
            }
          } catch (e) {
            if (e instanceof Error) {
              console.error('Unknown language code', e.message)
            }
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
