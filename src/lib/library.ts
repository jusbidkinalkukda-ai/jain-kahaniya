import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { type ApiBlog } from "./blog-service";
import { wishlistService, WISHLIST_QUERY_KEY } from "./wishlist-service";

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

export function useWishlistItems() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistService.getWishlist(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useWishlist(apiId?: string) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isSaved, toggle } = useSaved();
  const queryClient = useQueryClient();
  const { data: wishlist = [] } = useWishlistItems();

  const isWishlisted = !!apiId && wishlist.some((blog) => blog._id === apiId);
  const saved = apiId ? isWishlisted : isSaved(apiId || "");

  const mutation = useMutation({
    mutationFn: async (_slug: string) => {
      if (!apiId) return;
      await wishlistService.toggleWishlist(apiId);
    },
    onMutate: async (slug: string) => {
      if (!apiId) return { previous: undefined as ApiBlog[] | undefined };
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous = queryClient.getQueryData<ApiBlog[]>(WISHLIST_QUERY_KEY);
      queryClient.setQueryData<ApiBlog[]>(WISHLIST_QUERY_KEY, (current = []) => {
        if (isWishlisted) return current.filter((blog) => blog._id !== apiId);
        if (current.some((blog) => blog._id === apiId)) return current;
        return [
          ...current,
          {
            _id: apiId,
            slug,
            title: "",
            category: null,
          },
        ];
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
      toast.error(error instanceof Error ? error.message : "विशलिस्ट अपडेट नहीं हो सकी");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  const save = async (slug: string) => {
    if (!apiId) {
      toggle(slug);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    await mutation.mutateAsync(slug);
  };

  return { saved, save, isUpdating: mutation.isPending };
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
