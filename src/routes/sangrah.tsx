import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteLayout";
import { StoryCard } from "@/components/StoryCard";
import { storyBySlug } from "@/data/content";
import { useAudioHistory, useProgress, useQuizHistory, useRecent, useSaved } from "@/lib/library";
import { usePlayer } from "@/lib/player";

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
  const { saved } = useSaved();
  const { progress } = useProgress();
  const { recent } = useRecent();
  const { history: quizHistory } = useQuizHistory();
  const audioHistory = useAudioHistory();
  const { play } = usePlayer();

  const savedStories = saved.map(storyBySlug).filter((s): s is NonNullable<typeof s> => !!s);
  const recentStories = recent.map(storyBySlug).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <>
      <PageHead
        eyebrow="व्यक्तिगत"
        title="मेरा संग्रह"
        latin="Mera Sangrah"
        intro="आपकी पढ़ाई, सहेजी कथाएँ और अंक — सब एक जगह।"
      />

      <div className="mx-auto max-w-6xl space-y-14 px-5 pb-8">
        <section className="mt-10">
          <h2 className="text-3xl">पढ़ना जारी रखें</h2>
          {progress.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {progress.map((p) => {
                const s = storyBySlug(p.slug);
                if (!s) return null;
                const pct = Math.round((p.chapter / p.chapters) * 100);
                return (
                  <Link
                    key={p.slug}
                    to="/kathayein/$slug"
                    params={{ slug: p.slug }}
                    className="card-leaf flex gap-4 p-4"
                  >
                    <img
                      src={s.cover ?? undefined}
                      alt={s.title}
                      loading="lazy"
                      className="size-24 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl">{s.title}</h3>
                      <p className="text-sm text-ink-soft">
                        अध्याय {p.chapter} · {pct}% पूर्ण
                      </p>
                      <div className="mt-3 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-vermilion"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="mt-2 inline-block text-sm text-vermilion">जारी रखें →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="card-leaf mt-5 p-6 text-ink-soft">
              कोई कथा शुरू नहीं की गई।{" "}
              <Link to="/kathayein" className="text-vermilion">
                कथाएँ देखें →
              </Link>
            </p>
          )}
        </section>

        <section>
          <h2 className="text-3xl">सहेजी कथाएँ</h2>
          {savedStories.length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedStories.map((s) => (
                <StoryCard key={s.slug} story={s} />
              ))}
            </div>
          ) : (
            <p className="card-leaf mt-5 p-6 text-ink-soft">
              अभी कुछ सहेजा नहीं गया। किसी कथा पर सहेजें दबाएँ।
            </p>
          )}
        </section>

        <section>
          <h2 className="text-3xl">हाल में देखा</h2>
          {recentStories.length ? (
            <ul className="card-leaf mt-5 divide-y divide-border">
              {recentStories.map((s) => (
                <li key={s.slug} className="p-4">
                  <Link to="/kathayein/$slug" params={{ slug: s.slug }}>
                    <p className="font-display text-xl">{s.title}</p>
                    <p className="text-sm text-ink-soft">{s.category}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card-leaf mt-5 p-6 text-ink-soft">कोई इतिहास नहीं।</p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl">श्रवण इतिहास</h2>
            {audioHistory.length ? (
              <ul className="card-leaf mt-5 divide-y divide-border">
                {audioHistory.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 p-4">
                    <button onClick={() => play(h)} className="font-display text-lg text-vermilion">
                      ▶ {h.title}
                    </button>
                    <span className="ml-auto font-mono text-xs text-ink-soft">{h.duration}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-leaf mt-5 p-6 text-ink-soft">कुछ नहीं सुना गया।</p>
            )}
          </div>

          <div>
            <h2 className="text-3xl">प्रश्नोत्तरी अंक</h2>
            {quizHistory.length ? (
              <ul className="card-leaf mt-5 divide-y divide-border">
                {quizHistory.map((h) => (
                  <li key={h.at} className="flex items-center justify-between p-4">
                    <span className="text-sm text-ink-soft">
                      {new Date(h.at).toLocaleDateString("hi-IN")}
                    </span>
                    <span className="font-display text-lg">
                      {h.score} / {h.total}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-leaf mt-5 p-6 text-ink-soft">
                कोई प्रयास नहीं।{" "}
                <Link to="/prashnottari" className="text-vermilion">
                  खेलें →
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
