import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ApkReader from './classes/Apk'
import type {
  ApkCacheAdapter,
  ApkTexts,
  NodeApkCacheInput,
  PrimeApkCacheInput,
} from './typings/inputs'

interface ApkTextCacheFile {
  apkFilename: string
  texts: ApkTexts
}

const isApkTextCacheFile = (value: unknown): value is ApkTextCacheFile => {
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

const defaultNodeApkCachePath = () => {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', 'pogo-data-generator')
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
      'pogo-data-generator',
    )
  }
  return path.join(
    process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'),
    'pogo-data-generator',
  )
}

export function createNodeApkCache({
  apkCachePath,
}: NodeApkCacheInput = {}): ApkCacheAdapter {
  const resolvedPath = path.resolve(
    apkCachePath || path.join(defaultNodeApkCachePath(), 'apk-texts.json'),
  )

  return {
    async load(expectedFilename?: string) {
      try {
        const cached = await readFile(resolvedPath, 'utf8')
        const parsed: unknown = JSON.parse(cached)
        if (!isApkTextCacheFile(parsed)) {
          return null
        }
        if (expectedFilename && parsed.apkFilename !== expectedFilename) {
          return null
        }
        return parsed.texts
      } catch {
        return null
      }
    },
    async save(apkFilename: string, texts: ApkTexts) {
      try {
        await mkdir(path.dirname(resolvedPath), { recursive: true })
        const payload: ApkTextCacheFile = {
          apkFilename,
          texts,
        }
        await writeFile(resolvedPath, JSON.stringify(payload), 'utf8')
      } catch (e) {
        console.warn(e, 'Issue with writing APK text cache')
      }
    },
  }
}

export async function primeApkCache({
  force,
  apkCachePath,
}: PrimeApkCacheInput = {}) {
  const apk = new ApkReader()
  const apkCache = createNodeApkCache({ apkCachePath })
  const latestFilename = await apk.getLatestApkFilename()

  if (!latestFilename) {
    return (await apkCache.load()) || {}
  }

  if (!force) {
    const cached = await apkCache.load(latestFilename)
    if (cached) {
      return cached
    }
  }

  await apk.fetchApk(latestFilename)
  await apk.extractTexts()
  apk.cleanup()
  if (apk.apkFilename) {
    await apkCache.save(apk.apkFilename, apk.texts)
  }
  return apk.texts
}
