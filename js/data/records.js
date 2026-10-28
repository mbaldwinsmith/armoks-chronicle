import {titleCase} from './language.js?v=0.22.0';
export function mergeData(base, extra) {
  if (base === undefined) return extra;
  if (base && extra && typeof base === 'object' && typeof extra === 'object' && !Array.isArray(base) && !Array.isArray(extra)) {
    const merged = Object.assign(Object.create(null), base);
    for (const key of Object.keys(extra)) merged[key] = mergeData(base[key], extra[key]);
    return merged;
  }
  // Standard values and repeated children are authoritative in this iteration.
  // Supplementary raw data remains available separately, including conflicting fields.
  return base;
}
export function displayName(data, kind, id) {
  const n = data && typeof data === 'object' ? data.name || data.title || data.type : '';
  return typeof n === 'string' && n ? titleCase(n) : `${titleCase(kind.replaceAll('_', ' '))} ${id}`;
}
