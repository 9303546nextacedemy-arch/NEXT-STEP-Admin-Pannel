import { 
  collection, 
  getDocs, 
  query,
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COURSES_COLLECTION = "courses";
const LOCAL_KEY = "admin_course_categories_v1";
const HIDDEN_KEY = "admin_course_categories_hidden_v1";

const readLocalCategories = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalCategories = (items) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
};

const readHiddenNames = () => {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHiddenNames = (items) => {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(items));
};

const uniqNames = (names) => {
  const seen = new Set();
  const out = [];
  for (const n of names) {
    const name = String(n || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.sort((a, b) => a.localeCompare(b));
};

const removeHiddenName = (name) => {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return;
  writeHiddenNames(readHiddenNames().filter((n) => String(n).toLowerCase() !== target));
};

export const categoryService = {
  // Get all categories: merge course categories + locally managed categories
  getAllCategories: async () => {
    let courseNames = [];
    try {
      const q = query(collection(db, COURSES_COLLECTION), orderBy("title", "asc"));
      const querySnapshot = await getDocs(q);
      courseNames = querySnapshot.docs
        .map((d) => String(d.data()?.category || "").trim())
        .filter(Boolean);
    } catch {
      // Ignore network/rule errors for category suggestions.
    }
    const localItems = readLocalCategories();
    const hidden = new Set(readHiddenNames().map((n) => String(n).toLowerCase()));
    const localByName = new Set(localItems.map((x) => String(x.name || "").toLowerCase()));
    const visibleLocal = localItems.filter((x) => !hidden.has(String(x.name || "").toLowerCase()));
    const courseOnly = uniqNames(courseNames).filter(
      (name) => !localByName.has(name.toLowerCase()) && !hidden.has(name.toLowerCase()),
    );
    return [
      ...visibleLocal.map((x) => ({ id: x.id, name: x.name })),
      ...courseOnly.map((name) => ({ id: `course:${encodeURIComponent(name)}`, name })),
    ];
  },

  // Add category in local managed set (no rule-sensitive write)
  addCategory: async (categoryName) => {
    const name = String(categoryName || "").trim();
    if (!name) throw new Error("Category name is required");
    const items = readLocalCategories();
    if (!items.some((x) => String(x.name).toLowerCase() === name.toLowerCase())) {
      items.push({ id: `local_${Date.now()}`, name });
      writeLocalCategories(items);
    }
    removeHiddenName(name);
    return { id: `local_${Date.now()}`, name };
  },

  // Update category in local managed set
  updateCategory: async (categoryId, categoryName) => {
    const name = String(categoryName || "").trim();
    if (!name) throw new Error("Category name is required");
    const items = readLocalCategories();
    if (String(categoryId).startsWith("local_")) {
      const next = items.map((x) => (x.id === categoryId ? { ...x, name } : x));
      writeLocalCategories(next);
      removeHiddenName(name);
      return;
    }

    const oldName = String(categoryId).startsWith("course:")
      ? decodeURIComponent(String(categoryId).slice(7))
      : "";
    if (oldName) {
      const hidden = readHiddenNames();
      if (!hidden.some((x) => String(x).toLowerCase() === oldName.toLowerCase())) {
        hidden.push(oldName);
        writeHiddenNames(hidden);
      }
    }
    const exists = items.some((x) => String(x.name).toLowerCase() === name.toLowerCase());
    if (!exists) {
      items.push({ id: `local_${Date.now()}`, name });
      writeLocalCategories(items);
    }
    removeHiddenName(name);
  },

  // Delete only from local managed set
  deleteCategory: async (categoryId) => {
    if (String(categoryId).startsWith("course:")) {
      const name = decodeURIComponent(String(categoryId).slice(7));
      const hidden = readHiddenNames();
      if (!hidden.some((x) => String(x).toLowerCase() === name.toLowerCase())) {
        hidden.push(name);
        writeHiddenNames(hidden);
      }
      return;
    }
    const items = readLocalCategories();
    writeLocalCategories(items.filter((x) => x.id !== categoryId));
  }
};
