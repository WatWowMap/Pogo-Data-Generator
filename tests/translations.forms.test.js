const Translations = require('../dist/classes/Translations').default
const base = require('../dist/base').default

const rawTexts = {
  en: {
    pokemon_name_0351: 'Castform',
    pokemon_name_0386: 'Deoxys',
    pokemon_name_0422: 'Shellos',
    pokemon_name_0479: 'Rotom',
    pokemon_name_0493: 'Arceus',
    pokemon_name_0669: 'Flabébé',
    pokemon_name_0774: 'Minior',
    pokemon_name_0931: 'Squawkabilly',
    form_blue: 'Blue Plumage',
    form_green: 'Green Plumage',
    form_yellow: 'Yellow Plumage',
    form_white: 'White Kyurem',
    form_meteor: 'Meteor Form',
    form_west_sea: 'West Sea',
    form_core_blue: 'Blue Core',
    form_core_green: 'Green Core',
    form_core_indigo: 'Indigo Core',
    form_core_yellow: 'Yellow Core',
    form_squakabilly_white: 'White Plumage',
    form_flabebe_blue: 'Blue Flower',
    form_flabebe_white: 'White Flower',
    form_rotom_normal: 'Rotom',
    form_castform_normal: 'Normal Form',
    form_castform_sunny: 'Sunny Form',
    form_arceus_normal: 'Normal-Type',
    form_rotom_wash: 'Wash Rotom',
    form_arceus_fire: 'Fire-Type',
    form_attack: 'Attack',
    form_deoxys_attack: 'Attack Forme',
  },
  de: {
    pokemon_name_0774: 'Meteno',
    pokemon_name_0931: 'Krawalloro',
    form_blue: 'Blaugefiedert',
    form_core_blue: 'Hellblauer Kern',
    form_core_indigo: 'Blauer Kern',
    form_meteor: 'Meteorform',
  },
  // Niantic ships some specific keys untranslated in a few locales
  ko: {
    form_attack: '어택폼',
    form_deoxys_attack: 'Attack Forme',
    form_arceus_fire: 'Fire-Type',
    form_blue: '블루 페더',
    form_core_blue: 'Blue Core',
    form_core_indigo: '파란색 코어',
    form_flabebe_blue: '파란 꽃',
  },
}

const pokemon = {
  351: { pokemonName: 'Castform', forms: [29, 30] },
  386: { pokemonName: 'Deoxys', forms: [34] },
  422: { pokemonName: 'Shellos', forms: [96] },
  479: { pokemonName: 'Rotom', forms: [81, 85] },
  493: { pokemonName: 'Arceus', forms: [100, 109] },
  669: { pokemonName: 'Flabébé', forms: [2617, 2618] },
  774: {
    pokemonName: 'Minior',
    forms: [2707, 2708, 2709, 2710, 2714, 3380],
  },
  931: { pokemonName: 'Squawkabilly', forms: [2985, 2986, 2987, 2988] },
}

const forms = {
  29: { formName: 'Normal', proto: 'CASTFORM_NORMAL' },
  34: { formName: 'Attack', proto: 'DEOXYS_ATTACK' },
  30: { formName: 'Sunny', proto: 'CASTFORM_SUNNY' },
  100: { formName: 'Normal', proto: 'ARCEUS_NORMAL' },
  81: { formName: 'Normal', proto: 'ROTOM_NORMAL' },
  85: { formName: 'Wash', proto: 'ROTOM_WASH' },
  96: { formName: 'West Sea', proto: 'SHELLOS_WEST_SEA' },
  109: { formName: 'Fire', proto: 'ARCEUS_FIRE' },
  2617: { formName: 'Blue', proto: 'FLABEBE_BLUE' },
  2618: { formName: 'White', proto: 'FLABEBE_WHITE' },
  2707: { formName: 'Meteor Blue', proto: 'MINIOR_METEOR_BLUE' },
  2708: { formName: 'Blue', proto: 'MINIOR_BLUE' },
  2709: { formName: 'Green', proto: 'MINIOR_GREEN' },
  2710: { formName: 'Indigo', proto: 'MINIOR_INDIGO' },
  2714: { formName: 'Yellow', proto: 'MINIOR_YELLOW' },
  3380: { formName: 'Meteor', proto: 'MINIOR_METEOR' },
  2985: { formName: 'Green', proto: 'SQUAWKABILLY_GREEN' },
  2986: { formName: 'Blue', proto: 'SQUAWKABILLY_BLUE' },
  2987: { formName: 'Yellow', proto: 'SQUAWKABILLY_YELLOW' },
  2988: { formName: 'White', proto: 'SQUAWKABILLY_WHITE' },
}

const parseForms = (locale, formsInput = forms, extraTexts = {}) => {
  const options = JSON.parse(JSON.stringify(base.translations.options))
  const translations = new Translations(options)
  translations.rawTranslations.en = rawTexts.en
  translations.rawTranslations[locale] = { ...rawTexts[locale], ...extraTexts }
  translations.parsedTranslations[locale] = {
    types: { poke_type_10: locale === 'ko' ? '불꽃' : 'Fire' },
    misc: {},
  }
  translations.generics[locale] = {
    substitute: 'Substitute',
    unknown: 'Unknown',
    none: 'None',
    normal: 'Normal',
  }
  translations.pokemon(
    locale,
    { names: true, forms: true },
    pokemon,
    formsInput,
  )
  return translations.parsedTranslations[locale].forms
}

describe('Translations form names', () => {
  test('Minior uses its own core keys instead of Squawkabilly plumage', () => {
    const parsed = parseForms('en')

    expect(parsed.form_2708).toBe('Blue Core')
    expect(parsed.form_2709).toBe('Green Core')
    expect(parsed.form_2710).toBe('Indigo Core')
    expect(parsed.form_2714).toBe('Yellow Core')
  })

  test('Minior meteor forms are not mixed up with core keys', () => {
    const parsed = parseForms('en')

    expect(parsed.form_2707).toBe('Meteor Blue')
    expect(parsed.form_3380).toBe('Meteor Form')
  })

  test('Squawkabilly keeps the generic plumage keys and gets white via alias', () => {
    const parsed = parseForms('en')

    expect(parsed.form_2985).toBe('Green Plumage')
    expect(parsed.form_2986).toBe('Blue Plumage')
    expect(parsed.form_2987).toBe('Yellow Plumage')
    expect(parsed.form_2988).toBe('White Plumage')
  })

  test('uses Pokémon specific keys over shared generic ones', () => {
    const parsed = parseForms('en')

    expect(parsed.form_2617).toBe('Blue Flower')
    expect(parsed.form_2618).toBe('White Flower')
    expect(parsed.form_85).toBe('Wash Rotom')
    expect(parsed.form_109).toBe('Fire-Type')
  })

  test('falls back to generic keys when no specific key exists', () => {
    const parsed = parseForms('en')

    expect(parsed.form_96).toBe('West Sea')
  })

  test('keeps "Normal" for normal forms even if a specific key exists', () => {
    const parsed = parseForms('en')

    expect(parsed.form_81).toBe('Normal')
    expect(parsed.form_29).toBe('Normal')
    expect(parsed.form_100).toBe('Normal')
    expect(parsed.form_30).toBe('Sunny Form')
  })

  test('prefers the regular Pokémon key over an alias', () => {
    const parsed = parseForms('en', forms, {
      form_squawkabilly_white: 'White Feathers',
    })

    expect(parsed.form_2988).toBe('White Feathers')
  })

  test('falls back to the previous logic when a form has no proto', () => {
    const parsed = parseForms('en', {
      ...forms,
      2708: { formName: 'Blue' },
    })

    expect(parsed.form_2708).toBe('Blue Plumage')
  })

  test('resolves the specific keys for other locales', () => {
    const parsed = parseForms('de')

    expect(parsed.form_2708).toBe('Hellblauer Kern')
    expect(parsed.form_2710).toBe('Blauer Kern')
    expect(parsed.form_2986).toBe('Blaugefiedert')
    expect(parsed.form_3380).toBe('Meteorform')
  })

  test('falls back to the previous logic when a specific key is untranslated', () => {
    const parsed = parseForms('ko')

    expect(parsed.form_34).toBe('어택폼')
    expect(parsed.form_109).toBe('불꽃')
    expect(parsed.form_2617).toBe('파란 꽃')
    expect(parsed.form_2710).toBe('파란색 코어')
  })

  test('keeps an untranslated alias key instead of another Pokémon generic key', () => {
    const parsed = parseForms('ko')

    expect(parsed.form_2708).toBe('Blue Core')
    expect(parsed.form_2986).toBe('블루 페더')
  })

  test('uses the specific key in English even though it matches itself', () => {
    const parsed = parseForms('en')

    expect(parsed.form_34).toBe('Attack Forme')
  })
})
