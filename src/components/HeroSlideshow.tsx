"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/foto-da-capa.jpg", position: "center 42%" },
  { src: "/DSCF3255.jpg", position: "center 43%" },
  { src: "/DSCF8178.jpg", position: "center 55%" },
  { src: "/DSCF8260.jpg", position: "center 28%" },
];

const INTERVAL_MS = 6000;

export default function HeroSlideshow({ alt }: { alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={alt}
          fill
          priority={i === 0}
          quality={70}
          sizes="100vw"
          style={{ objectPosition: slide.position }}
          className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
