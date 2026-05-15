import { expect } from '@playwright/test';

type FieldType = 'string' | 'number' | 'boolean' | 'object';

/**
 * Asserts that every key in `fields` exists on `data` with the declared type.
 * Produces a descriptive failure message per field.
 */
export function assertSchema(data: unknown, fields: Record<string, FieldType>): void {
  const obj = data as Record<string, unknown>;
  for (const [field, expectedType] of Object.entries(fields)) {
    expect(
      typeof obj[field],
      `expected field "${field}" to be ${expectedType}, got ${typeof obj[field]}`,
    ).toBe(expectedType);
  }
}

export function assertUserSchema(user: unknown): void {
  assertSchema(user, {
    id:         'number',
    email:      'string',
    first_name: 'string',
    last_name:  'string',
    avatar:     'string',
  });

  const u = user as Record<string, string>;
  expect(u['email'], 'email should be non-empty').toBeTruthy();
  expect(u['avatar'], 'avatar should be a valid URL').toMatch(/^https?:\/\//);
}

export function assertIsoDate(value: unknown, label: string): void {
  expect(typeof value, `${label} should be a string`).toBe('string');
  expect(
    Number.isNaN(new Date(value as string).getTime()),
    `${label} should be a parseable ISO date`,
  ).toBe(false);
}
