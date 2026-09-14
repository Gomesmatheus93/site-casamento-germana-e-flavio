"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ChevronDown, RotateCcw } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";

const PAPER = "linear-gradient(125deg, #e5cdd0, #d7b6bd 60%, #c99fa9)";
const FLAP = "polygon(0 0,100% 0,100% 49%,50% 100%,0 49%)";
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const phase = (p: number, start: number, end: number) => {
  const t = clamp((p - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const space: CSSProperties = { transformStyle: "preserve-3d" };

function PaperTexture() {
  return <div className="pointer-events-none absolute inset-0" style={{ filter: "url(#invite-fibers)", opacity: 0.3 }} />;
}

export default function InviteOpening() {
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = wrapperRef.current;
        if (el) setScrollProgress(clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight)));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let start: number | undefined;
    const animate = (now: number) => {
      start ??= now;
      const next = clamp((now - start) / 3400);
      setPlayProgress(next);
      if (next < 1) frame = requestAnimationFrame(animate);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  function openInvite() {
    if (reducedMotion) setPlayProgress(1);
    else setPlaying(true);
  }

  function replay() {
    setPlayProgress(0);
    setScrollProgress(0);
    const el = wrapperRef.current;
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top, behavior: "instant" });
    setPlaying(true);
  }

  const p = reducedMotion ? (playProgress > 0 || scrollProgress > 0.1 ? 1 : 0) : Math.max(scrollProgress, playProgress);
  const seal = phase(p, 0, 0.2);
  const flap = phase(p, 0.15, 0.48);
  const drop = phase(p, 0.48, 0.94);
  const shade = Math.sin(flap * Math.PI);

  return (
    <div ref={wrapperRef} className={reducedMotion ? "relative" : "relative h-[260vh]"}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="invite-fibers" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="14" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.16" /></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </svg>
      <div className={reducedMotion ? "relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-24" : "sticky top-0 flex h-svh items-center justify-center overflow-hidden px-5"}
        style={{ perspective: "1800px", perspectiveOrigin: "50% 42%", background: "radial-gradient(ellipse at 35% 25%, #fffef9, #f1f0e9 65%, #e8e7de)" }}>
        <div className="relative" style={{ ...space, width: "min(100%, 390px, 47svh)", aspectRatio: "2 / 3" }}>
          {/* Card stays still while the envelope slides away in front of it. */}
          <article aria-hidden={p < 0.76} className="absolute inset-[3%] flex flex-col items-center justify-center px-5 text-center"
            style={{ background: "linear-gradient(120deg,#fffef7,#f5f1e5)", transform: "translateZ(4px)", zIndex: 1, boxShadow: "1px 2px 0 #d8d2c2, 0 12px 26px rgba(42,43,31,0.18)", pointerEvents: p > 0.95 ? "auto" : "none" }}>
            <PaperTexture />
            <div className="pointer-events-none absolute inset-3 border border-[#b5a47c]/40" />
            <p className="relative text-[8px] uppercase tracking-[0.25em] text-[#817458]">Com a bênção de Deus e de nossas famílias</p>
            <div className="relative my-5 font-script text-5xl leading-[0.95] text-[#566343]" style={{ textShadow: "0 1px 0 white" }}>
              {WEDDING.noivos.ela}<span className="my-2 block text-2xl text-[#b09b72]">&amp;</span>{WEDDING.noivos.ele}
            </div>
            <p className="relative max-w-52 font-serif-display text-sm italic leading-relaxed text-[#766f5e]">Convidam você para celebrar o seu casamento</p>
            <div className="relative my-5 h-px w-12 bg-[#b5a47c]/60" />
            <p className="relative font-serif-display text-lg text-[#566343]">{WEDDING.dataFormatada}</p>
            <p className="relative mt-1 text-xs text-[#766f5e]">às {WEDDING.horario}</p>
            <p className="relative mt-4 text-xs leading-relaxed text-[#766f5e]">{WEDDING.cerimonia.nome}<br />Mossoró · RN</p>
            <Link href="/#local" tabIndex={p > 0.95 ? 0 : -1} className="tracked-link relative mt-5 !text-[9px] !text-[#566343]">Ver todos os detalhes</Link>
          </article>

          {/* The completed envelope opens first, then descends past the viewport. */}
          <div className="absolute inset-0" style={{ ...space, transform: `translate3d(0,${drop * 220}%,0)`, visibility: drop === 1 ? "hidden" : "visible", zIndex: 2 }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#b1838e,#d4b0b8 35%,#be929d)", transform: "translateZ(-3px)", border: "1px solid #b1838e", boxShadow: "2px 3px 0 #a37682, 5px 9px 14px -6px #63394338, 18px 28px 45px -12px #63394345" }}><PaperTexture /></div>
            {/* Side folds meet under the seal and overlap the lower pocket. */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(95deg,#cba3ad,#e2c6cc)", clipPath: "polygon(0 20%,51% 43%,51% 100%,0 100%)", transform: "translateZ(7px)" }}><PaperTexture /></div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(260deg,#cba3ad,#e2c6cc)", clipPath: "polygon(100% 20%,49% 43%,49% 100%,100% 100%)", transform: "translateZ(7px)" }}><PaperTexture /></div>
            <div className="absolute inset-0" style={{ background: PAPER, clipPath: "polygon(0 100%,0 58%,50% 39%,100% 58%,100% 100%)", transform: "translateZ(9px)" }}>
              <PaperTexture />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 58 L50 39 L100 58" fill="none" stroke="#f4e3e6" strokeWidth="0.35" /><path d="M0 58.4 L50 39.4 L100 58.4" fill="none" stroke="#b18490" strokeWidth="0.18" /></svg>
              <p className="font-script absolute inset-x-0 top-[67%] text-center text-4xl text-[#743f50]" style={{ textShadow: "0 1px 0 #f5e5e8" }}>Você está convidado</p>
              <p className="absolute inset-x-0 bottom-[10%] text-center text-[8px] uppercase tracking-[0.22em] text-[#8c5b6a]">Toque no selo para abrir</p>
            </div>
            <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg,transparent 20%,rgba(82,43,55,${0.12 + shade * 0.24}) 30%,transparent ${48 + flap * 20}%)`, clipPath: "polygon(0 0,100% 0,100% 21%,50% 46%,0 21%)", transform: "translateZ(10px)" }} />

            {/* Hinge is fixed to the top edge; both faces turn around the same crease. */}
            <div className="absolute inset-x-0 top-0 h-[43%]" style={{ ...space, transformOrigin: "50% 0", transform: `translateZ(12px) rotateX(${flap * 174}deg)`, zIndex: flap < 0.5 ? 5 : 0 }}>
              <div className="absolute inset-0" style={{ background: PAPER, clipPath: FLAP, backfaceVisibility: "hidden", transform: "translateZ(0.6px)" }}>
                <PaperTexture />
                <div className="absolute inset-0" style={{ background: `linear-gradient(150deg,rgba(255,255,255,0.25),rgba(91,48,62,${0.06 + shade * 0.25}))` }} />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 49 L50 99.5 L100 49" fill="none" stroke="#ad7d8a" strokeWidth="0.6" /><path d="M0 48 L50 98.5 L100 48" fill="none" stroke="#f2dfe4" strokeWidth="0.35" /></svg>
              </div>
              <div className="absolute inset-0" style={{ background: "linear-gradient(140deg,#d0aab4,#e7d0d5)", clipPath: FLAP, backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(0.6px)" }}>
                <PaperTexture /><div className="absolute inset-0" style={{ background: "#59313e", opacity: shade * 0.2 }} />
              </div>
            </div>

            {/* Wax breaks away before the hinge begins to turn. */}
            <button type="button" onClick={openInvite} disabled={p > 0.05 || playing} aria-label="Abrir convite de casamento" className="absolute left-1/2 top-[43%] h-20 w-20 rounded-full focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#566343]"
              style={{ ...space, transform: `translate(-50%,-50%) translate3d(${seal * 32}px,${-seal * 24}px,${16 + seal * 95}px) rotateY(${seal * -28}deg) rotateZ(${seal * 12}deg)`, opacity: 1 - phase(p, 0.12, 0.25), visibility: seal === 1 ? "hidden" : "visible", zIndex: 6, cursor: "pointer", boxShadow: `4px ${5 + seal * 10}px ${6 + seal * 15}px rgba(62,35,29,${0.3 * (1 - seal)})` }}>
              <div className="absolute inset-0" style={{ borderRadius: "47% 53% 49% 51% / 52% 46% 54% 48%", background: "radial-gradient(ellipse at 28% 20%,#f6a393,#de746b 38%,#be514f 72%,#913b40)", boxShadow: "inset 1px 2px 3px #ffd0b9, inset -2px -4px 5px #852f3c, 0 3px 0 #9c3f43" }}>
                <span className="absolute inset-[14%] flex items-center justify-center rounded-full font-script text-3xl text-[#b04e4b]" style={{ border: "2px solid #b65350", boxShadow: "0 1px 1px #ffc0a7,inset 0 2px 3px #a54644,inset 0 -1px 1px #ffc0a7", textShadow: "0 1px 0 #ffb6a0,0 -1px 1px #8c363d" }}>{WEDDING.noivos.ela[0]}&amp;{WEDDING.noivos.ele[0]}</span>
                <div className="absolute left-[19%] top-[9%] h-2 w-7 -rotate-[30deg] rounded-full bg-[#ffcfb7]/45 blur-[2px]" />
              </div>
            </button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          {p > 0.98 ? <button onClick={replay} type="button" className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#8c5b6a]"><RotateCcw size={13} />Abrir novamente</button> : <div className="pointer-events-none flex flex-col items-center gap-2 text-[#8c5b6a]" style={{ opacity: 1 - phase(p, 0, 0.12) }}><span className="text-[9px] uppercase tracking-[0.2em]">Toque no selo ou role para abrir</span><ChevronDown size={15} /></div>}
        </div>
      </div>
    </div>
  );
}

