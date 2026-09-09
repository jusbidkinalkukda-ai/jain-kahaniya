import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteLayout";
import { books } from "@/data/content";

export const Route = createFileRoute("/pustakalay")({
  head: () => ({
    meta: [
      { title: "जैन पुस्तकालय — ग्रंथ और पुस्तकें" },
      {
        name: "description",
        content:
          "जैन पुस्तकें भाषा, लेखक, श्रेणी और आयु के अनुसार खोजें — तत्त्वार्थ सूत्र से बाल कथाओं तक।",
      },
      { property: "og:title", content: "जैन पुस्तकालय" },
      { property: "og:description", content: "जैन ग्रंथ और पुस्तकें एक स्थान पर।" },
    ],
  }),
  component: LibraryPage,
});

const ALL = "सभी";

function LibraryPage() {
  const [language, setLanguage] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [age, setAge] = useState(ALL);

  const filters = [
    {
      label: "भाषा",
      value: language,
      set: setLanguage,
      options: [ALL, ...new Set(books.map((b) => b.language))],
    },
    {
      label: "श्रेणी",
      value: category,
      set: setCategory,
      options: [ALL, ...new Set(books.map((b) => b.category))],
    },
    {
      label: "आयु",
      value: age,
      set: setAge,
      options: [ALL, ...new Set(books.map((b) => b.age))],
    },
  ];

  const list = books.filter(
    (b) =>
      (language === ALL || b.language === language) &&
      (category === ALL || b.category === category) &&
      (age === ALL || b.age === age),
  );

  return (
    <>
      <PageHead
        eyebrow="पुस्तकालय"
        title="जैन पुस्तकें"
        latin="Jain Pustakalay"
        intro="भाषा, श्रेणी और आयु के अनुसार छाँटें।"
      />

      <div className="mx-auto max-w-6xl px-5">
        <div className="mt-8 flex flex-wrap gap-6">
          {filters.map((f) => (
            <div key={f.label}>
              <p className="eyebrow">{f.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {f.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => f.set(opt)}
                    className={
                      opt === f.value
                        ? "rounded-full bg-primary px-3.5 py-1.5 text-xs text-primary-foreground"
                        : "rounded-full border border-input bg-card px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:text-foreground"
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((b) => (
            <article key={b.title} className="card-leaf flex flex-col overflow-hidden">
              <div className="jali flex aspect-[3/4] items-end bg-accent bg-blend-soft-light p-4">
                <div className="rounded-xl bg-card p-3">
                  <h3 className="font-display text-xl leading-snug">{b.title}</h3>
                  <p className="text-xs text-ink-soft">{b.sub}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm">{b.author}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {b.language} · {b.category} · {b.pages} पृष्ठ
                </p>
                <button className="mt-4 rounded-full bg-vermilion px-4 py-2 text-sm text-vermilion-foreground">
                  पढ़ें
                </button>
              </div>
            </article>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="card-leaf mt-10 p-8 text-center text-ink-soft">
            इन विकल्पों में कोई पुस्तक नहीं मिली।
          </p>
        ) : null}
      </div>
    </>
  );
}
