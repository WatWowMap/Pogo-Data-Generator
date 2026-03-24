const Translations = require('../dist/classes/Translations').default
const Masterfile = require('../dist/classes/Masterfile').default
const base = require('../dist/base').default

const createOptions = (overrides = {}) => {
  const options = JSON.parse(JSON.stringify(base.translations.options))
  return {
    ...options,
    ...overrides,
    prefix: {
      ...options.prefix,
      ...(overrides.prefix || {}),
    },
  }
}

describe('grunt quote translations', () => {
  test('maps current grunt quote keys to all matching invasion ids', () => {
    const translations = new Translations(createOptions())
    translations.rawTranslations.en = {
      'combat_grunt_balloon_quote#2__female_speaker': 'Balloon quote 2',
      'combat_grunt_balloon_quote#1__female_speaker': 'Balloon quote 1',
      'combat_grunt_quote_steel__female_speaker': 'Steel quote',
      grunt_bf_combat_quote: 'GRUNTB female quote',
      grunt_bm_combat_quote: 'GRUNTB male quote',
    }
    translations.parsedTranslations.en = {}

    translations.gruntQuotes('en')

    const balloonGruntIds = [
      51, 52, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64,
      65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
      77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
      89, 90,
    ]

    balloonGruntIds.forEach((id) => {
      expect(translations.parsedTranslations.en.gruntQuotes[`grunt_quote_${id}`])
        .toBe('Balloon quote 1')
      expect(
        translations.parsedTranslations.en.gruntQuotes[`grunt_quote_${id}_2`],
      ).toBe('Balloon quote 2')
    })

    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_28)
      .toBe('Steel quote')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_29)
      .toBe('Steel quote')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_53)
      .toBe('GRUNTB female quote')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_54)
      .toBe('GRUNTB male quote')
  })

  test('inherits the invasion balloon toggle into translation options', () => {
    const merged = Masterfile.templateMerger({
      invasions: {
        options: {
          includeBalloons: false,
        },
      },
    }, base)

    expect(merged.translations.options.includeBalloons).toBe(false)
  })

  test('skips balloon grunt quote ids when balloons are disabled', () => {
    const translations = new Translations(
      createOptions({ includeBalloons: false }),
    )
    translations.rawTranslations.en = {
      'combat_grunt_balloon_quote#1__female_speaker': 'Balloon quote 1',
    }
    translations.parsedTranslations.en = {}

    translations.gruntQuotes('en')

    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_51)
      .toBeUndefined()
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_90)
      .toBeUndefined()
  })

  test('preserves duplicate grunt quote refs under useLanguageAsRef', () => {
    const translations = new Translations(
      createOptions({ useLanguageAsRef: 'en' }),
    )
    translations.rawTranslations.en = {
      'combat_grunt_quote_steel__female_speaker': 'Steel quote',
    }
    translations.rawTranslations.fr = {
      'combat_grunt_quote_steel__female_speaker': 'Citation acier',
    }
    translations.parsedTranslations.en = {}
    translations.parsedTranslations.fr = {}

    translations.gruntQuotes('en')
    translations.gruntQuotes('fr')
    translations.languageRef('en')
    translations.languageRef('fr')

    expect(translations.parsedTranslations.fr.gruntQuotes['Steel quote'])
      .toBe('Citation acier')
    expect(
      translations.parsedTranslations.fr.gruntQuotes[
        'Steel quote [grunt_quote_29]'
      ],
    ).toBe('Citation acier')
  })

  test('orders numbered grunt quotes by their explicit suffix', () => {
    const translations = new Translations(createOptions())
    translations.rawTranslations.en = {
      'combat_cliff_quote#2': 'Cliff quote 2',
      'combat_cliff_quote#1': 'Cliff quote 1',
      'combat_arlo_quote#1': 'Arlo quote 1',
      'combat_sierra_quote#1': 'Sierra quote 1',
      'combat_giovanni_quote#1': 'Giovanni quote 1',
    }
    translations.parsedTranslations.en = {}

    translations.gruntQuotes('en')

    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_41)
      .toBe('Cliff quote 1')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_41_2)
      .toBe('Cliff quote 2')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_527)
      .toBe('Cliff quote 1')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_527_2)
      .toBe('Cliff quote 2')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_526)
      .toBe('Arlo quote 1')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_525)
      .toBe('Sierra quote 1')
    expect(translations.parsedTranslations.en.gruntQuotes.grunt_quote_524)
      .toBe('Giovanni quote 1')
  })
})
