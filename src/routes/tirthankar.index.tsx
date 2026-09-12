import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteLayout";
import { tirthankars } from "@/data/content";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/tirthankar/")({
  head: () => ({
    meta: [
      { title: "चौबीस तीर्थंकर — जैन कहानियाँ वाचनालय" },
      {
        name: "description",
        content:
          "ऋषभदेव से महावीर स्वामी तक — चौबीस तीर्थंकरों का परिचय, प्रतीक, जन्मस्थान और उपदेश।",
      },
      { property: "og:title", content: "चौबीस तीर्थंकर" },
      {
        property: "og:description",
        content: "तीर्थंकर पथ — परिचय, प्रतीक और उपदेश एक क्रम में।",
      },
    ],
  }),
  component: TirthankarPath,
});

function TirthankarPath() {
  const [active, setActive] = useState(tirthankars.length - 1);
  const t = tirthankars[active]!;
  const { play } = usePlayer();

  return (
    <>
      <PageHead
        eyebrow="तीर्थंकर पथ"
        title="चौबीस तीर्थंकर"
        latin="Chaubis Tirthankar"
        intro="पथ पर किसी भी क्रमांक को चुनें — परिचय, प्रतीक और उपदेश साथ बदलते हैं।"
      />

      <div className="mx-auto max-w-6xl px-5">
        {/* the path */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-3">
          {tirthankars.map((item, i) => (
            <button
              key={item.n}
              onClick={() => setActive(i)}
              className={
                i === active
                  ? "flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
                  : "flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-input bg-card px-4 py-3 text-ink-soft transition-colors hover:border-gold"
              }
            >
              <span className="font-mono text-xs">{item.n}</span>
              <span className="font-display text-sm whitespace-nowrap">{item.name}</span>
            </button>
          ))}
        </div>

        <div className="card-leaf mt-6 grid gap-8 p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow text-vermilion">{t.n}वें तीर्थंकर</span>
            <h2 className="mt-1 text-4xl">{t.name}</h2>
            <p className="mt-1 font-mono text-xs text-ink-soft">{t.latin}</p>
            <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
            <h3 className="mt-6 text-xl">जीवन कथा</h3>
            <p className="mt-2 leading-relaxed">{t.life}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  play({ id: `t-${t.n}`, title: `${t.name} परिचय`, duration: "05:20" })
                }
                className="rounded-full bg-gold px-4 py-2 text-sm text-gold-foreground"
              >
                ▶ परिचय सुनें · 05:20
              </button>
              <Link
                to="/tirthankar/$n"
                params={{ n: String(t.n) }}
                className="rounded-full border border-input px-4 py-2 text-sm"
              >
                पूर्ण पृष्ठ खोलें →
              </Link>
            </div>
          </div>

          <dl className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl bg-accent p-4">
              <dt className="eyebrow">प्रतीक</dt>
              <dd className="mt-1 font-display text-2xl">{t.symbol}</dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="eyebrow">जन्मस्थान</dt>
              <dd className="mt-1 font-display text-2xl">{t.place}</dd>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <dt className="eyebrow">उपदेश</dt>
              <dd className="mt-1 font-display text-xl leading-snug">{t.teaching}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
