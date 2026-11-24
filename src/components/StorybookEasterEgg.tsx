import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, BookOpen, X } from 'lucide-react';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const SECRET_QUOTES = [
  'Every great life has a hidden chapter — you just found ours!',
  'Plot twist: you unlocked BackStory Magic Mode.',
  'Once upon a time, someone pressed the secret keys...',
  'The best stories are the ones nobody expected.',
];

const FORTUNE_TEMPLATES: Array<(firstName: string | null) => string> = [
  (n) =>
    n
      ? `${n}, an unexpected conversation just ahead will become one of your favorite stories to retell.`
      : 'An unexpected conversation just ahead will become one of your favorite stories to retell.',
  (n) =>
    n
      ? `Your brightest chapters are still unwritten, ${n} — a joyful surprise is turning the page toward you.`
      : 'Your brightest chapters are still unwritten — a joyful surprise is turning the page toward you.',
  (n) =>
    n
      ? `${n}, a small moment of kindness you share soon will echo in someone else’s story for years.`
      : 'A small moment of kindness you share soon will echo in someone else’s story for years.',
  (n) =>
    n
      ? `A new adventure is quietly lining up for you, ${n} — say yes when the invitation arrives.`
      : 'A new adventure is quietly lining up for you — say yes when the invitation arrives.',
  (n) =>
    n
      ? `${n}, someone who cherishes your memories is thinking of you today with a warm smile.`
      : 'Someone who cherishes your memories is thinking of you today with a warm smile.',
  (n) =>
    n
      ? `The detour you didn’t plan, ${n}, is about to lead to a memory you wouldn’t trade for anything.`
      : 'A detour you didn’t plan is about to lead to a memory you wouldn’t trade for anything.',
  (n) =>
    n
      ? `${n}, laughter around a shared table is coming soon — and it will be a moment worth keeping forever.`
      : 'Laughter around a shared table is coming soon — and it will be a moment worth keeping forever.',
  (n) =>
    n
      ? `An old dream is ready for a fresh chapter, ${n}; the timing is finally on your side.`
      : 'An old dream is ready for a fresh chapter; the timing is finally on your side.',
  (n) =>
    n
      ? `${n}, your curiosity is about to open a door that brings both wonder and lasting friendship.`
      : 'Your curiosity is about to open a door that brings both wonder and lasting friendship.',
  (n) =>
    n
      ? `Years from now, ${n}, you will look back on this season as the turning point where everything clicked.`
      : 'Years from now, you will look back on this season as the turning point where everything clicked.',
  (n) =>
    n
      ? `${n}, a story you almost forgot will soon spark a smile and reconnect you with someone special.`
      : 'A story you almost forgot will soon spark a smile and reconnect you with someone special.',
  (n) =>
    n
      ? `Good fortune favors the storyteller, ${n} — expect warm news and an unforgettable horizon ahead.`
      : 'Good fortune favors the storyteller — expect warm news and an unforgettable horizon ahead.',
];

function getLoggedInFirstName(): string | null {
  try {
    const mbrRaw = sessionStorage.getItem('sb_current_mbr');
    if (mbrRaw) {
      const m = JSON.parse(mbrRaw);
      const rawName = String(
        m?.mbrFirstName || m?.firstName || m?.mbr_first_name || m?.mbrDisplayName || ''
      ).trim();
      if (rawName) return rawName.split(/\s+/)[0];
    }
    const userRaw = sessionStorage.getItem('user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      const rawName = String(
        u?.mbrFirstName || u?.firstName || u?.first_name || u?.name || ''
      ).trim();
      if (rawName && !rawName.includes('@')) return rawName.split(/\s+/)[0];
    }
  } catch {
    // Ignore sessionStorage parse issues
  }
  return null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
  decay: number;
  kind: 'confetti' | 'star' | 'page' | 'spark';
}

const COLORS = ['#FCD34D', '#F59E0B', '#3B82F6', '#60A5FA', '#FB7185', '#34D399', '#FDFCFB'];

function playMagicHarpChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5]; // C5 E5 G5 B5 C6 E6
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.065 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.065 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.6);
    });
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1400);
  } catch {
    // Ignore Web Audio restrictions
  }
}

export const StorybookEasterEgg: React.FC = () => {
  const [active, setActive] = useState(false);
  const [quote, setQuote] = useState(SECRET_QUOTES[0]);
  const [fortune, setFortune] = useState('');
  const lastFortuneIdxRef = useRef<number>(-1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const konamiIdxRef = useRef(0);

  const spawnBurst = useCallback((originX?: number, originY?: number, count = 95) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = originX ?? w * 0.5;
    const cy = originY ?? h * 0.35;
    const next: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 11;
      const r = Math.random();
      const kind: Particle['kind'] =
        r < 0.14 ? 'page' : r < 0.42 ? 'star' : r < 0.85 ? 'confetti' : 'spark';
      next.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (4 + Math.random() * 5),
        size: kind === 'page' ? 14 + Math.random() * 8 : kind === 'star' ? 7 + Math.random() * 7 : 6 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: 0.0055 + Math.random() * 0.006,
        kind,
      });
    }
    particlesRef.current = [...particlesRef.current, ...next].slice(-360);
  }, []);

  const triggerMagic = useCallback(() => {
    setQuote(SECRET_QUOTES[Math.floor(Math.random() * SECRET_QUOTES.length)]);
    let nextIdx = Math.floor(Math.random() * FORTUNE_TEMPLATES.length);
    if (nextIdx === lastFortuneIdxRef.current) {
      nextIdx = (nextIdx + 1) % FORTUNE_TEMPLATES.length;
    }
    lastFortuneIdxRef.current = nextIdx;
    const firstName = getLoggedInFirstName();
    setFortune(FORTUNE_TEMPLATES[nextIdx](firstName));
    setActive(true);
    playMagicHarpChime();

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion) {
      spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.32, 110);
      window.setTimeout(() => {
        spawnBurst(window.innerWidth * 0.25, window.innerHeight * 0.4, 55);
        spawnBurst(window.innerWidth * 0.75, window.innerHeight * 0.4, 55);
      }, 320);
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setActive(false);
    }, 11000);
  }, [spawnBurst]);

  // Listen for Konami code + custom 'storybook-easter-egg' event (triggered by 7x logo tap)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active) {
        setActive(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const expected = KONAMI_SEQUENCE[konamiIdxRef.current];
      const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (pressed === expected) {
        konamiIdxRef.current += 1;
        if (konamiIdxRef.current === KONAMI_SEQUENCE.length) {
          konamiIdxRef.current = 0;
          triggerMagic();
        }
      } else {
        konamiIdxRef.current = pressed === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    const onCustomTrigger = () => triggerMagic();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('storybook-easter-egg', onCustomTrigger);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('storybook-easter-egg', onCustomTrigger);
    };
  }, [active, triggerMagic]);

  // Canvas animation loop + cursor stardust trail while active
  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTrail = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastTrail < 28) return;
      lastTrail = now;
      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -0.8 - Math.random() * 1.8,
        size: 4 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.12,
        color: Math.random() > 0.35 ? '#FCD34D' : '#60A5FA',
        alpha: 0.95,
        decay: 0.025,
        kind: 'star',
      });
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const drawStar = (c: CanvasRenderingContext2D, r: number) => {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        c.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        c.lineTo(Math.cos(a2) * (r * 0.45), Math.sin(a2) * (r * 0.45));
      }
      c.closePath();
      c.fill();
    };

    const drawPage = (c: CanvasRenderingContext2D, s: number) => {
      // Cute fluttering miniature open book page
      c.fillStyle = '#FDFCFB';
      c.strokeStyle = '#D97706';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-s * 0.6, -s * 0.45, s * 1.2, s * 0.9, 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(0, -s * 0.45);
      c.lineTo(0, s * 0.45);
      c.stroke();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive: Particle[] = [];

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.kind === 'page' ? 0.08 : 0.22; // pages flutter softly
        p.vx *= 0.99;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha > 0.02 && p.y < canvas.height + 40) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.kind === 'star') {
            drawStar(ctx, p.size);
          } else if (p.kind === 'page') {
            drawPage(ctx, p.size);
          } else if (p.kind === 'spark') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size * 0.5, -p.size * 0.28, p.size, p.size * 0.56);
          }
          ctx.restore();
          alive.push(p);
        }
      }

      particlesRef.current = alive;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/* Fullscreen golden sparkle & fluttering pages canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[120] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle magical golden edge glow */}
      <div
        className="fixed inset-0 z-[119] pointer-events-none ring-4 ring-inset ring-amber-300/60 shadow-[inset_0_0_60px_rgba(252,211,77,0.35)] transition-opacity"
        aria-hidden="true"
      />

      {/* Whimsical floating Secret Chapter banner */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[121] w-[92vw] max-w-lg">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-2 border-amber-300/80 text-white rounded-2xl px-4 py-4 shadow-2xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/50 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Secret Chapter Unlocked</span>
                </p>
                <p className="text-xs sm:text-sm font-serif text-blue-50 leading-snug mt-0.5">
                  {quote}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActive(false)}
              aria-label="Close secret chapter celebration"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {fortune && (
            <div className="rounded-xl bg-amber-400/12 border border-amber-300/35 px-3.5 py-2.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 mb-1">
                Your Story Fortune
              </p>
              <p className="text-xs sm:text-sm font-serif italic text-amber-50 leading-relaxed">
                &ldquo;{fortune}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
