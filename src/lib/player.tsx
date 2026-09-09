import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Track = {
  id: string;
  title: string;
  duration: string;
  subtitle?: string | undefined;
  text?: string | undefined;
  audioUrl?: string | undefined;
};

type PlayerState = {
  track: Track | null;
  playing: boolean;
  seconds: number;
  total: number;
  play: (track: Track) => void;
  toggle: () => void;
  close: () => void;
  seek: (fraction: number) => void;
};

const toSeconds = (d: string) => {
  const parts = d.split(":").map((n) => parseInt(n, 10) || 0);
  const m = parts[0] ?? 0;
  const s = parts[1] ?? 0;
  return m * 60 + s;
};

export const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const total = track ? toSeconds(track.duration) : 0;
  const timer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Timer ticker for duration tracking
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setSeconds((s) => (total && s >= total ? total : s + 1));
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, total]);

  useEffect(() => {
    if (total && seconds >= total) {
      setPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    }
  }, [seconds, total]);

  // Audio / Speech synthesis handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle HTMLAudioElement if audioUrl is provided
    if (track?.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      if (audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
      }
      if (playing) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return;
    }

    // Handle SpeechSynthesis if narration text is available
    if ("speechSynthesis" in window) {
      if (playing && track?.text) {
        try {
          window.speechSynthesis.cancel();
          const textToRead = track.text.slice(0, 3000);
          const u = new SpeechSynthesisUtterance(textToRead);
          utteranceRef.current = u;

          const voices = window.speechSynthesis.getVoices();
          const hiVoice = voices.find(
            (v) =>
              v.lang.startsWith("hi") ||
              v.lang.includes("Hindi") ||
              v.name.toLowerCase().includes("hindi"),
          );
          if (hiVoice) {
            u.voice = hiVoice;
          }
          u.rate = 0.95;
          u.onend = () => {
            setPlaying(false);
          };
          u.onerror = () => {
            /* ignore or let timer run */
          };
          window.speechSynthesis.speak(u);
        } catch {
          // fallback to timer
        }
      } else if (!playing) {
        try {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
          }
        } catch {
          // ignore
        }
      }
    }
  }, [track, playing]);

  const play = useCallback((next: Track) => {
    setTrack((cur) => {
      if (cur?.id === next.id) {
        return cur;
      }
      setSeconds(0);
      return next;
    });
    setPlaying(true);

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis.paused
    ) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    try {
      const raw = localStorage.getItem("jkv:audio-history");
      const list: Track[] = raw ? JSON.parse(raw) : [];
      const dedup = [next, ...list.filter((t) => t.id !== next.id)].slice(0, 12);
      localStorage.setItem("jkv:audio-history", JSON.stringify(dedup));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          if (next) {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } else {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
            }
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const close = useCallback(() => {
    setPlaying(false);
    setTrack(null);
    setSeconds(0);
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const seek = useCallback(
    (fraction: number) => {
      const sec = Math.round(Math.max(0, Math.min(1, fraction)) * total);
      setSeconds(sec);
      if (audioRef.current && total > 0) {
        audioRef.current.currentTime = sec;
      }
    },
    [total],
  );

  const value = useMemo<PlayerState>(
    () => ({
      track,
      playing,
      seconds,
      total,
      play,
      toggle,
      close,
      seek,
    }),
    [track, playing, seconds, total, play, toggle, close, seek],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
