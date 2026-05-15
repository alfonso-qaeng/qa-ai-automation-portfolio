import { APIRequestContext } from '@playwright/test';

export async function get<T>(request: APIRequestContext, endpoint: string): Promise<T> {
  const response = await request.get(endpoint);
  if (!response.ok()) {
    throw new Error(`GET ${endpoint} failed: ${response.status()} ${response.statusText()}`);
  }
  return response.json() as Promise<T>;
}

export async function post<T>(
  request: APIRequestContext,
  endpoint: string,
  data: Record<string, unknown>,
): Promise<T> {
  const response = await request.post(endpoint, { data });
  if (!response.ok()) {
    throw new Error(`POST ${endpoint} failed: ${response.status()} ${response.statusText()}`);
  }
  return response.json() as Promise<T>;
}
