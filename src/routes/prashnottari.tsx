import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteLayout";
import { quiz } from "@/data/content";
import { useQuizHistory } from "@/lib/library";

export const Route = createFileRoute("/prashnottari")({
  head: () => ({
    meta: [
      { title: "प्रश्नोत्तरी — जैन ज्ञान परखें" },
      {
        name: "description",
        content:
          "तीर्थंकर, कथा और दर्शन पर आधारित जैन प्रश्नोत्तरी — तुरंत उत्तर और व्याख्या के साथ।",
      },
      { property: "og:title", content: "जैन प्रश्नोत्तरी" },
      { property: "og:description", content: "खेल-खेल में जैन ज्ञान परखें।" },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { history, add } = useQuizHistory();

  const q = quiz[index]!;
  const correct = picked === q.answer;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index === quiz.length - 1) {
      setDone(true);
      add({ score: score, total: quiz.length, at: Date.now(), set: "सामान्य" });
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  return (
    <>
      <PageHead
        eyebrow="प्रश्नोत्तरी"
        title="अपना ज्ञान परखें"
        latin="Prashnottari"
        intro="प्रत्येक उत्तर के साथ छोटी व्याख्या भी मिलेगी।"
      />

      <div className="mx-auto max-w-3xl px-5">
        {done ? (
          <div className="card-leaf mt-10 p-8 text-center">
            <p className="eyebrow">परिणाम</p>
            <h2 className="mt-2 text-5xl">
              {score} / {quiz.length}
            </h2>
            <p className="mt-3 text-ink-soft">
              {score === quiz.length
                ? "उत्तम! पूरा शुद्ध।"
                : score > quiz.length / 2
                  ? "अच्छा प्रयास — एक बार फिर।"
                  : "कथाएँ पढ़कर पुनः प्रयास करें।"}
            </p>
            <button
              onClick={restart}
              className="mt-6 rounded-full bg-vermilion px-6 py-3 text-sm text-vermilion-foreground"
            >
              फिर से खेलें
            </button>
          </div>
        ) : (
          <div className="card-leaf mt-10 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                प्रश्न {index + 1} / {quiz.length}
              </span>
              <span className="font-mono text-xs text-ink-soft">अंक {score}</span>
            </div>
            <h2 className="mt-4 text-3xl leading-snug">{q.q}</h2>

            <ul className="mt-6 space-y-3">
              {q.options.map((opt, i) => {
                const state =
                  picked === null
                    ? "idle"
                    : i === q.answer
                      ? "right"
                      : i === picked
                        ? "wrong"
                        : "idle";
                return (
                  <li key={opt}>
                    <button
                      onClick={() => choose(i)}
                      className={
                        state === "right"
                          ? "flex w-full items-center gap-3 rounded-2xl border border-leaf bg-accent px-5 py-3.5 text-left"
                          : state === "wrong"
                            ? "flex w-full items-center gap-3 rounded-2xl border border-destructive px-5 py-3.5 text-left text-destructive"
                            : "flex w-full items-center gap-3 rounded-2xl border border-input px-5 py-3.5 text-left transition-colors hover:border-gold"
                      }
                    >
                      <span className="font-mono text-xs text-ink-soft">
                        {String.fromCharCode(2309 + i)}
                      </span>
                      <span className="text-lg">{opt}</span>
                      {state === "right" ? <span className="ml-auto">✓</span> : null}
                      {state === "wrong" ? <span className="ml-auto">✕</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {picked !== null ? (
              <div className="mt-6 rounded-2xl bg-muted p-5">
                <p className="font-display text-xl">
                  {correct ? "✓ सही उत्तर!" : "✕ यह उत्तर ठीक नहीं"}
                </p>
                <p className="mt-1 text-ink-soft">{q.explain}</p>
                <button
                  onClick={next}
                  className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
                >
                  {index === quiz.length - 1 ? "परिणाम देखें →" : "अगला प्रश्न →"}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {history.length ? (
          <section className="mt-10">
            <h2 className="text-2xl">पिछले प्रयास</h2>
            <ul className="card-leaf mt-4 divide-y divide-border">
              {history.map((h) => (
                <li key={h.at} className="flex items-center justify-between p-4 text-sm">
                  <span className="text-ink-soft">
                    {new Date(h.at).toLocaleDateString("hi-IN")}
                  </span>
                  <span className="font-display text-lg">
                    {h.score} / {h.total}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
