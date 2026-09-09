import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { covers, storyBySlug, stories } from "@/data/content";
import { blogService, apiBlogToStory } from "@/lib/blog-service";
import { useProgress, useRecent, useSaved } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { ChapterDocumentViewer } from "@/components/ChapterDocumentViewer";
import { Eye, User, Tag } from "lucide-react";

export const Route = createFileRoute("/kathayein/$slug")({
  loader: async ({ params }) => {
    // 1. First attempt to fetch from backend API
    try {
      const apiBlog = await blogService.getBlogBySlug(params.slug);
      if (apiBlog) {
        return { story: apiBlogToStory(apiBlog) };
      }
    } catch {
      // Ignore API failure and fallback
    }

    // 2. Fall back to local content
    const localStory = storyBySlug(params.slug);
    if (!localStory) throw notFound();
    return { story: localStory };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "कथा नहीं मिली — वाचनालय" }, { name: "robots", content: "noindex" }],
      };
    }
    const { story } = loaderData;
    return {
      meta: [
        { title: `${story.title} — जैन कहानियां वाचनालय` },
        { name: "description", content: story.summary },
        { property: "og:title", content: story.title },
        { property: "og:description", content: story.summary },
      ],
    };
  },
  component: StoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">यह कथा नहीं मिली</h1>
      <Link to="/kathayein" className="mt-6 inline-block text-vermilion">
        सभी कथाएँ →
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">कथा लोड नहीं हो सकी</h1>
      <Link to="/kathayein" className="mt-6 inline-block text-vermilion">
        सभी कथाएँ →
      </Link>
    </div>
  ),
});

function StoryPage() {
  const { story } = Route.useLoaderData();
  const { isSaved, toggle } = useSaved();
  const { record, forSlug } = useProgress();
  const { visit } = useRecent();
  const { play, track, playing, toggle: togglePlayer } = usePlayer();
  const [chapter, setChapter] = useState(0);

  const cover = story.coverImage || (story.cover ? covers[story.cover] : null);

  useEffect(() => {
    setChapter(forSlug(story.slug)?.chapter ?? 0);
    visit(story.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.slug]);

  const openChapter = (i: number) => {
    setChapter(i);
    record({ slug: story.slug, chapter: i, chapters: story.chapters.length, at: Date.now() });
  };

  const active = story.chapters[chapter] || story.chapters[0];

  const relatedStories =
    story.related.length > 0
      ? story.related.map(storyBySlug).filter((s): s is NonNullable<typeof s> => !!s)
      : stories.filter((s) => s.slug !== story.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-6xl px-5 pt-12">
      <div className="flex flex-wrap items-center gap-2">
        <p className="eyebrow text-vermilion">{story.category}</p>
        {story.author && (
          <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-ink-soft">
            <User className="h-3 w-3" />
            {story.author}
          </span>
        )}
        {typeof story.views === "number" && (
          <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-ink-soft font-mono">
            <Eye className="h-3 w-3" />
            {story.views} बार देखा गया
          </span>
        )}
      </div>

      <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{story.title}</h1>
      {story.latin && <p className="mt-1 font-mono text-xs text-ink-soft">{story.latin}</p>}
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{story.summary}</p>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              <Tag className="h-2.5 w-2.5" />#{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1.5 text-ink-soft">
          {story.minutes} मिनट पठन
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (track?.id === story.slug) {
              togglePlayer();
            } else {
              const narrationText = [
                story.title,
                story.summary,
                ...story.chapters.map((c) => `${c.title}. ${c.paras.join(" ")}`),
              ].join(" ");
              play({
                id: story.slug,
                title: story.title,
                duration: story.audio || "08:00",
                subtitle: story.category,
                text: narrationText,
              });
            }
          }}
          className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-gold-foreground font-medium transition-transform hover:-translate-y-0.5 active:scale-95 shadow-xs cursor-pointer"
        >
          {playing && track?.id === story.slug ? (
            <>
              <span className="animate-pulse font-bold">❙❙</span>
              <span>रोकें · {story.audio}</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>सुनें · {story.audio}</span>
            </>
          )}
        </button>
        <button
          onClick={() => toggle(story.slug)}
          className="rounded-full border border-input bg-card px-4 py-2"
        >
          {isSaved(story.slug) ? "★ सहेजी गई" : "☆ सहेजें"}
        </button>
        <button
          onClick={() => {
            const url = typeof window !== "undefined" ? window.location.href : "";
            if (navigator.share) void navigator.share({ title: story.title, url });
            else void navigator.clipboard?.writeText(url);
          }}
          className="rounded-full border border-input bg-card px-4 py-2"
        >
          ↗ साझा करें
        </button>
      </div>

      {cover ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <img
            src={cover}
            alt={story.title}
            loading="lazy"
            width={1024}
            height={768}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Chapter Sidebar */}
        {story.chapters.length > 1 && (
          <aside className="lg:col-span-4">
            <p className="eyebrow">अध्याय ({story.chapters.length})</p>
            <ol className="mt-3 space-y-2">
              {story.chapters.map((c, i) => (
                <li key={c.title + i}>
                  <button
                    onClick={() => openChapter(i)}
                    className={
                      i === chapter
                        ? "flex w-full items-baseline gap-3 rounded-xl bg-accent px-4 py-3 text-left"
                        : "flex w-full items-baseline gap-3 rounded-xl px-4 py-3 text-left text-ink-soft transition-colors hover:bg-muted"
                    }
                  >
                    <span className="font-mono text-xs text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg leading-snug">{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}

        {/* Content / Active Chapter */}
        <div className={story.chapters.length > 1 ? "lg:col-span-8" : "lg:col-span-12"}>
          {active ? (
            <div className="card-leaf p-6 sm:p-8">
              {/* Section Document or Illustration if present */}
              {active.imageUrl && (
                <ChapterDocumentViewer
                  url={active.imageUrl}
                  title={active.title}
                  chapterNo={chapter + 1}
                />
              )}

              <h2 className="text-3xl">{active.title}</h2>
              <div className="mt-5 space-y-5 text-lg leading-relaxed">
                {active.paras.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {story.chapters.length > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm">
                  <button
                    disabled={chapter === 0}
                    onClick={() => openChapter(chapter - 1)}
                    className="text-ink-soft disabled:opacity-30"
                  >
                    ← पिछला अध्याय
                  </button>
                  <button
                    disabled={chapter >= story.chapters.length - 1}
                    onClick={() => openChapter(chapter + 1)}
                    className="text-vermilion disabled:opacity-30"
                  >
                    अगला अध्याय →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">संबंधित कथाएँ</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedStories.map((r) => (
              <Link
                key={r.slug}
                to="/kathayein/$slug"
                params={{ slug: r.slug }}
                className="card-leaf p-5 transition-transform hover:-translate-y-1"
              >
                <span className="eyebrow text-vermilion">{r.category}</span>
                <h3 className="mt-1 font-display text-xl">{r.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{r.minutes} मिनट</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
