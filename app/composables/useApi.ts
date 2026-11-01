interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * `/api/v1/*` への型付きフェッチラッパー。
 * サーバ側の `{ success: true, data }` エンベロープを剥がして data を返す。
 */
export function useApi() {
  const base = '/api/v1';

  async function request<T>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const res = await $fetch<ApiResponse<T>>(`${base}${path}`, options);
    return res.data;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: <T>(path: string, body?: any) =>
      request<T>(path, { method: 'POST', body }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch: <T>(path: string, body?: any) =>
      request<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
