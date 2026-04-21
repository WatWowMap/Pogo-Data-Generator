import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'

interface ApkTextCache {
  apkFilename: string
  texts: Record<string, Record<string, string>>
}

const isApkTextCache = (value: unknown): value is ApkTextCache => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as {
    apkFilename?: unknown
    texts?: unknown
  }
  return (
    typeof candidate.apkFilename === 'string' &&
    !!candidate.texts &&
    typeof candidate.texts === 'object'
  )
}

export default class ApkReader {
  texts: Record<string, Record<string, string>>
  codeMap: Record<string, string>
  files: JSZip | null
  cachePath: string
  apkFilename: string | null

  constructor(cachePath?: string) {
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
    this.cachePath = path.resolve(cachePath || '.cache/apk-texts.json')
    this.apkFilename = null
  }

  removeEscapes(str: string) {
    return str.replace(/\r/g, '').replace(/\n/g, '').replace(/"/g, '”')
  }

  async getLatestApkFilename() {
    try {
      const index = await fetch('https://mirror.unownhash.com/index.json')

      if (!index.ok) {
        throw new Error('Unable to fetch index')
      }
      const data = await index.json()
      return data[0].filename as string
    } catch (e) {
      console.warn(e, 'Issue with downloading APK index')
      return null
    }
  }

  async fetchApk(filename?: string) {
    try {
      const first = filename || (await this.getLatestApkFilename())

      if (!first) {
        throw new Error('Unable to determine latest APK filename')
      }
      this.apkFilename = first

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

  async loadCachedTexts(expectedFilename?: string) {
    try {
      const cached = await readFile(this.cachePath, 'utf8')
      const parsed: unknown = JSON.parse(cached)
      if (!isApkTextCache(parsed)) {
        return false
      }
      if (expectedFilename && parsed.apkFilename !== expectedFilename) {
        return false
      }
      this.apkFilename = parsed.apkFilename
      this.texts = parsed.texts
      return true
    } catch {
      return false
    }
  }

  async writeCachedTexts() {
    try {
      await mkdir(path.dirname(this.cachePath), { recursive: true })
      if (!this.apkFilename) {
        throw new Error('Missing APK filename for cache write')
      }
      const payload: ApkTextCache = {
        apkFilename: this.apkFilename,
        texts: this.texts,
      }
      await writeFile(this.cachePath, JSON.stringify(payload), 'utf8')
    } catch (e) {
      console.warn(e, 'Issue with writing APK text cache')
    }
  }

  async primeCache(force = false) {
    const latestFilename = await this.getLatestApkFilename()

    if (!latestFilename) {
      if (await this.loadCachedTexts()) {
        return this.texts
      }
      return this.texts
    }

    if (!force && (await this.loadCachedTexts(latestFilename))) {
      return this.texts
    }

    this.texts = {}
    await this.fetchApk(latestFilename)
    await this.extractTexts()
    this.cleanup()
    return this.texts
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
      await this.writeCachedTexts()
    } catch (e) {
      console.warn(e, 'Issue with extracting texts')
    }
  }

  cleanup() {
    if (this.files) delete this.files
  }
}
