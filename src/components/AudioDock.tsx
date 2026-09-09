import { fmt, usePlayer } from "@/lib/player";
import { Play, Pause, X, Volume2 } from "lucide-react";

export function AudioDock() {
  const { track, playing, seconds, total, toggle, close, seek } = usePlayer();
  if (!track) return null;
  const pct = total ? (seconds / total) * 100 : 0;

  return (
    <aside
      aria-label="ऑडियो प्लेयर"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-border/80 bg-night/95 backdrop-blur-md px-3 py-2.5 text-night-foreground shadow-2xl transition-all sm:gap-4 sm:px-5 sm:py-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
          aria-label={playing ? "रोकें" : "चलाएँ"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-lg text-gold-foreground transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
        >
          {playing ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Track Details & Seekbar */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`shrink-0 flex items-center justify-center ${
                  playing ? "text-gold animate-pulse" : "text-muted-foreground"
                }`}
              >
                <Volume2 className="h-4 w-4" />
              </span>
              <p className="truncate font-display text-base font-medium text-night-foreground">
                {track.title}
              </p>
              {track.subtitle && (
                <span className="hidden sm:inline-block rounded-full bg-night-foreground/10 px-2 py-0.5 text-[10px] text-night-foreground/80 font-mono">
                  {track.subtitle}
                </span>
              )}
            </div>
            <span className="shrink-0 font-mono text-[11px] opacity-80">
              {fmt(seconds)} / {track.duration}
            </span>
          </div>

          <button
            type="button"
            aria-label="आगे-पीछे जाएँ"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              if (rect.width > 0) {
                seek((e.clientX - rect.left) / rect.width);
              }
            }}
            className="group mt-2 relative block h-2 w-full overflow-hidden rounded-full bg-night-foreground/20 cursor-pointer"
          >
            <span
              className="block h-full rounded-full bg-gold transition-all group-hover:brightness-110"
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
          aria-label="प्लेयर बंद करें"
          className="shrink-0 grid size-8 place-items-center rounded-full hover:bg-white/10 text-night-foreground/70 hover:text-night-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
