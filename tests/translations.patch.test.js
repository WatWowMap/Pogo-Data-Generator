const zlib = require('node:zlib')

const Translations = require('../dist/classes/Translations').default
const base = require('../dist/base').default

const gzipJsonResponse = (payload) => {
  const gzipped = zlib.gzipSync(Buffer.from(JSON.stringify(payload)))
  return { ok: true, body: new Response(gzipped).body }
}

const remoteTextResponse = (pairs) => ({
  ok: true,
  text: async () =>
    Object.entries(pairs)
      .map(([key, value]) => `RESOURCE ID: ${key}\nTEXT: ${value}`)
      .join('\n'),
})

const makeTranslations = ({
  translationApkUrl,
  translationPatchUrl,
  translationRemoteUrl,
} = {}) => {
  const options = JSON.parse(JSON.stringify(base.translations.options))
  return new Translations(
    options,
    translationApkUrl,
    translationRemoteUrl,
    translationPatchUrl,
  )
}

describe('Translations patch overlay', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  test('merges patch data over existing APK translations, overriding changed keys and adding new ones', async () => {
    const translations = makeTranslations()
    translations.rawTranslations.hi = { foo: 'base foo', bar: 'base bar' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return gzipJsonResponse({
          data: ['bar', 'patched bar', 'baz', 'brand new baz'],
        })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.foo).toBe('base foo')
    expect(translations.rawTranslations.hi.bar).toBe('patched bar')
    expect(translations.rawTranslations.hi.baz).toBe('brand new baz')
    // the default APK endpoint must not be hit when APK data is already loaded
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('falls back to the built-in JSON endpoint when APK data for the locale is missing', async () => {
    const translations = makeTranslations()

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return gzipJsonResponse({ data: [] })
      }
      if (url.includes('Release/Hindi/hi-in_raw.json')) {
        return { ok: true, json: async () => ({ data: ['greeting', 'hello'] }) }
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.greeting).toBe('hello')
  })

  test('leaves base translations intact when the patch fetch fails', async () => {
    const translations = makeTranslations()
    translations.rawTranslations.hi = { foo: 'base foo', bar: 'base bar' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return { ok: false, status: 500, statusText: 'Server Error' }
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi).toEqual({
      foo: 'base foo',
      bar: 'base bar',
    })
  })

  test('always fetches an explicitly configured custom APK URL even when APK data is already present', async () => {
    const customUrl = 'https://example.com/custom-mirror/English/en-us_raw.json'
    const translations = makeTranslations({ translationApkUrl: customUrl })
    translations.rawTranslations.hi = { foo: 'base foo' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return gzipJsonResponse({ data: [] })
      }
      if (url === 'https://example.com/custom-mirror/Hindi/hi-in_raw.json') {
        return {
          ok: true,
          json: async () => ({ data: ['custom_key', 'custom value'] }),
        }
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.custom_key).toBe('custom value')
  })

  test('applies the patch on top of the default remote feed, which truncates multi line values', async () => {
    const translations = makeTranslations()
    translations.rawTranslations.de = { shared: 'base' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_de-de.json.gz')) {
        return gzipJsonResponse({ data: ['shared', 'full value'] })
      }
      if (url.includes('Remote/German/de-de_formatted.txt')) {
        return remoteTextResponse({ shared: 'truncated value' })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('de', [])

    expect(translations.rawTranslations.de.shared).toBe('full value')
  })

  test('keeps a caller configured remote feed authoritative over the patch', async () => {
    const translations = makeTranslations({
      translationRemoteUrl: 'https://example.com/custom/English/en-us_raw.txt',
    })
    translations.rawTranslations.de = { shared: 'base' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_de-de.json.gz')) {
        return gzipJsonResponse({
          data: ['shared', 'patch value', 'onlyInPatch', 'patch only'],
        })
      }
      if (url === 'https://example.com/custom/German/de-de_raw.txt') {
        return remoteTextResponse({ shared: 'custom value' })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('de', [])

    expect(translations.rawTranslations.de.shared).toBe('custom value')
    // keys the custom feed doesn't define still come from the patch
    expect(translations.rawTranslations.de.onlyInPatch).toBe('patch only')
  })

  test('localizes a custom patch URL that does not keep the Niantic basename', async () => {
    const translations = makeTranslations({
      translationPatchUrl: 'https://mirror.example/i18n/en-us.json.gz',
    })
    translations.rawTranslations.hi = { foo: 'base foo' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === 'https://mirror.example/i18n/hi-in.json.gz') {
        return gzipJsonResponse({ data: ['foo', 'hindi foo'] })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.foo).toBe('hindi foo')
  })

  test('localizes only the final path segment of a custom patch URL', async () => {
    const translations = makeTranslations({
      translationPatchUrl:
        'https://cdn.example.com/en-us/i18n/patch_i18n_en-us.json.gz',
    })
    translations.rawTranslations.hi = { foo: 'base foo' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (
        url === 'https://cdn.example.com/en-us/i18n/patch_i18n_hi-in.json.gz'
      ) {
        return gzipJsonResponse({ data: ['foo', 'hindi foo'] })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.foo).toBe('hindi foo')
  })

  test('localizes the path only, leaving the query and fragment untouched', async () => {
    const translations = makeTranslations({
      translationPatchUrl:
        'https://mirror.example/i18n/en-us.json.gz?redirect=/cache&v=en-us#en-us',
    })
    translations.rawTranslations.hi = { foo: 'base foo' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (
        url ===
        'https://mirror.example/i18n/hi-in.json.gz?redirect=/cache&v=en-us#en-us'
      ) {
        return gzipJsonResponse({ data: ['foo', 'hindi foo'] })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.foo).toBe('hindi foo')
  })

  test('fetches a custom remote feed for hi and id, where the built-in one is skipped', async () => {
    const translations = makeTranslations({
      translationRemoteUrl: 'https://example.com/custom/English/en-us_raw.txt',
    })
    translations.rawTranslations.hi = { shared: 'base' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return gzipJsonResponse({
          data: ['shared', 'patch value', 'onlyInPatch', 'patch only'],
        })
      }
      if (url === 'https://example.com/custom/Hindi/hi-in_raw.txt') {
        return remoteTextResponse({ shared: 'custom value' })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.shared).toBe('custom value')
    expect(translations.rawTranslations.hi.onlyInPatch).toBe('patch only')
  })

  test('still applies the patch and the remote feed when the APK fetch fails', async () => {
    const translations = makeTranslations({
      translationRemoteUrl: 'https://example.com/custom/English/en-us_raw.txt',
    })

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('Release/German/de-de_raw.json')) {
        return { ok: false, status: 500, statusText: 'Server Error' }
      }
      if (url.includes('patch_i18n_de-de.json.gz')) {
        return gzipJsonResponse({ data: ['fromPatch', 'patch value'] })
      }
      if (url === 'https://example.com/custom/German/de-de_raw.txt') {
        return remoteTextResponse({ fromRemote: 'remote value' })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('de', [])

    expect(translations.rawTranslations.de.fromPatch).toBe('patch value')
    expect(translations.rawTranslations.de.fromRemote).toBe('remote value')
  })

  test('skips the patch fetch entirely when the patch URL is empty', async () => {
    const translations = makeTranslations({ translationPatchUrl: '' })
    translations.rawTranslations.hi = { foo: 'base foo' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(global.fetch).not.toHaveBeenCalled()
    expect(translations.rawTranslations.hi).toEqual({ foo: 'base foo' })
  })
})

describe('Reference resolution', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch = jest.fn().mockImplementation(async (url) => {
      throw new Error(`Unexpected fetch: ${url}`)
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  const resolved = (raw) => {
    const translations = makeTranslations({ translationPatchUrl: '' })
    translations.rawTranslations.hi = raw
    translations.resolveReferences('hi')
    return translations.rawTranslations.hi
  }

  test('substitutes a reference marker with the value it points at', () => {
    expect(
      resolved({
        move_name_0311: 'फ़ेल स्टिंगर',
        move_name_0502: '<<move_name_0311>>+',
      }).move_name_0502,
    ).toBe('फ़ेल स्टिंगर+')
  })

  test('resolves a reference whose target is itself a reference', () => {
    expect(resolved({ a: 'base', b: '<<a>>+', c: '<<b>>+' }).c).toBe('base++')
  })

  test('leaves a marker alone when its target is missing', () => {
    expect(
      resolved({ move_name_0502: '<<move_name_0311>>+' }).move_name_0502,
    ).toBe('<<move_name_0311>>+')
  })

  test('does not loop forever on a cyclic reference', () => {
    const out = resolved({ a: '<<b>>', b: '<<a>>' })
    expect(out.a).toBe('<<b>>')
    expect(out.b).toBe('<<a>>')
  })

  test('ignores markup that is not a reference', () => {
    const out = resolved({
      truncated: 'ends with markup<<b>',
      anchor: 'see <a href=”x”>>site</a>',
    })
    expect(out.truncated).toBe('ends with markup<<b>')
    expect(out.anchor).toBe('see <a href=”x”>>site</a>')
  })

  test('runs as part of fetchTranslations, after every source is merged', async () => {
    const translations = makeTranslations()
    translations.rawTranslations.hi = { move_name_0311: 'base name' }

    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.includes('patch_i18n_hi-in.json.gz')) {
        return gzipJsonResponse({
          data: ['move_name_0502', '<<move_name_0311>>+'],
        })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })

    await translations.fetchTranslations('hi', [])

    expect(translations.rawTranslations.hi.move_name_0502).toBe('base name+')
  })
})
