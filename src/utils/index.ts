export function toReadableDate(date: Date, includeTime = false) {
  const rule = includeTime ? 'toLocaleString' : 'toLocaleDateString';

  return date[rule]('ko-KR');
}
