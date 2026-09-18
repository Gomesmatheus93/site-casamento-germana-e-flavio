"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/1.jpg", position: "50% 30%" },
  { src: "/2.jpeg", position: "50% 32%" },
  { src: "/4.jpeg", position: "48% 25%" },
  { src: "/6.jpeg", position: "52% 28%" },
  { src: "/9.jpeg", position: "50% 28%" },
  { src: "/3.jpeg", position: "50% 30%" },
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
