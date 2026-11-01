/**
 * その週の月曜日 00:00（ローカル時刻）の UNIX ミリ秒を返す。
 * 繰り返しタスクの「今週完了済みか」の判定に使う。
 */
export function getStartOfWeek(now: number = Date.now()): number {
  const d = new Date(now);
  const day = d.getDay(); // 0 = 日曜, 1 = 月曜, ...
  const diff = (day + 6) % 7; // 月曜を起点とした差分（日曜は 6 日前）
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d.getTime();
}
