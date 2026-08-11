const Invasion = require('../dist/classes/Invasion').default
const base = require('../dist/base').default

const parseInvasion = (team) => {
  const invasion = new Invasion({ includeBalloons: false })
  invasion.invasions({
    12: {
      active: true,
      lineup: {
        rewards: [0],
        team: [team, [], []],
      },
    },
  })
  return invasion
}

describe('invasion forms', () => {
  test('omits formId when community data omits or nulls a form', () => {
    expect(
      parseInvasion([{ id: 633 }, { id: 634, form: null }]).parsedInvasions[12]
        .encounters,
    ).toEqual([
      { id: 633, position: 'first' },
      { id: 634, position: 'first' },
    ])
  })

  test.each([0, 2291])('preserves an explicitly provided form %s', (form) => {
    expect(
      parseInvasion([{ id: 633, form }]).parsedInvasions[12].encounters,
    ).toEqual([{ id: 633, formId: form, position: 'first' }])
  })

  test('omits unknown forms from ReactMap-style templated output', () => {
    const invasion = parseInvasion([
      { id: 633 },
      { id: 634, form: null },
      { id: 635, form: 0 },
      { id: 636, form: 2291 },
    ])
    const settings = structuredClone(base.invasions)
    settings.options.customFields = {
      ...settings.options.customFields,
      formId: 'form',
    }
    settings.template.encounters = { id: true, formId: true }

    expect(
      invasion.templater(invasion.parsedInvasions, settings)[12].encounters,
    ).toEqual({
      first: [
        { id: 633 },
        { id: 634 },
        { id: 635, form: 0 },
        { id: 636, form: 2291 },
      ],
    })
  })
})
