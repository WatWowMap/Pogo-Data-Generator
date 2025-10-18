const Translations = require('../dist/classes/Translations').default
const base = require('../dist/base').default

describe('Translations misc backgrounds', () => {
  test('adds location and special background labels for multiple locales', () => {
    const options = JSON.parse(JSON.stringify(base.translations.options))
    const translations = new Translations(options)

    const locales = {
      en: {
        location: 'Location Background',
        special: 'Special Background',
      },
      de: {
        location: 'Ortshintergrund',
        special: 'Spezialhintergrund',
      },
      fr: {
        location: 'Fond de lieu',
        special: 'Fond spécial',
      },
    }

    Object.entries(locales).forEach(([locale, values]) => {
      translations.rawTranslations[locale] = {
        gender_male: 'male',
        gender_female: 'female',
        filter_key_alola: 'alola',
        filter_key_shadow: 'shadow',
        filter_key_purified: 'purified',
        filter_key_legendary: 'legendary',
        filter_key_mythical: 'mythical',
        filter_label_location_card: values.location,
        special_background_filter_header: values.special,
        team_name_team0: 'Team Instinct',
        team_name_team1: 'Team Mystic',
        team_name_team2: 'Team Valor',
        team_name_team3: 'Team Rocket',
      }
      translations.parsedTranslations[locale] = {}

      translations.misc(locale)

      expect(
        translations.parsedTranslations[locale].misc.filter_label_location_card,
      ).toBe(values.location)
      expect(
        translations.parsedTranslations[locale].misc
          .special_background_filter_header,
      ).toBe(values.special)
    })
  })
})

