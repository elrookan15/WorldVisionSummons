import { useEffect, useRef, useState } from "react";

/** Sharp plate — existing full WebP (PNG fallback). */
const HERO_SRC_WEBP = "/brand/worldvision-summons-logo.webp";
const HERO_SRC_PNG = "/brand/worldvision-summons-logo.png";
/** Blurred band fill — reuse the lighter 512 WebP already in public/brand (no new asset). */
const HERO_BACKDROP_SRC = "/brand/worldvision-summons-logo-512.webp";

type BrandHeroBannerProps = {
  bg: string;
  accent: string;
  clash?: string;
};

/**
 * Full-viewport-width hero band: blurred/darkened cover backdrop from the
 * same brand art, with a sharp centered square plate on top (object-contain —
 * never stretched or title-cropped). Soft masks remove the hard box edge.
 */
export function BrandHeroBanner({ bg, accent, clash }: BrandHeroBannerProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [foreSrc, setForeSrc] = useState(HERO_SRC_WEBP);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setParallaxY(0);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = frameRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));
        setParallaxY(progress * 10);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduceMotion]);

  const glow = clash || accent;

  return (
    <section
      ref={frameRef}
      className="brand-hero relative no-print w-full overflow-hidden"
      aria-label="WorldVision Summons official artwork"
      style={{ backgroundColor: bg }}
    >
      {/* Full-bleed backdrop: same artwork, cover + blur + darken + saturate */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <img
          src={HERO_BACKDROP_SRC}
          alt=""
          width={512}
          height={512}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            // Scale past edges so blur doesn't flash transparent fringes.
            transform: "scale(1.18)",
            filter: "blur(36px) brightness(0.38) saturate(1.45)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: [
              `linear-gradient(90deg, ${bg}cc 0%, transparent 18%, transparent 82%, ${bg}cc 100%)`,
              `linear-gradient(180deg, ${bg}b3 0%, transparent 22%, transparent 70%, ${bg}e6 100%)`,
              `radial-gradient(ellipse 80% 70% at 50% 42%, ${accent}22 0%, transparent 65%)`,
              `linear-gradient(180deg, ${bg}66 0%, ${bg}99 100%)`,
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 55% 45% at 50% 48%, ${glow}33 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Sharp plate — contain, never crop title/heroes; full width on mobile */}
      <div className="relative z-[1] flex w-full justify-center px-0 sm:px-4 md:px-10 py-3 md:py-6">
        <div
          className="relative w-full md:w-auto"
          style={{
            transform: reduceMotion ? undefined : `translate3d(0, ${parallaxY}px, 0)`,
            transition: reduceMotion ? undefined : "transform 90ms linear",
            willChange: reduceMotion ? undefined : "transform",
            maxWidth: "min(100vw, 580px)",
          }}
        >
          <img
            src={foreSrc}
            alt="WorldVision Summons — carved stone title above a rune-ringed cosmic portal with summoned heroes"
            width={1024}
            height={1024}
            decoding="async"
            fetchPriority="high"
            draggable={false}
            onError={() => {
              if (foreSrc !== HERO_SRC_PNG) setForeSrc(HERO_SRC_PNG);
            }}
            className="block h-auto w-full object-contain"
            style={{
              aspectRatio: "1 / 1",
              maxHeight: "min(56vh, 560px)",
              // Soft vignette mask — blends into backdrop, no hard card edge.
              WebkitMaskImage:
                "radial-gradient(ellipse 96% 94% at 50% 50%, #000 58%, rgba(0,0,0,0.85) 78%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 96% 94% at 50% 50%, #000 58%, rgba(0,0,0,0.85) 78%, transparent 100%)",
              filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.55))",
            }}
          />
        </div>
      </div>

      {/* Band → page blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-8"
        style={{ background: `linear-gradient(180deg, ${bg} 0%, transparent 100%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${bg} 100%)` }}
      />
    </section>
  );
}
