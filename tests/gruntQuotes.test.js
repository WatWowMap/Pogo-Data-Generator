const Translations = require('../dist/classes/Translations').default

describe('grunt quote translations', () => {
  test('reuses balloon quotes for typed balloon grunt ids', () => {
    const translations = new Translations({ prefix: {} })
    translations.rawTranslations.en = {
      'combat_grunt_balloon_quote#1__female_speaker': 'Balloon quote 1',
      'combat_grunt_balloon_quote#2__female_speaker': 'Balloon quote 2',
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
  })
})
