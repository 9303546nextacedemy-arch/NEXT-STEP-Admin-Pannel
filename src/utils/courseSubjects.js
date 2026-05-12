/** @typedef {{ id: string, title: string }} CourseSubject */

export function newSubjectId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** @param {unknown} raw @returns {CourseSubject[]} */
export function normalizeSubjects(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push({ id: newSubjectId(), title: t });
      continue;
    }
    if (item && typeof item === "object") {
      const id = String(item.id ?? "").trim();
      const title = String(item.title ?? "").trim();
      if (id && title) out.push({ id, title });
    }
  }
  return out;
}
