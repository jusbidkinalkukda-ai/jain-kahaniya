import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteLayout";
import { stories, tirthankars } from "@/data/content";
import { useAudioHistory } from "@/lib/library";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/shravan")({
  head: () => ({
    meta: [
      { title: "श्रवण — जैन ऑडियो कथाएँ" },
      {
        name: "description",
        content: "जैन कहानियां और तीर्थंकर परिचय सुनें — चलते-फिरते श्रवण के लिए ऑडियो संग्रह।",
      },
      { property: "og:title", content: "श्रवण — जैन ऑडियो कथाएँ" },
      { property: "og:description", content: "पढ़ने का समय न हो तो सुनें।" },
    ],
  }),
  component: ShravanPage,
});

function ShravanPage() {
  const { play, track, playing, toggle: togglePlayer } = usePlayer();
  const history = useAudioHistory();

  return (
    <>
      <PageHead
        eyebrow="ऑडियो"
        title="श्रवण"
        latin="Shravan"
        intro="कोई भी कथा चुनें — नीचे प्लेयर खुल जाएगा और आप पढ़े बिना सुन सकेंगे।"
      />

      <div className="mx-auto max-w-6xl px-5">
        <section className="mt-10">
          <h2 className="text-2xl">कथा ऑडियो</h2>
          <ul className="card-leaf mt-4 divide-y divide-border">
            {stories.map((s) => {
              const isCurrent = track?.id === s.slug;
              return (
                <li key={s.slug} className="flex items-center gap-4 p-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isCurrent) {
                        togglePlayer();
                      } else {
                        play({
                          id: s.slug,
                          title: s.title,
                          duration: s.audio,
                          subtitle: s.category,
                          text: `${s.title}. ${s.summary}`,
                        });
                      }
                    }}
                    aria-label={`${s.title} सुनें`}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                  >
                    {isCurrent && playing ? "❙❙" : "▶"}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl">{s.title}</p>
                    <p className="text-xs text-ink-soft">{s.category}</p>
                  </div>
                  <span className="font-mono text-xs text-ink-soft">{s.audio}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">तीर्थंकर परिचय</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tirthankars.slice(-6).map((t) => (
                <button
                  key={t.n}
                  onClick={() =>
                    play({ id: `t-${t.n}`, title: `${t.name} परिचय`, duration: "05:20" })
                  }
                  className="card-leaf flex items-center gap-3 p-4 text-left"
                >
                  <span className="font-mono text-xs text-gold">{t.n}</span>
                  <span className="font-display text-lg">{t.name}</span>
                  <span className="ml-auto font-mono text-xs text-ink-soft">05:20</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl">श्रवण इतिहास</h2>
            {history.length ? (
              <ul className="card-leaf mt-4 divide-y divide-border">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 p-4">
                    <button onClick={() => play(h)} className="font-display text-lg text-vermilion">
                      {h.title}
                    </button>
                    <span className="ml-auto font-mono text-xs text-ink-soft">{h.duration}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-leaf mt-4 p-6 text-sm text-ink-soft">
                अभी कुछ नहीं सुना गया। कोई कथा चलाएँ, वह यहाँ दिखेगी।
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
