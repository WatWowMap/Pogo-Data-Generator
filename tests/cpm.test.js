const { generate } = require('../dist/index')

jest.setTimeout(30_000)

describe('CPM Generation', () => {
  let cpmData

  beforeAll(async () => {
    const data = await generate({ raw: true })
    cpmData = data.cpm
  });
  
  test('generates CPM data', () => {
    expect(cpmData).toBeDefined()
    expect(Object.keys(cpmData).length).toBeGreaterThan(0)
  })

  test('has correct whole level values', () => {
    // Level 1
    expect(cpmData["1.0"]).toBeDefined()
    expect(cpmData["1.0"].level).toBe(1)
    expect(cpmData["1.0"].multiplier).toBe(0.094)

    // Level 40
    expect(cpmData["40.0"]).toBeDefined()
    expect(cpmData["40.0"].level).toBe(40)
    expect(cpmData["40.0"].multiplier).toBe(0.7903)

    // Level 55
    expect(cpmData["55.0"]).toBeDefined()
    expect(cpmData["55.0"].level).toBe(55)
    expect(cpmData["55.0"].multiplier).toBe(0.8653)
  });

  test('calculates half level values correctly', () => {
    // Level 1.5
    expect(cpmData["1.5"]).toBeDefined()
    expect(cpmData["1.5"].level).toBe(1.5)
    expect(cpmData["1.5"].multiplier).toBeCloseTo(0.1351374, 6)

    // Level 40.5
    expect(cpmData["40.5"]).toBeDefined()
    expect(cpmData["40.5"].level).toBe(40.5)
  });

  test('keys are in correct format (n.0 or n.5)', () => {
    const keys = Object.keys(cpmData)
    keys.forEach((key) => {
      expect(key).toMatch(/^\d+\.(0|5)$/)
    })
  })

  test('levels are in sequential order', () => {
    const keys = Object.keys(cpmData)
    const levels = keys.map((k) => parseFloat(k))
    
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1])
    }
  })

  test('has expected total number of entries', () => {
    // 80 whole levels + 79 half levels = 159 total
    expect(Object.keys(cpmData).length).toBe(159)
  })
})