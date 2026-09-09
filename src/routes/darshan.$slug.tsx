import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { conceptBySlug, concepts } from "@/data/content";

export const Route = createFileRoute("/darshan/$slug")({
  loader: ({ params }) => {
    const concept = conceptBySlug(params.slug);
    if (!concept) throw notFound();
    return { concept };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "विषय नहीं मिला" }, { name: "robots", content: "noindex" }],
      };
    }
    const { concept } = loaderData;
    return {
      meta: [
        { title: `${concept.title} — जैन दर्शन` },
        { name: "description", content: concept.oneLine },
        { property: "og:title", content: `${concept.title} — जैन दर्शन` },
        { property: "og:description", content: concept.oneLine },
      ],
    };
  },
  component: ConceptPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">यह विषय नहीं मिला</h1>
      <Link to="/darshan" className="mt-6 inline-block text-vermilion">
        जैन दर्शन →
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl">पृष्ठ लोड नहीं हो सका</h1>
    </div>
  ),
});

function ConceptPage() {
  const { concept } = Route.useLoaderData();
  const others = concepts.filter((c) => c.slug !== concept.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-5 pt-12">
      <Link to="/darshan" className="eyebrow">
        ← जैन दर्शन
      </Link>
      <h1 className="mt-3 text-5xl">{concept.title}</h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">{concept.latin}</p>
      <p className="mt-5 text-xl leading-relaxed text-ink-soft">{concept.oneLine}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {concept.points.map((p) => (
          <div key={p.label} className="card-leaf p-5">
            <span className="eyebrow text-vermilion">{p.label}</span>
            <p className="mt-2 text-lg leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>

      {concept.flow ? (
        <div className="card-leaf mt-8 p-6">
          <p className="eyebrow">क्रम</p>
          <ol className="mt-4">
            {concept.flow.map((f, i) => (
              <li key={f.name}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl">{f.name}</span>
                  <span className="ml-auto text-xs text-ink-soft">{f.meaning}</span>
                </div>
                {i < concept.flow!.length - 1 ? (
                  <span className="ml-[9px] block h-4 w-px bg-border" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl">आगे पढ़ें</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {others.map((c) => (
            <Link
              key={c.slug}
              to="/darshan/$slug"
              params={{ slug: c.slug }}
              className="card-leaf p-4"
            >
              <h3 className="font-display text-xl">{c.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.oneLine}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
