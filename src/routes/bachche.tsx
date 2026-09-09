import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import kidsImg from "@/assets/kids.jpg";
import { kidsQuiz, kidsStories } from "@/data/content";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/bachche")({
  head: () => ({
    meta: [
      { title: "बच्चों की जैन दुनिया — सरल कथाएँ और खेल" },
      {
        name: "description",
        content:
          "बच्चों के लिए सरल जैन कहानियां, चित्र कथाएँ, कॉमिक, ऑडियो और मज़ेदार प्रश्नोत्तरी।",
      },
      { property: "og:title", content: "बच्चों की जैन दुनिया" },
      { property: "og:description", content: "सरल कथाएँ, चित्र और खेल — बच्चों के लिए।" },
    ],
  }),
  component: KidsPage,
});

function KidsPage() {
  const { play } = usePlayer();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = kidsQuiz[qi]!;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-vermilion">बच्चों के लिए</p>
          <h1 className="mt-3 text-5xl leading-tight">बच्चों की जैन दुनिया</h1>
          <p className="mt-4 text-lg text-ink-soft">
            छोटी-छोटी कहानियाँ, चित्र कथाएँ, कॉमिक और खेल — सीखना मज़ेदार बन जाए।
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl border-4 border-gold">
          <img
            src={kidsImg}
            alt="बच्चे कथा सुनते हुए"
            loading="lazy"
            width={1024}
            height={768}
            className="w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl">कहानियाँ</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kidsStories.map((s) => (
            <article
              key={s.title}
              className="rounded-3xl border-2 border-gold bg-card p-5 transition-transform hover:-translate-y-1"
            >
              <span aria-hidden className="text-4xl">
                {s.emoji}
              </span>
              <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {s.kind} · {s.minutes} मिनट
              </p>
              <button
                onClick={() => play({ id: s.title, title: s.title, duration: `0${s.minutes}:00` })}
                className="mt-4 rounded-full bg-gold px-4 py-2 text-sm text-gold-foreground"
              >
                ▶ सुनो
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-gold bg-card p-6">
          <h2 className="text-3xl">मज़ेदार सवाल</h2>
          <p className="mt-4 font-display text-2xl">{q.q}</p>
          <ul className="mt-4 space-y-2">
            {q.options.map((opt, i) => (
              <li key={opt}>
                <button
                  onClick={() => setPicked(i)}
                  className={
                    picked === null
                      ? "w-full rounded-2xl border border-input px-4 py-3 text-left text-lg"
                      : i === q.answer
                        ? "w-full rounded-2xl border border-leaf bg-accent px-4 py-3 text-left text-lg"
                        : i === picked
                          ? "w-full rounded-2xl border border-destructive px-4 py-3 text-left text-lg text-destructive"
                          : "w-full rounded-2xl border border-input px-4 py-3 text-left text-lg opacity-60"
                  }
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          {picked !== null ? (
            <div className="mt-4 rounded-2xl bg-muted p-4">
              <p className="font-display text-xl">
                {picked === q.answer ? "✓ शाबाश!" : "फिर सोचो!"}
              </p>
              <p className="mt-1 text-ink-soft">{q.explain}</p>
              <button
                onClick={() => {
                  setQi((qi + 1) % kidsQuiz.length);
                  setPicked(null);
                }}
                className="mt-3 rounded-full bg-vermilion px-5 py-2.5 text-sm text-vermilion-foreground"
              >
                अगला सवाल →
              </button>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border-2 border-gold bg-card p-6">
          <h2 className="text-3xl">गतिविधियाँ</h2>
          <ul className="mt-4 space-y-3 text-lg">
            <li className="rounded-2xl bg-accent p-4">🎨 तीर्थंकर के प्रतीक रंगो</li>
            <li className="rounded-2xl bg-muted p-4">🧩 कथा के चित्र क्रम में लगाओ</li>
            <li className="rounded-2xl bg-accent p-4">🌱 आज एक जीव की रक्षा करो</li>
            <li className="rounded-2xl bg-muted p-4">🎵 नवकार मंत्र गाओ</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
