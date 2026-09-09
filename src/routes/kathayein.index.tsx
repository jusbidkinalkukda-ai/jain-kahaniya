import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHead } from "@/components/SiteLayout";
import { StoryCard } from "@/components/StoryCard";
import { stories, type Story } from "@/data/content";
import { blogService, apiBlogToStory, type BlogCategory } from "@/lib/blog-service";
import { Search, Loader2, RefreshCw, BookOpen, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/kathayein/")({
  head: () => ({
    meta: [
      { title: "जैन कहानियां — वाचनालय" },
      {
        name: "description",
        content:
          "भगवान महावीर, पार्श्वनाथ, ऋषभदेव, चंदनबाला, शालिभद्र और अन्य जैन कहानियां पढ़ें और सुनें।",
      },
      { property: "og:title", content: "जैन कहानियां" },
      { property: "og:description", content: "चुनी हुई जैन कहानियां — पठन और श्रवण के साथ।" },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("सभी");
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => blogService.getCategories(),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch blogs from API
  const {
    data: blogData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-blogs", activeCategoryId, currentPage, searchQuery],
    queryFn: () =>
      blogService.getBlogs({
        category: activeCategoryId,
        page: currentPage,
        limit: 12,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 1000 * 60 * 2,
  });

  // Category pill list
  const categoryOptions = useMemo(() => {
    const list: { label: string; id: string | undefined }[] = [{ label: "सभी", id: undefined }];

    categories.forEach((cat: BlogCategory) => {
      list.push({ label: cat.name, id: cat._id });
    });

    // Also include local story categories if no API categories yet
    if (categories.length === 0) {
      const uniqueLocal = Array.from(new Set(stories.map((s) => s.category)));
      uniqueLocal.forEach((name) => {
        list.push({ label: name, id: undefined });
      });
    }

    return list;
  }, [categories]);

  // Combine API stories with local stories fallback
  const displayedStories: Story[] = useMemo(() => {
    if (blogData?.data && blogData.data.length > 0) {
      return blogData.data.map(apiBlogToStory);
    }
    // Fallback to local content when API is unavailable or returns 0
    if (activeCategory === "सभी") {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return stories.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q),
        );
      }
      return stories;
    }
    return stories.filter((s) => s.category === activeCategory);
  }, [blogData, activeCategory, searchQuery]);

  const pagination = blogData?.pagination;
  const isApiSource = !!(blogData?.data && blogData.data.length > 0);

  const handleCategorySelect = (item: { label: string; id: string | undefined }) => {
    setActiveCategory(item.label);
    setActiveCategoryId(item.id);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHead
        eyebrow="कथा संग्रह"
        title="जैन कहानियां"
        latin="Jain Kathayein"
        intro="तीर्थंकरों, श्रावकों और साधकों की पावन कथाएँ — प्रत्येक अध्यायों में विभाजित, चित्र एवं ऑडियो के साथ।"
      />

      <div className="mx-auto max-w-6xl px-5">
        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((c) => (
              <button
                key={c.id ?? c.label}
                type="button"
                onClick={() => handleCategorySelect(c)}
                className={
                  c.label === activeCategory
                    ? "rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground transition-all shadow-xs"
                    : "rounded-full border border-input bg-card px-4 py-2 text-xs sm:text-sm text-ink-soft transition-colors hover:text-foreground hover:bg-muted/40"
                }
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Inline Search Input */}
          <div className="relative shrink-0 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="कथा खोजें..."
              className="w-full rounded-full border border-input bg-card pl-9 pr-4 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span key={isLoading ? "loading" : "count"}>
              {isLoading
                ? "कथाएँ लोड हो रही हैं..."
                : `कुल ${pagination?.total ?? displayedStories.length} कथाएँ${
                    isApiSource ? " (लाइव डेटाबेस से)" : ""
                  }`}
            </span>
          </div>

          {isError && (
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 text-destructive hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              पुनः प्रयास करें
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card-leaf flex flex-col overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted/60" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-14 w-full bg-muted/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stories Grid */}
        {!isLoading && displayedStories.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedStories.map((s) => (
              <StoryCard key={s.apiId || s.slug} story={s} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedStories.length === 0 && (
          <div className="mt-16 text-center py-12 card-leaf">
            <AlertCircle className="mx-auto h-10 w-10 text-ink-soft" />
            <h3 className="mt-3 font-display text-xl text-foreground">कोई कथा नहीं मिली</h3>
            <p className="mt-1 text-sm text-ink-soft">कृपया अन्य श्रेणी या खोज शब्द चुनकर देखें।</p>
            <button
              onClick={() => {
                setActiveCategory("सभी");
                setActiveCategoryId(undefined);
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground"
            >
              सभी कथाएँ अध्याय 
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.total > pagination.limit && (
          <div className="mt-12 flex items-center justify-center gap-3 pb-8">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-input bg-card px-4 py-2 text-sm text-ink-soft hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← पिछला पृष्ठ
            </button>
            <span className="text-xs sm:text-sm font-mono text-ink-soft">
              पृष्ठ {currentPage} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              disabled={currentPage >= Math.ceil(pagination.total / pagination.limit) || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-full border border-input bg-card px-4 py-2 text-sm text-ink-soft hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              अगला पृष्ठ →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
