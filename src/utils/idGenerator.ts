import { nanoid } from 'nanoid'

export function generateId(prefix?: string): string {
  const id = nanoid(10)
  return prefix ? `${prefix}-${id}` : id
}

export function generateFamilyId(): string {
  return generateId('family')
}

export function generateLocationId(): string {
  return generateId('loc')
}

export function generateRouteId(): string {
  return generateId('route')
}
