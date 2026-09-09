import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { concepts, storyBySlug, tirthankars } from "@/data/content";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/tirthankar/$n")({
  loader: ({ params }) => {
    const t = tirthankars.find((x) => x.n === Number(params.n));
    if (!t) throw notFound();
    return { t };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "तीर्थंकर नहीं मिले" }, { name: "robots", content: "noindex" }],
      };
    }
    const { t } = loaderData;
    const description = `${t.n}वें तीर्थंकर ${t.name} — परिचय, जीवन कथा, प्रतीक ${t.symbol} और उपदेश।`;
    return {
      meta: [
        { title: `${t.name} — ${t.n}वें तीर्थंकर` },
        { name: "description", content: description },
        { property: "og:title", content: `${t.name} — ${t.n}वें तीर्थंकर` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TirthankarPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">यह तीर्थंकर पृष्ठ नहीं मिला</h1>
      <Link to="/tirthankar" className="mt-6 inline-block text-vermilion">
        तीर्थंकर पथ →
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">पृष्ठ लोड नहीं हो सका</h1>
    </div>
  ),
});

function TirthankarPage() {
  const { t } = Route.useLoaderData();
  const { play } = usePlayer();
  const prev = tirthankars.find((x) => x.n === t.n - 1);
  const next = tirthankars.find((x) => x.n === t.n + 1);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <Link to="/tirthankar" className="eyebrow">
        ← तीर्थंकर पथ
      </Link>
      <h1 className="mt-3 text-5xl">{t.name}</h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">
        {t.latin} · {t.n} / 24
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="card-leaf p-6 sm:p-8 lg:col-span-8">
          <p className="text-lg text-ink-soft">{t.intro}</p>
          <h2 className="mt-6 text-2xl">जीवन कथा</h2>
          <p className="mt-2 text-lg leading-relaxed">{t.life}</p>
          <h2 className="mt-8 text-2xl">उपदेश</h2>
          <p className="mt-2 font-display text-2xl leading-snug text-vermilion">“{t.teaching}”</p>
          <button
            onClick={() => play({ id: `t-${t.n}`, title: `${t.name} परिचय`, duration: "05:20" })}
            className="mt-6 rounded-full bg-gold px-4 py-2 text-sm text-gold-foreground"
          >
            ▶ सुनें · 05:20
          </button>
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <div className="card-leaf p-5">
            <p className="eyebrow">प्रतीक</p>
            <p className="mt-1 font-display text-2xl">{t.symbol}</p>
            <p className="eyebrow mt-4">जन्मस्थान</p>
            <p className="mt-1 font-display text-2xl">{t.place}</p>
          </div>

          {t.related.length ? (
            <div className="card-leaf p-5">
              <p className="eyebrow">संबंधित कथाएँ</p>
              <ul className="mt-2 space-y-2">
                {t.related.map((slug) => {
                  const s = storyBySlug(slug);
                  if (!s) return null;
                  return (
                    <li key={slug}>
                      <Link
                        to="/kathayein/$slug"
                        params={{ slug }}
                        className="font-display text-lg text-vermilion"
                      >
                        {s.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="card-leaf p-5">
            <p className="eyebrow">संबंधित दर्शन</p>
            <ul className="mt-2 space-y-2">
              {concepts.slice(0, 3).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/darshan/$slug"
                    params={{ slug: c.slug }}
                    className="font-display text-lg"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex items-center justify-between text-sm">
        {prev ? (
          <Link to="/tirthankar/$n" params={{ n: String(prev.n) }} className="text-ink-soft">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/tirthankar/$n" params={{ n: String(next.n) }} className="text-vermilion">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
