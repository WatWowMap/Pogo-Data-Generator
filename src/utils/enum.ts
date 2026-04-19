export function resolveEnumId(
  enumObject: { [key: string]: string | number },
  value?: string | number,
  label = 'value',
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return +value

  const resolved = enumObject[value]
  if (typeof resolved === 'number') return resolved

  console.warn(`Unable to resolve ${label}`, value)
  return undefined
}

export function enumName(
  enumObject: { [key: string]: string | number },
  value?: string | number,
  label = 'value',
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return enumName(enumObject, +value, label)
    if (enumObject[value] !== undefined) return value
    console.warn(`Unable to resolve ${label}`, value)
    return undefined
  }

  if (typeof enumObject[value] === 'string') {
    return enumObject[value] as string
  }

  const matchedEntry = Object.entries(enumObject).find(
    ([key, enumValue]) => !/^\d+$/.test(key) && enumValue === value,
  )
  if (matchedEntry) return matchedEntry[0]

  console.warn(`Unable to resolve ${label}`, value)
  return undefined
}
