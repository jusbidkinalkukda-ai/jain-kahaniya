import { Link } from "@tanstack/react-router";
import { covers, type Story } from "@/data/content";
import { useWishlist } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { Star } from "lucide-react";

export function StoryCard({ story }: { story: Story }) {
  const { saved, save, isUpdating } = useWishlist(story.apiId);
  const { play, track, playing, toggle: togglePlayer } = usePlayer();
  const cover = story.coverImage || (story.cover ? covers[story.cover] : null);
  const isCurrentPlaying = playing && track?.id === story.slug;

  return (
    <article className="card-leaf group flex flex-col overflow-hidden relative">
      {/* Cover Media Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-accent">
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
              <span className="rounded-full bg-card px-4 py-2 font-display text-lg">
                {story.title}
              </span>
            </span>
          )}
        </Link>

        {/* Views Counter Badge */}
        {typeof story.views === "number" && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-foreground backdrop-blur-sm shadow-xs font-mono pointer-events-none">
            👁 {story.views}
          </span>
        )}

        {/* Favorite / Star Button on Top Right (Enlarged) */}
        <button
          type="button"
          aria-label={saved ? "सहेजी गई सूची" : "सहेजें"}
          disabled={isUpdating}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void save(story.slug);
          }}
          className="absolute top-2.5 right-2.5 z-10 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-md shadow-md transition-all hover:scale-110 active:scale-90 hover:bg-background cursor-pointer"
          title={saved ? "सहेजी गई" : "सहेजें"}
        >
          <Star
            className={`size-5 transition-colors ${
              saved ? "fill-vermilion text-vermilion" : "text-ink-soft hover:text-vermilion"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-vermilion">{story.category}</span>
          {story.author && (
            <span
              className="min-w-0 max-w-[55%] truncate text-[11px] text-ink-soft"
              title={story.author}
            >
              लेखक: {story.author}
            </span>
          )}
        </div>
        <Link to="/kathayein/$slug" params={{ slug: story.slug }} className="mt-1">
          <h3 className="font-display text-2xl leading-snug">{story.title}</h3>
        </Link>
        <p className="mt-2 flex-1 text-sm text-ink-soft line-clamp-3">{story.summary}</p>

        {/* Audio button and bottom bar commented out as requested */}
        {/* <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
          <span>{story.minutes} मिनट पठन</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isCurrentPlaying) {
                  togglePlayer();
                } else {
                  play({
                    id: story.slug,
                    title: story.title,
                    duration: story.audio,
                    subtitle: story.category,
                    text: `${story.title}. ${story.summary}`,
                  });
                }
              }}
              className="text-gold transition-colors hover:text-vermilion cursor-pointer font-medium"
            >
              {isCurrentPlaying ? "❙❙ रोकें" : `▶ ${story.audio}`}
            </button>
          </div>
        </div> */}
      </div>
    </article>
  );
}
