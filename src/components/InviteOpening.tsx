"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, CalendarDays, ChevronDown, Church, Clock, Gift, HandHeart, MapPin, RotateCcw, Wine } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";
import styles from "./InviteOpening.module.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
// Smootherstep: gentler acceleration/deceleration at both ends than the
// classic smoothstep, so staged transforms blend into each other instead
// of visibly starting/stopping.
const ease = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);
const phase = (progress: number, start: number, end: number) => ease(clamp((progress - start) / (end - start)));
const OPEN_SHARE = 0.5;
const OPEN_DURATION_MS = 4000;
const mapsLink = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// Each pair has the same SVG commands. Moving their control points lets the
// ribbon straighten and pass through the knot instead of rotating cutouts of
// the bow photograph like rigid pieces.
const bowPaths = {
  leftTail: [
    "M341 314 C311 348 223 438 157 518 Q203 567 267 599 C305 509 359 393 358 348 Z",
    "M333 293 C256 280 118 270 -38 265 Q-41 308 -13 347 C98 348 248 351 342 337 Z",
  ],
  rightTail: [
    "M391 313 C440 365 507 463 573 515 Q527 564 462 598 C422 495 382 402 369 341 Z",
    "M407 293 C484 280 622 270 778 265 Q781 308 753 347 C642 348 492 351 398 337 Z",
  ],
  leftLoop: [
    "M340 279 C278 234 170 146 113 145 C92 202 82 304 82 368 C83 402 147 410 201 402 C260 392 312 354 340 328 Z",
    "M339 301 C331 297 324 295 317 296 C310 302 309 315 312 324 C316 331 323 333 330 328 C335 325 338 324 339 324 Z",
  ],
  rightLoop: [
    "M398 279 C463 231 567 148 624 143 C649 200 658 306 658 368 C656 402 597 410 539 400 C480 389 430 354 398 329 Z",
    "M404 301 C412 297 420 295 426 296 C432 302 433 315 431 324 C428 331 420 333 413 328 C408 325 405 324 404 324 Z",
  ],
  knot: [
    "M341 267 C360 266 382 266 396 268 C402 283 402 320 397 335 C382 341 356 341 341 334 C338 317 338 282 341 267 Z",
    "M331 272 C350 267 389 267 409 272 C422 282 423 321 413 337 C391 345 348 345 329 336 C320 320 321 286 331 272 Z",
    "M296 298 C335 291 400 291 444 298 C449 310 448 326 440 337 C397 341 336 341 300 337 C292 326 291 309 296 298 Z",
  ],
} as const;

function morphPath(from: string, to: string, amount: number) {
  const numbers = to.match(/-?\d+(?:\.\d+)?/g) ?? [];
  let index = 0;
  return from.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const position = Number(value) + (Number(numbers[index++]) - Number(value)) * amount;
    return String(Math.round(position * 10) / 10);
  });
}

type RibbonPoint = { x: number; y: number };
type RibbonParticle = RibbonPoint & { previousX: number; previousY: number };
const RIBBON_POINTS = 13;
const RIBBON_FRAMES = 72;

function curveThrough(points: RibbonPoint[], move: boolean) {
  const first = points[0];
  let path = `${move ? "M" : "L"}${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const before = points[Math.max(0, i - 1)];
    const from = points[i];
    const to = points[i + 1];
    const after = points[Math.min(points.length - 1, i + 2)];
    path += ` C${(from.x + (to.x - before.x) / 6).toFixed(1)} ${(from.y + (to.y - before.y) / 6).toFixed(1)} ${(to.x - (after.x - from.x) / 6).toFixed(1)} ${(to.y - (after.y - from.y) / 6).toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }
  return path;
}

function simulateFallingRibbon() {
  const spacing = 380 / (RIBBON_POINTS - 1);
  const particles: RibbonParticle[] = Array.from({ length: RIBBON_POINTS }, (_, i) => ({
    x: i * spacing, y: 399, previousX: i * spacing, previousY: 399,
  }));
  const frames: RibbonPoint[][] = [particles.map(({ x, y }) => ({ x, y }))];

  for (let frame = 1; frame <= RIBBON_FRAMES; frame++) {
    const seconds = frame / RIBBON_FRAMES;
    const held = (i: number) => (i === 0 && seconds < .19) || (i === RIBBON_POINTS - 1 && seconds < .23);

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      if (held(i)) {
        particle.x = particle.previousX = i * spacing;
        particle.y = particle.previousY = 399;
        continue;
      }
      const velocityX = (particle.x - particle.previousX) * .995;
      const velocityY = (particle.y - particle.previousY) * .995;
      particle.previousX = particle.x;
      particle.previousY = particle.y;
      particle.x += velocityX;
      particle.y += velocityY + 900 / (RIBBON_FRAMES * RIBBON_FRAMES);
    }

    const constrain = (aIndex: number, bIndex: number, length: number, stiffness: number) => {
      const a = particles[aIndex];
      const b = particles[bIndex];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const correction = (distance - length) / distance * stiffness;
      const aWeight = held(aIndex) ? 0 : 1;
      const bWeight = held(bIndex) ? 0 : 1;
      const weight = aWeight + bWeight;
      if (!weight) return;
      a.x += dx * correction * aWeight / weight;
      a.y += dy * correction * aWeight / weight;
      b.x -= dx * correction * bWeight / weight;
      b.y -= dy * correction * bWeight / weight;
    };

    // Fixed spacing keeps the ribbon in one piece; the weaker two-point
    // constraint supplies resistance to sharp folds without making it rigid.
    for (let iteration = 0; iteration < 7; iteration++) {
      for (let i = 0; i < RIBBON_POINTS - 1; i++) constrain(i, i + 1, spacing, 1);
      for (let i = 0; i < RIBBON_POINTS - 2; i++) constrain(i, i + 2, spacing * 2, .12);
    }
    frames.push(particles.map(({ x, y }) => ({ x, y })));
  }
  return frames;
}

const fallingRibbonFrames = simulateFallingRibbon();

function fallingRibbonPath(time: number) {
  const position = time * RIBBON_FRAMES;
  const frame = Math.min(RIBBON_FRAMES - 1, Math.floor(position));
  const blend = position - frame;
  const spine = fallingRibbonFrames[frame].map((point, i) => ({
    x: point.x + (fallingRibbonFrames[frame + 1][i].x - point.x) * blend,
    y: point.y + (fallingRibbonFrames[frame + 1][i].y - point.y) * blend,
  }));
  const top: RibbonPoint[] = [];
  const bottom: RibbonPoint[] = [];

  for (let i = 0; i < spine.length; i++) {
    const before = spine[Math.max(0, i - 1)];
    const after = spine[Math.min(spine.length - 1, i + 1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length * 19;
    const normalY = dx / length * 19;
    top.push({ x: spine[i].x - normalX, y: spine[i].y - normalY });
    bottom.push({ x: spine[i].x + normalX, y: spine[i].y + normalY });
  }

  return `${curveThrough(top, true)} ${curveThrough(bottom.reverse(), false)} Z`;
}

function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path d="M13 128C20 80 45 35 124 12M14 105c24-7 38-21 44-42M39 58c25 2 44-9 56-28M69 35c9 10 23 13 38 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 105C6 94 7 78 10 70c14 7 17 23 8 35ZM30 84C19 71 21 56 25 49c12 10 15 23 5 35ZM51 59c-4-16 3-28 10-33 7 14 4 27-10 33ZM77 39c1-15 12-24 21-26 2 16-7 25-21 26ZM46 85c10-12 24-13 34-10-8 14-23 18-34 10ZM82 45c14-8 28-5 35 1-12 11-26 11-35-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M16 119c-8-5-11-15-9-21 10 4 13 13 9 21ZM101 28c6-10 17-15 27-13-4 11-16 17-27 13Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function BotanicalSprig({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 190" fill="none" aria-hidden="true">
      <path d="M77 6C64 47 55 100 49 184" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M72 28c12-13 27-15 36-11-6 14-22 20-36 11ZM68 44c-13-9-27-7-34-1 9 11 24 12 34 1ZM64 66c13-14 29-16 39-12-7 15-24 22-39 12ZM60 84c-14-9-29-7-36 0 9 12 26 13 36 0ZM56 108c14-14 30-16 40-12-7 15-25 22-40 12ZM53 128c-14-9-29-7-36 0 10 12 26 13 36 0ZM50 152c13-13 28-15 38-11-7 14-24 21-38 11Z" fill="currentColor" fillOpacity=".14" />
      </g>
    </svg>
  );
}

function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 26" fill="none" aria-hidden="true">
      <path d="M4 17c22 0 33-10 47-10 9 0 13 5 20 5M216 17c-22 0-33-10-47-10-9 0-13 5-20 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M26 17c8 5 17 4 22-2M194 17c-8 5-17 4-22-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M110 5c3-4 10-3 10 3 0 5-7 9-10 12-3-3-10-7-10-12 0-6 7-7 10-3Z" fill="currentColor" />
    </svg>
  );
}

function ChurchMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 92" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60 4v14M54 10h12" />
        <path d="M60 18 44 38v48h32V38L60 18Z" />
        <path d="M44 44 26 60v26h18M76 44l18 16v26H76" />
        <path d="M60 86V66c-5 0-8 3-8 8v12h16V74c0-5-3-8-8-8Z" />
        <path d="M60 40c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7ZM34 70h6M80 70h6" />
      </g>
    </svg>
  );
}

function PaperGrain() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="envelope-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="9" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer><feFuncA type="linear" slope="0.1" /></feComponentTransfer>
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
    </svg>
  );
}

function SatinBow({ progress }: { progress: number }) {
  const vectorBlend = phase(progress, .02, .08);
  const pull = phase(progress, .06, .25);
  const unthread = phase(progress, .11, .32);
  const loosen = phase(progress, .23, .36);
  const release = phase(progress, .32, .41);
  const bowFade = phase(progress, .41, .45);
  const photoTexture = 1 - phase(progress, .09, .20);
  const loopFade = phase(progress, .29, .38);

  // Both free ends move outward together, drawing their loops back through
  // the knot. The untied bow disappears before the band starts falling.
  const leftTailPath = morphPath(bowPaths.leftTail[0], bowPaths.leftTail[1], pull);
  const rightTailPath = morphPath(bowPaths.rightTail[0], bowPaths.rightTail[1], pull);
  const leftLoopPath = morphPath(bowPaths.leftLoop[0], bowPaths.leftLoop[1], unthread);
  const rightLoopPath = morphPath(bowPaths.rightLoop[0], bowPaths.rightLoop[1], unthread);
  const knotPath = loosen < 1
    ? morphPath(bowPaths.knot[0], bowPaths.knot[1], loosen)
    : morphPath(bowPaths.knot[1], bowPaths.knot[2], release);

  // The intact band drops on its own after the bow has disappeared, and is
  // gone from frame before the doors start to part.
  const bandFallTime = clamp((progress - .40) / .13);
  const bandPath = fallingRibbonPath(bandFallTime);
  const bandFade = phase(progress, .49, .55);

  return (
    <div className={styles.ribbon} aria-hidden="true">
      <svg className={styles.band} viewBox="0 0 380 570" preserveAspectRatio="none" style={{ opacity: 1 - bandFade }}>
        <defs>
          <linearGradient id="band-satin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5c1e33" /><stop offset=".25" stopColor="#a64b61" /><stop offset=".55" stopColor="#873047" /><stop offset="1" stopColor="#4e192d" />
          </linearGradient>
          <linearGradient id="band-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f5c9cf" stopOpacity=".45" /><stop offset=".23" stopColor="#fff" stopOpacity="0" /><stop offset=".43" stopColor="#f5c9cf" stopOpacity=".5" /><stop offset=".67" stopColor="#fff" stopOpacity="0" /><stop offset=".81" stopColor="#f5c9cf" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="bow-marsala-photo" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.72 0 0 0 -0.10  0.35 0 0 0 -0.13  0.42 0 0 0 -0.13  0 0 0 1 0" />
          </filter>
        </defs>
        <path d={bandPath} fill="url(#band-satin)" />
        <path d={bandPath} fill="url(#band-sheen)" opacity=".4" />
      </svg>
      <div className={styles.bowShadow} style={{ opacity: 1 - bowFade }} />
      <div className={styles.bowWrap}>
        <div className={styles.bowMotion} style={{ opacity: 1 - bowFade }}>
          <Image src="/laco.png" alt="" width={740} height={740} priority className={styles.bow} style={{ opacity: 1 - vectorBlend }} />
          <svg className={styles.bowVector} viewBox="0 0 740 740" aria-hidden="true" style={{ opacity: vectorBlend }}>
            <defs>
              <linearGradient id="bow-tail-satin" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#581b30" /><stop offset=".19" stopColor="#ad5265" /><stop offset=".52" stopColor="#873047" /><stop offset=".82" stopColor="#651e35" /><stop offset="1" stopColor="#9b4259" />
              </linearGradient>
              <linearGradient id="bow-loop-satin" x1="0" y1="0" x2=".25" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#6c2239" /><stop offset=".18" stopColor="#ad4f64" /><stop offset=".55" stopColor="#873047" /><stop offset=".78" stopColor="#5d1b31" /><stop offset="1" stopColor="#9b4259" />
              </linearGradient>
              <linearGradient id="bow-knot-satin" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#9c4056" /><stop offset=".42" stopColor="#76263e" /><stop offset=".72" stopColor="#953950" /><stop offset="1" stopColor="#521a2e" />
              </linearGradient>
              <pattern id="bow-photo" patternUnits="userSpaceOnUse" width="740" height="740">
                <image href="/laco.png" width="740" height="740" />
              </pattern>
            </defs>
            <path d={leftTailPath} fill="url(#bow-tail-satin)" />
            <path d={rightTailPath} fill="url(#bow-tail-satin)" />
            <path d={leftLoopPath} fill="url(#bow-loop-satin)" opacity={1 - loopFade} />
            <path d={rightLoopPath} fill="url(#bow-loop-satin)" opacity={1 - loopFade} />
            <path d={knotPath} fill="url(#bow-knot-satin)" />
            <g fill="url(#bow-photo)" filter="url(#bow-marsala-photo)" opacity={photoTexture}>
              <path d={leftTailPath} />
              <path d={rightTailPath} />
              <path d={leftLoopPath} opacity={1 - loopFade} />
              <path d={rightLoopPath} opacity={1 - loopFade} />
              <path d={knotPath} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function CoverArtwork() {
  return (
    <>
      <div className={styles.envelopeTexture} />
      <div className={styles.coverFrame} />
      <FloralCorner className={`${styles.coverFloral} ${styles.coverTopLeft}`} />
      <FloralCorner className={`${styles.coverFloral} ${styles.coverTopRight}`} />
      <FloralCorner className={`${styles.coverFloral} ${styles.coverBottomLeft}`} />
      <FloralCorner className={`${styles.coverFloral} ${styles.coverBottomRight}`} />
      <div className={styles.monogram}>
        <span className={styles.monogramLetter}>G</span>
        <span className={styles.monogramLetter}>F</span>
      </div>
      <p className={styles.openHint}>TOQUE PARA ABRIR</p>
    </>
  );
}

export default function InviteOpening() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const targetScrollRef = useRef(0);
  const smoothedScrollRef = useRef(0);

  useEffect(() => {
    const updateTarget = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const distance = Math.max(1, scene.offsetHeight - window.innerHeight);
      targetScrollRef.current = clamp(-scene.getBoundingClientRect().top / distance);
    };
    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    // Trail the raw scroll position instead of snapping to it 1:1, so the
    // opening sequence keeps gliding smoothly even when the scroll input
    // itself is jumpy (mouse wheel steps, trackpad micro-stutters).
    let frame = 0;
    const settle = () => {
      const current = smoothedScrollRef.current;
      const target = targetScrollRef.current;
      const diff = target - current;
      if (Math.abs(diff) > 0.0004) {
        const next = current + diff * 0.13;
        smoothedScrollRef.current = next;
        setScrollProgress(next);
      } else if (current !== target) {
        smoothedScrollRef.current = target;
        setScrollProgress(target);
      }
      frame = requestAnimationFrame(settle);
    };
    frame = requestAnimationFrame(settle);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let start: number | undefined;
    const animate = (now: number) => {
      start ??= now;
      const next = clamp((now - start) / OPEN_DURATION_MS);
      setPlayProgress(next);
      if (next < 1) {
        frame = requestAnimationFrame(animate);
        return;
      }
      setPlaying(false);
      // Jump the page to where scrolling would have opened the card, so the
      // next scroll continues straight into the details instead of idling.
      const scene = sceneRef.current;
      if (scene && targetScrollRef.current < OPEN_SHARE) {
        const distance = Math.max(1, scene.offsetHeight - window.innerHeight);
        const top = window.scrollY + scene.getBoundingClientRect().top + distance * OPEN_SHARE;
        window.scrollTo({ top, behavior: "instant" });
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  // The first stretch of scroll opens the card; the rest reads through it.
  const scrollOpen = clamp(scrollProgress / OPEN_SHARE);
  const progress = reducedMotion ? (playProgress > 0 || scrollOpen > .06 ? 1 : 0) : Math.max(scrollOpen, playProgress);
  const reveal = phase(progress, .46, .87);
  // After turning edge-on, each door shows its reverse side and slips behind the card.
  const foldBack = phase(reveal, .48, 1);
  const tuck = phase(reveal, .68, 1);
  // The camera drifts back while the doors swing, so the card reads as a
  // physical object, then settles forward again as the details take the frame.
  const dolly = phase(progress, .40, .70) - phase(progress, .80, 1);
  const rise = phase(progress, .63, .97);
  const ink = phase(progress, .67, .93);
  const revealed = progress >= .99;
  const read = reducedMotion ? 0 : clamp((scrollProgress - OPEN_SHARE) / (1 - OPEN_SHARE));

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const viewport = scroller?.parentElement;
    if (!scroller || !viewport) return;
    const measure = () => setOverflow(Math.max(0, scroller.scrollHeight - viewport.clientHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function replay() {
    setPlaying(false);
    setPlayProgress(0);
    const scene = sceneRef.current;
    if (scene) window.scrollTo({ top: window.scrollY + scene.getBoundingClientRect().top, behavior: "instant" });
  }

  return (
    <div ref={sceneRef} className={`${styles.scene} ${reducedMotion ? styles.reducedScene : ""}`}>
      <div className={styles.stage}>
        <div className={styles.backdrop} style={{ opacity: dolly }} aria-hidden="true" />
        <div
          className={styles.camera}
          style={{ transform: `translate3d(0,${dolly * -1.4}%,0) rotateX(${dolly * 6}deg) scale(${1 - dolly * .26})` }}
        >
        <div className={styles.card} style={{ boxShadow: `0 ${dolly * 52}px ${dolly * 80}px -${dolly * 24}px rgba(74, 47, 33, ${dolly * .42})` }}>
          <article className={styles.invitation} aria-hidden={!revealed}>
            <div
              ref={scrollerRef}
              className={styles.invitationScroll}
              style={{ "--photo-grow": `${(1 - rise) * 62}cqh`, transform: `translate3d(0,${-read * overflow}px,0)` } as CSSProperties}
            >
              <div className={styles.photo}><Image src="/foto-convite.jpg" alt="Germana e Flávio se beijando" fill priority sizes="100vw" className={styles.photoImage} /></div>
              <div className={styles.invitationBody} style={{ transform: `translate3d(0,${(1 - rise) * 16}cqh,0)`, opacity: ink }}>
                <div className={styles.invitationArch} />
                <BotanicalSprig className={`${styles.bodyLeaf} ${styles.bodyLeafLeft}`} />
                <BotanicalSprig className={`${styles.bodyLeaf} ${styles.bodyLeafRight}`} />
                <Flourish className={styles.flourish} />
                <p className={styles.verse}>“Eu encontrei aquele a quem meu coração ama”</p>
                <p className={styles.verseSource}>— Cânticos 3:4 —</p>
                <div className={styles.namesRow}>
                  <h1 className={styles.names}>{WEDDING.noivos.ela}<span>&amp;</span>{WEDDING.noivos.ele}</h1>
                  <BotanicalSprig className={styles.namesSprig} />
                </div>
                <p className={styles.inviteLine}>Convidam para celebrar o seu casamento</p>
                <div className={styles.facts}>
                  <div><span className={styles.factBadge}><CalendarDays strokeWidth={1.4} /></span><strong>01 de novembro<br />de 2026</strong></div>
                  <div><span className={styles.factBadge}><Clock strokeWidth={1.4} /></span><strong>Às {WEDDING.horario}</strong></div>
                  <div><span className={styles.factBadge}><MapPin strokeWidth={1.4} /></span><strong>Sagrado Coração<br />de Jesus<br />Mossoró, RN</strong></div>
                </div>
                <p className={styles.closingLine}>Sua presença tornará este dia ainda mais especial!</p>
                <ChurchMark className={styles.churchMark} />
              </div>

              <section className={styles.family} aria-label="Pais dos noivos">
                <HandHeart className={styles.familyIcon} strokeWidth={1.3} aria-hidden="true" />
                <h2 className={styles.familyIntro}>Sob as bênçãos de Deus e de seus pais</h2>
                <div className={styles.familyColumns}>
                  <div className={styles.familySide}>
                    <p>Edinair Guimarães Lima Rebouças</p>
                    <p>Hermano José Rebouças</p>
                  </div>
                  <span className={styles.familyPlus} aria-hidden="true">+</span>
                  <div className={styles.familySide}>
                    <p>Maria do Carmo Adour Vasconcelos</p>
                    <p>Flávio Roberto Gonçalves Vasconcelos</p>
                  </div>
                </div>
              </section>

              <section className={styles.detail}>
                <Church className={styles.detailIcon} strokeWidth={1.4} />
                <p className={styles.detailEyebrow}>Cerimônia</p>
                <h2 className={styles.detailTitle}>{WEDDING.cerimonia.nome}</h2>
                <p className={styles.detailMeta}>Às {WEDDING.horario}</p>
                <p className={styles.detailText}>{WEDDING.cerimonia.endereco}</p>
                <a className={styles.detailLink} href={mapsLink(WEDDING.cerimonia.mapsQuery)} target="_blank" rel="noopener noreferrer" tabIndex={revealed ? 0 : -1}><MapPin className={styles.detailLinkIcon} strokeWidth={1.6} />Ver no mapa</a>
              </section>

              <section className={styles.detail}>
                <Wine className={styles.detailIcon} strokeWidth={1.4} />
                <p className={styles.detailEyebrow}>RECEPÇÃO</p>
                <h2 className={styles.detailTitle}>{WEDDING.recepcao.nome}</h2>
                <p className={styles.detailMeta}>Logo após a cerimônia</p>
                <p className={styles.detailText}>{WEDDING.recepcao.endereco}</p>
                <a className={styles.detailLink} href={mapsLink(WEDDING.recepcao.mapsQuery)} target="_blank" rel="noopener noreferrer" tabIndex={revealed ? 0 : -1}><MapPin className={styles.detailLinkIcon} strokeWidth={1.6} />Ver no mapa</a>
              </section>

              <section className={styles.detail}>
                <p className={styles.detailEyebrow}>Traje &amp; paleta</p>
                <h2 className={styles.detailTitle}>Um pedido carinhoso</h2>
                <p className={`${styles.detailText} ${styles.detailTextJustified}`}>
                  Para harmonizar com a proposta da nossa celebração, o marsala será a cor escolhida para os padrinhos.
                  Se possível, pedimos que considerem outras tonalidades, evitando cores muito próximas, como os tons de vermelho
                  e suas variações.
                </p>
                <p className={`${styles.detailText} ${styles.detailTextJustified}`}>
                  Agradecemos pela compreensão e por fazerem parte desse momento tão especial!
                </p>
              </section>

              <section className={styles.detail}>
                <CalendarCheck className={styles.detailIcon} strokeWidth={1.4} />
                <p className={styles.detailEyebrow}>Confirmação de presença</p>
                <h2 className={styles.detailTitle}>Contamos com você</h2>
                <p className={styles.detailText}>
                  Para prepararmos tudo com carinho, pedimos a gentileza de confirmar
                  sua presença.
                </p>
                <div className={styles.detailActions}>
                  <Link href="/confirmar-presenca" className={`${styles.detailButton} ${styles.detailButtonSolid}`} tabIndex={revealed ? 0 : -1}>
                    <CalendarCheck strokeWidth={1.6} />
                    Confirmar presença
                  </Link>
                </div>
              </section>

              <section className={styles.detail}>
                <Gift className={styles.detailIcon} strokeWidth={1.4} />
                <p className={styles.detailEyebrow}>Lista de presentes</p>
                <p className={styles.detailText}>
                  Sua presença já é o nosso maior presente. Mas, se desejar nos
                  presentear, preparamos uma lista muito especial.
                </p>
                <div className={styles.detailActions}>
                  <Link href="/#presentes" className={`${styles.detailButton} ${styles.detailButtonSolid}`} tabIndex={revealed ? 0 : -1}>
                    <Gift strokeWidth={1.6} />
                    Ver lista de presentes
                  </Link>
                </div>
              </section>

              <section className={`${styles.detail} ${styles.detailClosing}`}>
                <div className={styles.ornament}><span />♥<span /></div>
                <p className={styles.closingNames}>{WEDDING.noivos.ela} &amp; {WEDDING.noivos.ele}</p>
                <p className={styles.detailMeta}>Esperamos por você</p>
              </section>
            </div>
          </article>

          <div className={styles.cover} aria-hidden={revealed} style={{ visibility: reveal === 1 ? "hidden" : "visible", pointerEvents: revealed ? "none" : "auto" }}>
            <PaperGrain />
            {(["left", "right"] as const).map((side) => (
              <div
                key={side}
                className={`${styles.coverPanel} ${side === "left" ? styles.coverPanelLeft : styles.coverPanelRight}`}
                aria-hidden="true"
                style={{
                  transform: `translate3d(${side === "left" ? tuck * 100 : -tuck * 100}%,0,${-foldBack * 220}px) rotateY(${side === "left" ? -reveal * 178 : reveal * 178}deg)`,
                }}
              >
                <div className={`${styles.coverFace} ${styles.coverFaceFront}`}>
                  <div className={`${styles.coverArtwork} ${side === "right" ? styles.coverArtworkRight : ""}`}>
                    <CoverArtwork />
                  </div>
                </div>
                <div className={`${styles.coverFace} ${styles.coverFaceBack}`} />
              </div>
            ))}
            <SatinBow progress={progress} />
            <button type="button" className={styles.openButton} onClick={() => reducedMotion ? setPlayProgress(1) : setPlaying(true)} disabled={playing || progress > .05} aria-label="Abrir o convite de Germana e Flávio" />
          </div>
        </div>
        </div>
        {(!revealed || read >= .97 || reducedMotion) && (
          <div className={styles.stageAction}>
            {!revealed ? (
              <div className={styles.scrollHint} style={{ opacity: 1 - phase(progress, .03, .2) }}><span>Toque no laço ou deslize para abrir</span><ChevronDown size={18} /></div>
            ) : (
              <div className={styles.revealedActions}><button type="button" onClick={replay}><RotateCcw size={14} /> Ver novamente</button><Link href="/">Ir para o site</Link></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
