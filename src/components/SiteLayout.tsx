import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogIn, LogOut, Bookmark } from "lucide-react";

const nav = [
  { to: "/kathayein", label: "कथाएँ" },
  { to: "/tirthankar", label: "तीर्थंकर" },
  { to: "/darshan", label: "दर्शन" },
  // { to: "/shravan", label: "श्रवण" },
  // { to: "/prashnottari", label: "प्रश्नोत्तरी" },
  // { to: "/pustakalay", label: "पुस्तकालय" },
  // { to: "/bachche", label: "बच्चों की दुनिया" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  return (
    <div className="manuscript min-h-screen pb-32">
      <div className="jali h-1 w-full opacity-50" />

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* Main Top Navigation Row */}
          <div className="flex h-14 sm:h-16 items-center justify-between gap-x-3 lg:gap-x-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-baseline gap-2 shrink-0">
              <span className="font-display text-xl leading-none whitespace-nowrap">
                जैन कहानियां
              </span>
              <span className="eyebrow hidden sm:inline">Vachanalaya</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-x-2.5 xl:gap-x-4 text-xs xl:text-sm text-ink-soft whitespace-nowrap">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "text-vermilion font-medium" }}
                  className="transition-colors hover:text-foreground py-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Action Items: Search, Collection, and Auth */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (q.trim()) {
                    navigate({ to: "/khoj", search: { q: q.trim() } });
                  }
                }}
              >
                <label className="flex items-center gap-1.5 rounded-full border border-input bg-card px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm focus-within:ring-1 focus-within:ring-ring">
                  <span aria-hidden className="text-xs text-ink-soft">
                    ⌕
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="खोजें…"
                    aria-label="खोजें"
                    className="w-16 sm:w-24 md:w-28 lg:w-20 xl:w-32 transition-all duration-200 focus:w-28 sm:focus:w-36 lg:focus:w-32 xl:focus:w-40 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                  />
                </label>
              </form>

              {/* My Collection Link */}
              <Link
                to="/sangrah"
                className="rounded-full bg-primary px-3 py-1.5 sm:px-3.5 text-xs sm:text-sm font-medium text-primary-foreground whitespace-nowrap transition-transform hover:-translate-y-0.5"
              >
                मेरा संग्रह
              </Link>

              {/* Authentication Action / Profile */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-card text-foreground font-display text-xs sm:text-sm font-semibold shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="उपयोगकर्ता मेनू"
                    >
                      {user.name ? user.name[0]?.toUpperCase() : user.email[0]?.toUpperCase()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="font-display text-sm font-medium leading-none text-foreground">
                          {user.name || "प्रिय पाठक"}
                        </p>
                        <p className="text-xs leading-none text-ink-soft truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/sangrah" className="flex items-center">
                        <Bookmark className="mr-2 h-4 w-4 text-ink-soft" />
                        मेरा संग्रह
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      लॉग आउट
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground whitespace-nowrap transition-all hover:bg-muted/60"
                >
                  <LogIn className="h-3.5 w-3.5 text-ink-soft" />
                  <span>लॉग इन</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Secondary Navigation Row */}
          <nav className="lg:hidden flex items-center gap-x-4 overflow-x-auto pb-2.5 pt-1 text-xs sm:text-sm text-ink-soft whitespace-nowrap border-t border-border/40 scrollbar-none">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-vermilion font-medium" }}
                className="transition-colors hover:text-foreground shrink-0 py-0.5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Global Auth Modal */}
      <AuthModal />

      <footer className="mx-auto mt-20 max-w-6xl px-5">
        <div className="jali h-px w-full opacity-40" />
        <div className="flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-ink-soft">
          <p className="font-display text-base text-foreground">जैन कहानियां वाचनालय</p>
          <p>पढ़ें · सुनें · समझें · स्मरण रखें</p>
        </div>
      </footer>
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  latin,
  intro,
}: {
  eyebrow: string;
  title: string;
  latin?: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{title}</h1>
      {latin ? <p className="mt-1 font-mono text-xs text-ink-soft">{latin}</p> : null}
      {intro ? <p className="mt-4 max-w-2xl text-ink-soft">{intro}</p> : null}
    </div>
  );
}
