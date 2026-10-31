export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** 成功レスポンスを `{ success: true, data }` の形で返す。 */
export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}
