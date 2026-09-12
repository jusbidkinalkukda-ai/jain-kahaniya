import { createFileRoute, Link } from "@tanstack/react-router";
import { books, concepts, stories, tirthankars } from "@/data/content";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/khoj")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "खोज — जैन कहानियाँ, तीर्थंकर, दर्शन, पुस्तकें" },
      {
        name: "description",
        content: "एक खोज में कथाएँ, तीर्थंकर, दर्शन के विषय, ऑडियो और पुस्तकें — सब एक साथ मिलें।",
      },
      { property: "og:title", content: "खोज — जैन ज्ञान" },
      {
        property: "og:description",
        content: "कथा, तीर्थंकर, दर्शन, ऑडियो और पुस्तकें एक खोज में।",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { play } = usePlayer();
  const term = q.trim().toLowerCase();
  const match = (...fields: string[]) =>
    term.length > 0 && fields.some((f) => f.toLowerCase().includes(term));

  const storyHits = stories.filter((s) => match(s.title, s.summary, s.category));
  const tirthHits = tirthankars.filter((t) => match(t.name, t.latin, t.place, t.teaching));
  const conceptHits = concepts.filter((c) => match(c.title, c.latin, c.oneLine));
  const bookHits = books.filter((b) => match(b.title, b.sub, b.author));
  const total = storyHits.length + tirthHits.length + conceptHits.length + bookHits.length;

  return (
    <div className="mx-auto max-w-4xl px-5 pt-12">
      <p className="eyebrow">खोज</p>
      <h1 className="mt-2 text-5xl">{q ? q : "क्या खोजना है?"}</h1>

      <input
        value={q}
        onChange={(e) => navigate({ to: ".", search: { q: e.target.value }, replace: true })}
        placeholder="महावीर, अहिंसा, नव तत्व…"
        aria-label="खोजें"
        className="mt-6 w-full rounded-full border border-input bg-card px-6 py-3.5 text-lg outline-none focus:border-gold"
      />

      {term.length === 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {["महावीर", "अहिंसा", "चंदनबाला", "नव तत्व", "पार्श्वनाथ"].map((s) => (
            <button
              key={s}
              onClick={() => navigate({ to: ".", search: { q: s } })}
              className="rounded-full border border-input bg-card px-4 py-2 text-sm text-ink-soft"
            >
              {s}
            </button>
          ))}
        </div>
      ) : total === 0 ? (
        <p className="card-leaf mt-8 p-8 text-ink-soft">
          “{q}” के लिए कुछ नहीं मिला। दूसरा शब्द आज़माएँ।
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {storyHits.length ? (
            <section>
              <h2 className="eyebrow text-vermilion">📖 कथाएँ</h2>
              <ul className="card-leaf mt-3 divide-y divide-border">
                {storyHits.map((s) => (
                  <li key={s.slug} className="p-4">
                    <Link to="/kathayein/$slug" params={{ slug: s.slug }}>
                      <p className="font-display text-xl">{s.title}</p>
                      <p className="text-sm text-ink-soft">{s.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tirthHits.length ? (
            <section>
              <h2 className="eyebrow text-vermilion">🌸 तीर्थंकर</h2>
              <ul className="card-leaf mt-3 divide-y divide-border">
                {tirthHits.map((t) => (
                  <li key={t.n} className="p-4">
                    <Link to="/tirthankar/$n" params={{ n: String(t.n) }}>
                      <p className="font-display text-xl">
                        {t.n}वें तीर्थंकर — {t.name}
                      </p>
                      <p className="text-sm text-ink-soft">{t.teaching}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {conceptHits.length ? (
            <section>
              <h2 className="eyebrow text-vermilion">🪷 दर्शन</h2>
              <ul className="card-leaf mt-3 divide-y divide-border">
                {conceptHits.map((c) => (
                  <li key={c.slug} className="p-4">
                    <Link to="/darshan/$slug" params={{ slug: c.slug }}>
                      <p className="font-display text-xl">{c.title}</p>
                      <p className="text-sm text-ink-soft">{c.oneLine}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {storyHits.length ? (
            <section>
              <h2 className="eyebrow text-vermilion">🎧 ऑडियो</h2>
              <ul className="card-leaf mt-3 divide-y divide-border">
                {storyHits.map((s) => (
                  <li key={s.slug} className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => play({ id: s.slug, title: s.title, duration: s.audio })}
                      className="font-display text-xl text-vermilion"
                    >
                      ▶ {s.title}
                    </button>
                    <span className="ml-auto font-mono text-xs text-ink-soft">{s.audio}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {bookHits.length ? (
            <section>
              <h2 className="eyebrow text-vermilion">📚 पुस्तकें</h2>
              <ul className="card-leaf mt-3 divide-y divide-border">
                {bookHits.map((b) => (
                  <li key={b.title} className="p-4">
                    <Link to="/pustakalay">
                      <p className="font-display text-xl">{b.title}</p>
                      <p className="text-sm text-ink-soft">
                        {b.author} · {b.language}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
