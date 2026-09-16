"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Church, MapPin, PartyPopper, RotateCcw } from "lucide-react";
import { WEDDING } from "@/lib/wedding-config";
import styles from "./InviteOpening.module.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
// Smootherstep: gentler acceleration/deceleration at both ends than the
// classic smoothstep, so staged transforms blend into each other instead
// of visibly starting/stopping.
const ease = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);
const phase = (progress: number, start: number, end: number) => ease(clamp((progress - start) / (end - start)));
const OPEN_SHARE = 0.38;
const mapsLink = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path d="M13 128C20 80 45 35 124 12M14 105c24-7 38-21 44-42M39 58c25 2 44-9 56-28M69 35c9 10 23 13 38 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 105C6 94 7 78 10 70c14 7 17 23 8 35ZM30 84C19 71 21 56 25 49c12 10 15 23 5 35ZM51 59c-4-16 3-28 10-33 7 14 4 27-10 33ZM77 39c1-15 12-24 21-26 2 16-7 25-21 26ZM46 85c10-12 24-13 34-10-8 14-23 18-34 10ZM82 45c14-8 28-5 35 1-12 11-26 11-35-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M16 119c-8-5-11-15-9-21 10 4 13 13 9 21ZM101 28c6-10 17-15 27-13-4 11-16 17-27 13Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.1" />
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

function SatinBow({ untie }: { untie: number }) {
  // The bow is a photo, so it comes undone as one piece: it loosens, then
  // slips down off the card and fades while the ribbon bands slide apart.
  const loosen = phase(untie, 0, .4);
  const slip = phase(untie, .3, .85);
  const bowFade = phase(untie, .55, .95);
  const bandSlide = phase(untie, .5, 1);
  const ribbonFade = phase(untie, .9, 1);

  return (
    <div className={styles.ribbon} aria-hidden="true" style={{ opacity: 1 - ribbonFade }}>
      <div className={styles.bandLeft} style={{ transform: `translate3d(${-bandSlide * 110}%,0,0) rotate(${-bandSlide * 6}deg)` }} />
      <div className={styles.bandRight} style={{ transform: `translate3d(${bandSlide * 110}%,0,0) rotate(${bandSlide * 6}deg)` }} />
      <div className={styles.bowShadow} style={{ opacity: 1 - phase(untie, 0, .5) }} />
      <div className={styles.bowWrap}>
        <Image
          src="/laco.png"
          alt=""
          width={740}
          height={740}
          priority
          className={styles.bow}
          style={{
            transform: `translate3d(0,${slip * 90}px,0) rotate(${-loosen * 2 - slip * 8}deg) scale(${1 - loosen * .05 - slip * .1})`,
            opacity: 1 - bowFade,
          }}
        />
      </div>
    </div>
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
        const next = current + diff * 0.16;
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
      const next = clamp((now - start) / 2800);
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
  const untie = phase(progress, .03, .48);
  const reveal = phase(progress, .42, .9);
  const revealed = progress > .94;
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
        <div className={styles.card}>
          <article className={styles.invitation} aria-hidden={!revealed}>
            <div ref={scrollerRef} className={styles.invitationScroll} style={{ transform: `translate3d(0,${-read * overflow}px,0)` }}>
              <div className={styles.photo}><Image src="/foto-da-capa.jpg" alt="Germana e Flávio juntos" fill priority sizes="(max-width: 600px) 94vw, 540px" className={styles.photoImage} /></div>
              <div className={styles.invitationBody}>
                <div className={styles.invitationArch} />
                <FloralCorner className={`${styles.inviteFloral} ${styles.inviteFloralLeft}`} />
                <FloralCorner className={`${styles.inviteFloral} ${styles.inviteFloralRight}`} />
                <p className={styles.verse}>“Encontrei aquele a quem meu coração ama”</p>
                <p className={styles.verseSource}>CÂNTICOS 3:4</p>
                <div className={styles.ornament}><span />♥<span /></div>
                <h1 className={styles.names}>{WEDDING.noivos.ela}<span>&amp;</span>{WEDDING.noivos.ele}</h1>
                <p className={styles.inviteLine}>Convidam para celebrar o seu casamento</p>
                <div className={styles.facts}>
                  <div><span className={styles.factIcon}>✧</span><strong>01 NOV 2026</strong><span>Domingo</span></div>
                  <div><span className={styles.factIcon}>◷</span><strong>{WEDDING.horario}</strong><span>Cerimônia</span></div>
                  <div><span className={styles.factIcon}>⌖</span><strong>MOSSORÓ</strong><span>Rio Grande do Norte</span></div>
                </div>
                <p className={styles.inviteFoot}>Sua presença tornará este dia ainda mais especial.</p>
              </div>

              <section className={styles.detail}>
                <p className={styles.detailEyebrow}>O grande dia</p>
                <p className={styles.detailDate}>{WEDDING.dataFormatada}</p>
                <p className={styles.detailMeta}>Domingo · às {WEDDING.horario}</p>
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
                <PartyPopper className={styles.detailIcon} strokeWidth={1.4} />
                <p className={styles.detailEyebrow}>Festa</p>
                <h2 className={styles.detailTitle}>{WEDDING.recepcao.nome}</h2>
                <p className={styles.detailMeta}>Logo após a cerimônia</p>
                <p className={styles.detailText}>{WEDDING.recepcao.endereco}</p>
                <a className={styles.detailLink} href={mapsLink(WEDDING.recepcao.mapsQuery)} target="_blank" rel="noopener noreferrer" tabIndex={revealed ? 0 : -1}><MapPin className={styles.detailLinkIcon} strokeWidth={1.6} />Ver no mapa</a>
              </section>

              <section className={styles.detail}>
                <p className={styles.detailEyebrow}>Traje &amp; paleta</p>
                <h2 className={styles.detailTitle}>Um pedido carinhoso</h2>
                <p className={styles.detailText}>
                  Com todo o carinho, pedimos que evitem o marsala e os
                  tons de vermelho: essas cores fazem parte da nossa paleta e ficarão
                  reservadas aos padrinhos. Contamos com a compreensão de todos!
                </p>
              </section>

              <section className={`${styles.detail} ${styles.detailClosing}`}>
                <div className={styles.ornament}><span />♥<span /></div>
                <p className={styles.closingNames}>{WEDDING.noivos.ela} &amp; {WEDDING.noivos.ele}</p>
                <p className={styles.detailMeta}>Esperamos por você</p>
              </section>
            </div>
          </article>

          <div className={styles.cover} aria-hidden={reveal > .98} style={{ transform: `translate3d(0,${-reveal * 120}%,${reveal * 120}px) rotateX(${-reveal * 36}deg)`, opacity: 1 - phase(reveal, .72, 1), visibility: reveal === 1 ? "hidden" : "visible" }}>
            <PaperGrain />
            <div className={styles.envelopeTexture} />
            <div className={styles.coverFrame} />
            <FloralCorner className={`${styles.coverFloral} ${styles.coverTopLeft}`} />
            <FloralCorner className={`${styles.coverFloral} ${styles.coverTopRight}`} />
            <FloralCorner className={`${styles.coverFloral} ${styles.coverBottomLeft}`} />
            <FloralCorner className={`${styles.coverFloral} ${styles.coverBottomRight}`} />
            <div className={styles.monogram} aria-label="Iniciais G e F">
              <span className={styles.monogramLetter}>G</span>
              <span className={styles.monogramAmp}>&amp;</span>
              <span className={styles.monogramLetter}>F</span>
            </div>
            <p className={styles.openHint}>TOQUE PARA ABRIR</p>
            <SatinBow untie={untie} />
            <button type="button" className={styles.openButton} onClick={() => reducedMotion ? setPlayProgress(1) : setPlaying(true)} disabled={playing || progress > .05} aria-label="Abrir o convite de Germana e Flávio" />
          </div>
        </div>
        <div className={styles.stageAction}>
          {!revealed ? (
            <div className={styles.scrollHint} style={{ opacity: 1 - phase(progress, .03, .2) }}><span>Toque no laço ou deslize para abrir</span><ChevronDown size={18} /></div>
          ) : read < .97 && !reducedMotion ? (
            <div className={styles.scrollHint} style={{ opacity: 1 - phase(read, .75, .97) }}><span>Continue rolando para ver os detalhes</span><ChevronDown size={18} /></div>
          ) : (
            <div className={styles.revealedActions}><button type="button" onClick={replay}><RotateCcw size={14} /> Ver novamente</button><Link href="/">Ir para o site</Link></div>
          )}
        </div>
      </div>
    </div>
  );
}
