const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const JSZip = require('jszip')

const ApkReader = require('../dist/classes/Apk').default
const { createNodeApkCache, primeApkCache } = require('../dist/node')

const makeBrokenOuterApk = async () => {
  const apk = new JSZip()
  apk.file('assets/placeholder.txt', 'broken')
  return apk.generateAsync({ type: 'nodebuffer' })
}

describe('APK cache refresh safety', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  test('does not keep the latest filename when the APK bundle is malformed', async () => {
    const brokenApk = await makeBrokenOuterApk()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => brokenApk,
    })

    const apk = new ApkReader()
    await apk.fetchApk('latest.apk')

    expect(apk.apkFilename).toBeNull()
    expect(apk.files).toBeNull()
  })

  test('does not overwrite the persisted cache after a failed refresh', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pogo-apk-cache-'))
    const apkCachePath = path.join(tempDir, 'apk-texts.json')
    const cachedTexts = { en: { greeting: 'hello' } }
    const brokenApk = await makeBrokenOuterApk()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const apkCache = createNodeApkCache({ apkCachePath })
    await apkCache.save('cached.apk', cachedTexts)

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === 'https://mirror.unownhash.com/index.json') {
        return {
          ok: true,
          json: async () => [{ filename: 'latest.apk' }],
        }
      }
      if (url === 'https://mirror.unownhash.com/apks/latest.apk') {
        return {
          ok: true,
          arrayBuffer: async () => brokenApk,
        }
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    const texts = await primeApkCache({ apkCachePath })

    expect(texts).toEqual({})
    expect(await apkCache.load()).toEqual(cachedTexts)
    expect(await apkCache.load('cached.apk')).toEqual(cachedTexts)
    expect(await apkCache.load('latest.apk')).toBeNull()
  })
})
