import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoryCard } from "@/components/StoryCard";
import { storyBySlug } from "@/data/content";
import { apiBlogToStory, blogService } from "@/lib/blog-service";
import { useAuth } from "@/lib/auth-context";
import { useSaved, useWishlistItems } from "@/lib/library";

export const Route = createFileRoute("/sangrah")({
  head: () => ({
    meta: [
      { title: "मेरा संग्रह — सहेजी कथाएँ और प्रगति" },
      {
        name: "description",
        content:
          "आपकी सहेजी कथाएँ, पठन प्रगति, हाल में देखा गया, श्रवण इतिहास और प्रश्नोत्तरी अंक।",
      },
      { property: "og:title", content: "मेरा संग्रह" },
      { property: "og:description", content: "जहाँ छोड़ा था वहीं से आगे पढ़ें।" },
    ],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { saved } = useSaved();
  const { data: wishlistBlogs = [], isLoading: wishlistLoading } = useWishlistItems();

  const apiSavedStories = wishlistBlogs
    .filter((blog) => blog.slug && blog.title)
    .map(apiBlogToStory);
  const localSavedStories = saved
    .map(storyBySlug)
    .filter((s): s is NonNullable<typeof s> => !!s)
    .filter((s) => !apiSavedStories.some((apiStory) => apiStory.slug === s.slug));
  const savedStories = isAuthenticated ? [...apiSavedStories, ...localSavedStories] : localSavedStories;
  const savedSlugs = new Set(savedStories.map((s) => s.slug));
  const preferredCategoryId = savedStories.find((s) => s.categoryId)?.categoryId;

  const { data: relatedStories = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related-blogs", "sangrah", preferredCategoryId, [...savedSlugs].join(",")],
    queryFn: async () => {
      const res = await blogService.getBlogs({
        page: 1,
        limit: 12,
        category: preferredCategoryId,
      });
      let mapped = (res.data ?? [])
        .filter((blog) => !savedSlugs.has(blog.slug))
        .map(apiBlogToStory);

      if (mapped.length < 3) {
        const more = await blogService.getBlogs({ page: 1, limit: 12 });
        const extra = (more.data ?? [])
          .filter((blog) => !savedSlugs.has(blog.slug))
          .map(apiBlogToStory);
        const seen = new Set(mapped.map((item) => item.slug));
        mapped = [...mapped, ...extra.filter((item) => !seen.has(item.slug))];
      }

      return mapped.slice(0, 3);
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">व्यक्तिगत</p>
        <h1 className="mt-2 text-4xl leading-[1.15] sm:text-5xl">मेरा संग्रह</h1>
        <p className="mt-1 font-mono text-xs tracking-wide text-ink-soft">Mera Sangrah</p>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          आपकी पढ़ाई, सहेजी कथाएँ और अंक — सब एक जगह।
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl leading-snug sm:text-3xl">सहेजी कथाएँ</h2>
        {!isAuthenticated ? (
          <p className="card-leaf mt-6 p-6 text-ink-soft">
            सहेजी कथाएँ देखने के लिए{" "}
            <button type="button" onClick={() => openAuthModal("login")} className="text-vermilion">
              प्रवेश करें
            </button>
            ।
          </p>
        ) : wishlistLoading && !savedStories.length ? (
          <p className="card-leaf mt-6 p-6 text-ink-soft">सहेजी कथाएँ लोड हो रही हैं...</p>
        ) : savedStories.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedStories.map((s) => (
              <StoryCard key={s.apiId || s.slug} story={s} />
            ))}
          </div>
        ) : (
          <p className="card-leaf mt-6 p-6 text-ink-soft">
            अभी कुछ सहेजा नहीं गया। किसी कथा पर सहेजें दबाएँ।
          </p>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl leading-snug sm:text-3xl">संबंधित कथाएँ</h2>
        {relatedLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-leaf h-40 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : relatedStories.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedStories.map((r) => (
              <Link
                key={r.apiId || r.slug}
                to="/kathayein/$slug"
                params={{ slug: r.slug }}
                className="card-leaf overflow-hidden p-0 transition-transform hover:-translate-y-1"
              >
                {r.coverImage ? (
                  <img
                    src={r.coverImage}
                    alt={r.title}
                    loading="lazy"
                    className="h-36 w-full object-cover"
                  />
                ) : null}
                <div className="p-5">
                  <span className="eyebrow text-vermilion">{r.category}</span>
                  <h3 className="mt-1 font-display text-xl">{r.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{r.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="card-leaf mt-6 p-6 text-ink-soft">अन्य कथाएँ उपलब्ध नहीं हैं।</p>
        )}
      </section>
    </div>
  );
}
