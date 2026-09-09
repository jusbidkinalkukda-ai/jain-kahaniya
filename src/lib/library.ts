import { useCallback, useEffect, useRef, useState } from "react";

const read = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("jkv:store"));
  } catch {
    /* ignore */
  }
};

function useStore<T>(key: string, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [value, setValue] = useState<T>(fallbackRef.current);

  const refresh = useCallback(() => setValue(read<T>(key, fallbackRef.current)), [key]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("jkv:store", onChange);
    return () => window.removeEventListener("jkv:store", onChange);
  }, [refresh]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, save] as const;
}

/* Bookmarks */
export function useSaved() {
  const [saved, setSaved] = useStore<string[]>("jkv:saved", []);
  const isSaved = (slug: string) => saved.includes(slug);
  const toggle = (slug: string) =>
    setSaved(isSaved(slug) ? saved.filter((s) => s !== slug) : [slug, ...saved]);
  return { saved, isSaved, toggle };
}

/* Reading progress */
export type Progress = { slug: string; chapter: number; chapters: number; at: number };

export function useProgress() {
  const [progress, setProgress] = useStore<Progress[]>("jkv:progress", []);
  const record = (entry: Progress) =>
    setProgress([entry, ...progress.filter((p) => p.slug !== entry.slug)].slice(0, 20));
  const forSlug = (slug: string) => progress.find((p) => p.slug === slug);
  return { progress, record, forSlug };
}

/* Recently viewed */
export function useRecent() {
  const [recent, setRecent] = useStore<string[]>("jkv:recent", []);
  const visit = (slug: string) =>
    setRecent([slug, ...recent.filter((s) => s !== slug)].slice(0, 12));
  return { recent, visit };
}

/* Quiz history */
export type QuizRun = { score: number; total: number; at: number; set: string };

export function useQuizHistory() {
  const [history, setHistory] = useStore<QuizRun[]>("jkv:quiz", []);
  const add = (run: QuizRun) => setHistory([run, ...history].slice(0, 10));
  return { history, add };
}

export function useAudioHistory() {
  const [history] = useStore<{ id: string; title: string; duration: string }[]>(
    "jkv:audio-history",
    [],
  );
  return history;
}
