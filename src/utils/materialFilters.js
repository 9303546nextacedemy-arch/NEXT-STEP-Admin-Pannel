import { normalizeSubjects } from './courseSubjects';

/** Batch / subject / chapter toolbar: shared value for “no filter”. */
export const FILTER_ALL = 'all';

function subjectValueMatchesRow(row, subjectVal) {
  if (!subjectVal || subjectVal === FILTER_ALL) return true;
  if (subjectVal.startsWith('id:')) {
    return row.subjectId === subjectVal.slice(3);
  }
  if (subjectVal.startsWith('title:')) {
    return (row.subjectTitle || '').trim() === subjectVal.slice(6);
  }
  return true;
}

function chapterValueMatchesRow(row, chapterVal) {
  if (!chapterVal || chapterVal === FILTER_ALL) return true;
  if (chapterVal.startsWith('id:')) {
    return row.chapterId === chapterVal.slice(3);
  }
  if (chapterVal.startsWith('title:')) {
    return (row.chapterTitle || '').trim() === chapterVal.slice(6);
  }
  return true;
}

/** Client-side filter for lecture / note / live-class rows. */
export function matchesSubjectChapterFilters(row, subjectVal, chapterVal) {
  if (!subjectValueMatchesRow(row, subjectVal)) return false;
  if (!chapterValueMatchesRow(row, chapterVal)) return false;
  return true;
}

/**
 * Subject dropdown options from course definition + any extra titles on loaded rows.
 * @param {'all'|string} selectedCourseId
 * @param {Array} courses
 * @param {Array} items — already loaded for the current batch scope
 */
export function buildSubjectFilterOptions(selectedCourseId, courses, items) {
  const base = [{ value: FILTER_ALL, label: 'All subjects' }];
  if (selectedCourseId === FILTER_ALL) {
    const seen = new Set();
    const extra = [];
    for (const it of items) {
      const t = (it.subjectTitle || '').trim();
      if (!t && !it.subjectId) continue;
      const key = it.subjectId ? `id:${it.subjectId}` : `title:${t}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const course = courses.find((c) => c.id === it.courseId);
      const batch = course?.title?.trim() || 'Course';
      const label = t ? `${batch} · ${t}` : `${batch} · (${it.subjectId || '—'})`;
      extra.push({ value: key, label });
    }
    extra.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
    return [...base, ...extra];
  }
  const course = courses.find((c) => c.id === selectedCourseId);
  const subs = normalizeSubjects(course?.subjects);
  const seen = new Set();
  const out = [...base];
  for (const s of subs) {
    const key = `id:${s.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ value: key, label: s.title });
  }
  for (const it of items) {
    if (it.courseId && it.courseId !== selectedCourseId) continue;
    const t = (it.subjectTitle || '').trim();
    const key = it.subjectId ? `id:${it.subjectId}` : t ? `title:${t}` : '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ value: key, label: t || it.subjectId || '—' });
  }
  return out;
}

/**
 * Chapter dropdown from rows that match the current subject filter (batch already applied in `items`).
 * @param {Array} items
 * @param {string} subjectVal
 * @param {'all'|string} selectedCourseId — when "all courses", chapter labels can include batch name
 * @param {Array} courses
 */
export function buildChapterFilterOptions(items, subjectVal, selectedCourseId, courses) {
  const base = [{ value: FILTER_ALL, label: 'All chapters' }];
  const pool =
    !subjectVal || subjectVal === FILTER_ALL
      ? items
      : items.filter((row) => subjectValueMatchesRow(row, subjectVal));
  const seen = new Set();
  const extra = [];
  for (const it of pool) {
    const t = (it.chapterTitle || '').trim();
    const key = it.chapterId ? `id:${it.chapterId}` : t ? `title:${t}` : '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const course = courses.find((c) => c.id === it.courseId);
    const batch = course?.title?.trim();
    const label =
      batch && selectedCourseId === FILTER_ALL ? `${batch} · ${t || it.chapterId || '—'}` : t || it.chapterId || '—';
    extra.push({ value: key, label });
  }
  extra.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  return [...base, ...extra];
}
