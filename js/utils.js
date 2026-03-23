export function phoneToTel(phone) {
  return phone.replace(/[^\d+]/g, "");
}

export function ensureUrl(val) {
  if (!val) return "";
  if (/^https?:\/\//.test(val)) return val;
  return "https://" + val;
}
