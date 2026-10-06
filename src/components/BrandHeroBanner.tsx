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
          className="absolute left-1/2 top-1/2 h-[140%] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{
            // Keep portal/smoke readable at the sides; still clearly behind the plate.
            filter: "blur(42px) brightness(0.58) saturate(1.7) contrast(1.08)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: [
              `linear-gradient(90deg, ${bg}99 0%, transparent 22%, transparent 78%, ${bg}99 100%)`,
              `linear-gradient(180deg, ${bg}a6 0%, transparent 28%, transparent 72%, ${bg}d9 100%)`,
              `radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, ${bg}66 100%)`,
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 48%, ${glow}40 0%, ${accent}18 45%, transparent 75%)`,
          }}
        />
      </div>

      {/* Sharp plate — contain, never crop title/heroes; full width on mobile */}
      <div className="relative z-[1] flex w-full justify-center px-0 md:px-8 py-2 md:py-5">
        <div
          className="relative w-full md:w-auto"
          style={{
            transform: reduceMotion ? undefined : `translate3d(0, ${parallaxY}px, 0)`,
            transition: reduceMotion ? undefined : "transform 90ms linear",
            willChange: reduceMotion ? undefined : "transform",
            maxWidth: "min(100%, 580px)",
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
            className="brand-hero-plate block h-auto w-full object-contain"
            style={{
              aspectRatio: "1 / 1",
              maxHeight: "min(58vh, 560px)",
              // Feather only the outer rim so title/heroes stay sharp; blend into backdrop.
              WebkitMaskImage: [
                "linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%)",
              ].join(", "),
              maskImage: [
                "linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%)",
              ].join(", "),
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
              filter: "drop-shadow(0 18px 42px rgba(0,0,0,0.65))",
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
