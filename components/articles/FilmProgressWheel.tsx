'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

// ── Geometry ─────────────────────────────────────────────────────────────────
const SIZE        = 76;
const CENTER      = SIZE / 2;           // 38
const PROGRESS_R  = 33;                 // progress arc radius
const PROGRESS_W  = 2.5;
const PROGRESS_C  = 2 * Math.PI * PROGRESS_R;
const BEZEL_R     = 26;                 // centre of the metallic ring stroke
const BEZEL_W     = 11;                 // stroke width → outer 31.5, inner 20.5
const INNER_R     = 16;                 // solid centre disc
const NUM_TICKS   = 24;
const NUM_SPROCK  = 6;

// Brand accent — warm linen/film tone (#E0D5D0)
const ACCENT = '#E0D5D0';

// Rewind SVG path (original viewBox 0 0 28 28, two stacked upward triangles)
const REWIND_PATH =
  'M23.1421 12.3648C23.9871 13.4298 23.2281 14.9988 21.8691 14.9988H17.2991' +
  'L23.1401 22.3638C23.9851 23.4298 23.2261 24.9998 21.8671 24.9998H6.12812' +
  'C4.76912 24.9998 4.01112 23.4298 4.85512 22.3658L10.6951 14.9998H6.13012' +
  'C4.77112 14.9998 4.01212 13.4298 4.85712 12.3658L12.4971 2.72876' +
  'C12.6766 2.50243 12.9049 2.31959 13.165 2.1939C13.4251 2.06821 13.7103 2.00293' +
  ' 13.9991 2.00293C14.288 2.00293 14.5731 2.06821 14.8332 2.1939' +
  'C15.0933 2.31959 15.3216 2.50243 15.5011 2.72876L23.1421 12.3648Z';

// Icon: scale 28→17px, centred
const ICON_PX     = 17;
const ICON_SCALE  = ICON_PX / 28;
const ICON_OFF    = CENTER - ICON_PX / 2;   // 38 - 8.5 = 29.5

// Pre-compute static tick mark geometry
const TICK_OUTER = BEZEL_R + BEZEL_W / 2 - 1;   // ~31
const ticks = Array.from({ length: NUM_TICKS }, (_, i) => {
  const angle   = (i / NUM_TICKS) * 2 * Math.PI - Math.PI / 2;
  const isMajor = i % 4 === 0;
  const inner   = TICK_OUTER - (isMajor ? 5.5 : 2.5);
  return {
    x1: CENTER + TICK_OUTER * Math.cos(angle),
    y1: CENTER + TICK_OUTER * Math.sin(angle),
    x2: CENTER + inner      * Math.cos(angle),
    y2: CENTER + inner      * Math.sin(angle),
    isMajor,
  };
});

const sprockets = Array.from({ length: NUM_SPROCK }, (_, i) => {
  const a = (i / NUM_SPROCK) * 2 * Math.PI;
  return { cx: CENTER + BEZEL_R * Math.cos(a), cy: CENTER + BEZEL_R * Math.sin(a) };
});

// ─────────────────────────────────────────────────────────────────────────────

interface FilmProgressWheelProps { targetId?: string }

export default function FilmProgressWheel({ targetId }: FilmProgressWheelProps) {
  const rafRef      = useRef<number>(0);
  const buttonRef   = useRef<HTMLButtonElement>(null);
  const bezelRef    = useRef<SVGGElement>(null);
  const arcRef      = useRef<SVGCircleElement>(null);
  const pctRef      = useRef<SVGTextElement>(null);
  const visibleRef  = useRef(false);
  const rotSetter   = useRef<((v: number) => void) | null>(null);

  const computeProgress = useCallback((): number => {
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        const { top, height } = el.getBoundingClientRect();
        const scrollable = height - window.innerHeight;
        if (scrollable <= 0) return top <= 0 ? 1 : 0;
        return Math.min(1, Math.max(0, -top / scrollable));
      }
    }
    const s = document.documentElement.scrollHeight - window.innerHeight;
    return s > 0 ? Math.min(1, Math.max(0, window.scrollY / s)) : 0;
  }, [targetId]);

  // Init GSAP quick setter for bezel rotation
  useEffect(() => {
    const bezel = bezelRef.current;
    if (!bezel) return;
    // svgOrigin keeps rotation anchored to the SVG coordinate centre
    gsap.set(bezel, { svgOrigin: `${CENTER} ${CENTER}` });
    rotSetter.current = gsap.quickSetter(bezel, 'rotation', 'deg') as (v: number) => void;
  }, []);

  // Scroll handler — all DOM updates skip React state for max fps
  useEffect(() => {
    const btn = buttonRef.current;
    const arc = arcRef.current;
    if (!btn || !arc) return;

    const update = () => {
      const p           = computeProgress();
      const wasVisible  = visibleRef.current;
      const isVisible   = p > 0.015;

      // Direct DOM: progress arc dashOffset
      arc.style.strokeDashoffset = String(PROGRESS_C * (1 - p));

      // Direct DOM: percentage label
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}`;

      // Bezel spin (2 full rotations over full article)
      if (rotSetter.current) rotSetter.current(p * 720);

      if (!wasVisible && isVisible) {
        visibleRef.current = true;
        btn.style.pointerEvents = 'auto';
        gsap.killTweensOf(btn);
        gsap.fromTo(btn,
          { opacity: 0, scale: 0.45, y: 22 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2.2)' },
        );
      } else if (wasVisible && !isVisible) {
        visibleRef.current = false;
        btn.style.pointerEvents = 'none';
        gsap.killTweensOf(btn);
        gsap.to(btn, { opacity: 0, scale: 0.5, y: 20, duration: 0.28, ease: 'power2.in' });
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        update();
      });
    };

    // Set initial hidden state via GSAP so it owns the transform
    gsap.set(btn, { opacity: 0, scale: 0.5, y: 20 });
    btn.style.pointerEvents = 'none';
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [computeProgress]);

  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1.12, duration: 0.22, ease: 'power2.out' });
    // Pause bezel spin on hover — gentle slowdown illusion via a slight extra nudge
    if (bezelRef.current) {
      gsap.to(bezelRef.current, { rotation: '+=8', duration: 0.3, ease: 'power1.out' });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' });
  }, []);

  const handleClick = useCallback(() => {
    const btn   = buttonRef.current;
    const bezel = bezelRef.current;
    if (!btn) return;

    // Press burst then elastic return
    gsap.timeline()
      .to(btn,   { scale: 0.84, duration: 0.1,  ease: 'power3.in' })
      .to(btn,   { scale: 1.08, duration: 0.28, ease: 'power2.out' })
      .to(btn,   { scale: 1,    duration: 0.5,  ease: 'elastic.out(1.2, 0.35)' });

    // Spin-up the bezel for a snappy rewind feel
    if (bezel) {
      const currentRot = gsap.getProperty(bezel, 'rotation') as number;
      gsap.to(bezel, {
        rotation: currentRot + 480,
        duration: 0.75,
        ease: 'power3.inOut',
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Back to top"
      className="hidden lg:flex items-center justify-center fixed bottom-8 right-6 z-30 rounded-full cursor-pointer select-none focus-visible:outline-none"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        className="block overflow-visible"
      >
        <defs>
          {/* Drop shadow */}
          <filter id="fpw-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.5" floodColor="#000" />
          </filter>

          {/* Metallic bezel gradient — dark chrome */}
          <radialGradient id="fpw-metal" cx="32%" cy="22%" r="72%">
            <stop offset="0%"   stopColor="#909090" />
            <stop offset="28%"  stopColor="#505050" />
            <stop offset="60%"  stopColor="#242424" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>

          {/* Subtle highlight sweep across the top of the bezel */}
          <linearGradient id="fpw-glint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="45%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>

          {/* Inner disc glint */}
          <radialGradient id="fpw-inner-glint" cx="40%" cy="28%" r="62%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* ── Outer shadow base disc ── */}
        <circle
          cx={CENTER} cy={CENTER} r={CENTER - 1}
          className="fill-background"
          filter="url(#fpw-shadow)"
        />

        {/* ── Progress track (dim full ring) ── */}
        <circle
          cx={CENTER} cy={CENTER} r={PROGRESS_R}
          fill="none"
          strokeWidth={PROGRESS_W}
          stroke="rgba(128,128,128,0.18)"
        />

        {/* ── Progress arc — brand accent, clockwise from 12 o'clock ── */}
        <circle
          ref={arcRef}
          cx={CENTER} cy={CENTER} r={PROGRESS_R}
          fill="none"
          strokeWidth={PROGRESS_W}
          strokeLinecap="round"
          strokeDasharray={PROGRESS_C}
          strokeDashoffset={PROGRESS_C}
          stroke={ACCENT}
          style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transform: 'rotate(-90deg)',
          }}
        />

        {/* ══ SPINNING METALLIC BEZEL GROUP ══ */}
        <g ref={bezelRef}>

          {/* Bezel ring body */}
          <circle
            cx={CENTER} cy={CENTER} r={BEZEL_R}
            fill="none"
            strokeWidth={BEZEL_W}
            stroke="url(#fpw-metal)"
          />

          {/* Glint sweep on top of metal */}
          <circle
            cx={CENTER} cy={CENTER} r={BEZEL_R}
            fill="none"
            strokeWidth={BEZEL_W}
            stroke="url(#fpw-glint)"
            style={{ pointerEvents: 'none' }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              strokeWidth={t.isMajor ? 1.6 : 0.7}
              stroke={t.isMajor
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.16)'}
              strokeLinecap="round"
            />
          ))}

          {/* Sprocket punch-holes */}
          {sprockets.map((s, i) => (
            <circle
              key={i}
              cx={s.cx} cy={s.cy} r={2.6}
              fill="#040404"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={0.5}
            />
          ))}
        </g>

        {/* ── Centre disc — mode-responsive background ── */}
        <circle
          cx={CENTER} cy={CENTER} r={INNER_R}
          className="fill-background"
          stroke="rgba(128,128,128,0.22)"
          strokeWidth={0.5}
        />
        {/* Subtle glint on centre disc */}
        <circle
          cx={CENTER} cy={CENTER} r={INNER_R}
          fill="url(#fpw-inner-glint)"
          style={{ pointerEvents: 'none' }}
        />

        {/* ── Rewind icon ── */}
        <g
          transform={`translate(${ICON_OFF},${ICON_OFF}) scale(${ICON_SCALE})`}
          className="fill-foreground"
          style={{ pointerEvents: 'none' }}
        >
          <path d={REWIND_PATH} />
        </g>

        {/* ── Percentage readout (tiny, below icon) ── */}
        <text
          ref={pctRef}
          x={CENTER}
          y={CENTER + INNER_R - 3.5}
          textAnchor="middle"
          fontSize="5"
          fontFamily="monospace"
          letterSpacing="0.5"
          className="fill-foreground/35 select-none"
          style={{ pointerEvents: 'none' }}
        >
          0
        </text>
      </svg>
    </button>
  );
}
