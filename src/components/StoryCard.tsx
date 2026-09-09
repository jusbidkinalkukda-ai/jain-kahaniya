import { Link } from "@tanstack/react-router";
import { covers, type Story } from "@/data/content";
import { useWishlist } from "@/lib/library";
import { Star } from "lucide-react";

function displayAuthor(author?: string) {
  if (!author) return undefined;
  if (/^[a-f0-9]{24}$/i.test(author)) return undefined;
  return author;
}

export function StoryCard({ story }: { story: Story }) {
  const { saved, save, isUpdating } = useWishlist(story.apiId);
  const cover = story.coverImage || (story.cover ? covers[story.cover] : null);
  const author = displayAuthor(story.author);

  return (
    <article className="card-leaf group relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-accent">
        <Link
          to="/kathayein/$slug"
          params={{ slug: story.slug }}
          className="block size-full overflow-hidden"
        >
          {cover ? (
            <img
              src={cover}
              alt={story.title}
              loading="lazy"
              width={1024}
              height={768}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="jali flex size-full items-center justify-center bg-accent bg-blend-soft-light">
              <span className="rounded-full bg-card px-4 py-2 font-display text-lg">{story.title}</span>
            </span>
          )}
        </Link>

        {typeof story.views === "number" && (
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[10px] text-foreground shadow-xs backdrop-blur-sm">
            👁 {story.views}
          </span>
        )}

        <button
          type="button"
          aria-label={saved ? "सहेजी गई सूची" : "सहेजें"}
          disabled={isUpdating}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void save(story.slug);
          }}
          className="absolute top-2.5 right-2.5 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-background active:scale-90"
          title={saved ? "सहेजी गई" : "सहेजें"}
        >
          <Star
            className={`size-5 transition-colors ${
              saved ? "fill-vermilion text-vermilion" : "text-ink-soft hover:text-vermilion"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="eyebrow text-vermilion">{story.category}</span>
          {author ? (
            <span className="max-w-[14rem] truncate text-xs text-ink-soft">लेखक: {author}</span>
          ) : null}
        </div>
        <Link to="/kathayein/$slug" params={{ slug: story.slug }} className="mt-2.5">
          <h3 className="font-display text-xl leading-snug sm:text-[1.35rem]">{story.title}</h3>
        </Link>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">{story.summary}</p>
      </div>
    </article>
  );
}
