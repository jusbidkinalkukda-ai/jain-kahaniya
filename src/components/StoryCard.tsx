import { Link } from "@tanstack/react-router";
import { covers, type Story } from "@/data/content";
import { useSaved } from "@/lib/library";
import { usePlayer } from "@/lib/player";

export function StoryCard({ story }: { story: Story }) {
  const { isSaved, toggle } = useSaved();
  const { play, track, playing, toggle: togglePlayer } = usePlayer();
  const cover = story.coverImage || (story.cover ? covers[story.cover] : null);
  const isCurrentPlaying = playing && track?.id === story.slug;

  return (
    <article className="card-leaf group flex flex-col overflow-hidden">
      <Link
        to="/kathayein/$slug"
        params={{ slug: story.slug }}
        className="block aspect-[4/3] overflow-hidden bg-accent relative"
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
        {typeof story.views === "number" && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-foreground backdrop-blur-sm shadow-xs font-mono">
            👁 {story.views}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-vermilion">{story.category}</span>
          {story.author && <span className="text-[11px] text-ink-soft">लेखक: {story.author}</span>}
        </div>
        <Link to="/kathayein/$slug" params={{ slug: story.slug }} className="mt-1">
          <h3 className="font-display text-2xl leading-snug">{story.title}</h3>
        </Link>
        <p className="mt-2 flex-1 text-sm text-ink-soft line-clamp-3">{story.summary}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
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
            <button
              aria-label="सहेजें"
              onClick={() => toggle(story.slug)}
              className={
                isSaved(story.slug)
                  ? "text-vermilion"
                  : "text-ink-soft transition-colors hover:text-vermilion"
              }
            >
              {isSaved(story.slug) ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
