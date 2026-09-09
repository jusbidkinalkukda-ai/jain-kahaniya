import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteLayout";
import { concepts } from "@/data/content";

export const Route = createFileRoute("/darshan/")({
  head: () => ({
    meta: [
      { title: "जैन दर्शन — अहिंसा, अनेकांतवाद, नव तत्व" },
      {
        name: "description",
        content:
          "अहिंसा, अनेकांतवाद, अपरिग्रह, कर्म सिद्धांत, नव तत्व और मोक्ष — जैन दर्शन सरल दृश्य रूप में।",
      },
      { property: "og:title", content: "जैन दर्शन" },
      { property: "og:description", content: "जैन विचारों को सरल, दृश्य रूप में समझें।" },
    ],
  }),
  component: DarshanIndex,
});

function DarshanIndex() {
  const navTatva = concepts.find((c) => c.slug === "nav-tatva");

  return (
    <>
      <PageHead
        eyebrow="जैन दर्शन"
        title="विचार, सरल रूप में"
        latin="Jain Darshan"
        intro="लंबे पाठ के स्थान पर छोटे बिंदु, क्रम और प्रवाह — जिससे विषय याद रह जाए।"
      />

      <div className="mx-auto max-w-6xl px-5">
        {navTatva?.flow ? (
          <section className="card-leaf mt-10 p-6 sm:p-8">
            <p className="eyebrow">प्रवाह</p>
            <h2 className="mt-1 text-3xl">नव तत्व</h2>
            <p className="mt-2 text-ink-soft">{navTatva.oneLine}</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-9">
              {navTatva.flow.map((f, i) => (
                <li key={f.name} className="rounded-2xl bg-accent p-4 text-center">
                  <span className="font-mono text-xs text-vermilion">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-display text-xl">{f.name}</span>
                  <span className="mt-1 block text-xs text-ink-soft">{f.meaning}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {concepts.map((c) => (
            <Link
              key={c.slug}
              to="/darshan/$slug"
              params={{ slug: c.slug }}
              className="card-leaf p-6 transition-transform hover:-translate-y-1"
            >
              <span className="eyebrow">{c.latin}</span>
              <h3 className="mt-1 font-display text-2xl">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{c.oneLine}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
