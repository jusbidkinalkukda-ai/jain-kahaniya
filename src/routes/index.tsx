import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero.jpg";
import { StoryCard } from "@/components/StoryCard";
import { concepts, storyBySlug, tirthankars } from "@/data/content";
import { apiBlogToStory, blogService } from "@/lib/blog-service";
import { useProgress } from "@/lib/library";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "जैन कहानियाँ वाचनालय — पढ़ें, सुनें, समझें" },
      {
        name: "description",
        content:
          "जैन कहानियाँ, चौबीस तीर्थंकर, जैन दर्शन, ऑडियो कथाएँ, प्रश्नोत्तरी और पुस्तकालय — एक ही स्थान पर।",
      },
      { property: "og:title", content: "जैन कहानियाँ वाचनालय" },
      {
        property: "og:description",
        content: "जैन ज्ञान पढ़ें, सुनें और समझें — एक आधुनिक वाचनालय।",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { progress } = useProgress();
  const { play } = usePlayer();
  const current = progress[0];
  const currentStory = current ? storyBySlug(current.slug) : undefined;
  const navTatva = concepts.find((c) => c.slug === "nav-tatva");

  const {
    data: featuredBlogs,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useQuery({
    queryKey: ["public-blogs", "home-featured"],
    queryFn: () => blogService.getBlogs({ page: 1, limit: 3 }),
    staleTime: 1000 * 60 * 2,
  });

  const featured = (featuredBlogs?.data ?? []).map(apiBlogToStory);

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-12 lg:grid-cols-2 lg:pt-16">
        <div>
          <p className="eyebrow">पढ़ें · सुनें · समझें</p>
          <h1 className="mt-3 text-5xl leading-[1.1] sm:text-6xl">
            जैन कहानियाँ
            <br />
            <span className="text-vermilion">वाचनालय</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            कथाएँ, चौबीस तीर्थंकर, दर्शन और ऑडियो — बिखरा हुआ जैन ज्ञान एक शांत, आधुनिक वाचनालय में।
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/kathayein"
              className="rounded-full bg-vermilion px-6 py-3 text-sm text-vermilion-foreground transition-transform hover:-translate-y-0.5"
            >
              कथाएँ पढ़ें →
            </Link>
            <button
              onClick={() =>
                play({
                  id: "bhagwan-mahavir-charitra",
                  title: "भगवान महावीर चरित्र",
                  duration: "15:32",
                })
              }
              className="flex items-center gap-3 rounded-full border border-input bg-card px-5 py-2.5 text-left"
            >
              <span className="grid size-8 place-items-center rounded-full bg-gold text-gold-foreground">
                ▶
              </span>
              <span className="leading-tight">
                <span className="block text-sm">महावीर चरित्र सुनें</span>
                <span className="block text-xs text-ink-soft">15:32 · ऑडियो</span>
              </span>
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border shadow-[0_40px_80px_-48px_oklch(0.26_0.03_60/0.6)]">
          <img
            src={heroImg}
            alt="जैन पांडुलिपि शैली में ध्यानस्थ तीर्थंकर"
            width={1600}
            height={1008}
            className="size-full object-cover"
          />
        </div>
      </section>

      {/* Continue reading */}
      {currentStory && current ? (
        <section className="mt-16">
          <p className="eyebrow">जारी रखें</p>
          <div className="card-leaf mt-3 flex flex-wrap items-center gap-6 p-6">
            <div className="min-w-56 flex-1">
              <h2 className="font-display text-3xl">{currentStory.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">
                अध्याय {current.chapter + 1} / {current.chapters} ·{" "}
                {Math.round(((current.chapter + 1) / current.chapters) * 100)}% पूर्ण
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-gold"
                  style={{
                    width: `${((current.chapter + 1) / current.chapters) * 100}%`,
                  }}
                />
              </div>
            </div>
            <Link
              to="/kathayein/$slug"
              params={{ slug: currentStory.slug }}
              className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              जारी रखें →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Featured stories */}
      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">चयनित</p>
            <h2 className="mt-1 text-3xl">कथाएँ जो स्मरण रह जाती हैं</h2>
          </div>
          <Link to="/kathayein" className="text-sm text-vermilion">
            सभी कथाएँ →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {featuredLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="card-leaf h-80 animate-pulse bg-muted/50" />
            ))
          ) : featuredError ? (
            <p className="card-leaf p-6 text-ink-soft md:col-span-3">
              कथाएँ लोड नहीं हो सकीं। कृपया बाद में प्रयास करें।
            </p>
          ) : featured.length ? (
            featured.map((s) => <StoryCard key={s.apiId || s.slug} story={s} />)
          ) : (
            <p className="card-leaf p-6 text-ink-soft md:col-span-3">अभी कोई कथा उपलब्ध नहीं है।</p>
          )}
        </div>
      </section>

      {/* Tirthankar + nav tatva */}
      <section className="mt-16 grid gap-6 lg:grid-cols-12">
        <div className="card-leaf p-6 lg:col-span-7">
          <p className="eyebrow">चौबीस तीर्थंकर</p>
          <h2 className="mt-1 text-3xl">तीर्थंकर पथ</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {tirthankars.map((t) => (
              <Link
                key={t.n}
                to="/tirthankar/$n"
                params={{ n: String(t.n) }}
                className="rounded-full border border-input px-3 py-1.5 text-xs transition-colors hover:border-gold hover:text-vermilion"
              >
                <span className="font-mono text-ink-soft">{t.n}</span> {t.name}
              </Link>
            ))}
          </div>
          <Link to="/tirthankar" className="mt-5 inline-block text-sm text-vermilion">
            पूरा पथ देखें →
          </Link>
        </div>

        <div className="card-leaf p-6 lg:col-span-5">
          <p className="eyebrow">जैन दर्शन</p>
          <h2 className="mt-1 text-3xl">नव तत्व</h2>
          <ol className="mt-5 space-y-0">
            {navTatva?.flow?.map((f, i) => (
              <li key={f.name}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl">{f.name}</span>
                  <span className="ml-auto text-xs text-ink-soft">{f.meaning}</span>
                </div>
                {i < (navTatva.flow?.length ?? 0) - 1 ? (
                  <span className="ml-[9px] block h-3 w-px bg-border" />
                ) : null}
              </li>
            ))}
          </ol>
          <Link to="/darshan" className="mt-5 inline-block text-sm text-vermilion">
            दर्शन के विषय →
          </Link>
        </div>
      </section>

      {/* Explore strip (Temporarily commented out) */}
      {/* <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/shravan", title: "श्रवण", text: "कथाएँ सुनें, चलते-फिरते।" },
          { to: "/prashnottari", title: "प्रश्नोत्तरी", text: "खेल-खेल में परखें।" },
          { to: "/bachche", title: "बच्चों की दुनिया", text: "सरल कथाएँ और खेल।" },
          { to: "/pustakalay", title: "पुस्तकालय", text: "जैन ग्रंथ और पुस्तकें।" },
        ].map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="card-leaf p-5 transition-transform hover:-translate-y-1"
          >
            <h3 className="font-display text-2xl">{c.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{c.text}</p>
          </Link>
        ))}
      </section> */}
    </div>
  );
}
