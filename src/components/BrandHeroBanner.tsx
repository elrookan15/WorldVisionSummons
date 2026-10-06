import { useEffect, useRef, useState } from "react";

type BrandHeroBannerProps = {
  bg: string;
  accent: string;
  clash?: string;
};

/**
 * Landing hero featuring the full official WorldVision Summons artwork
 * large enough for the carved title to read. Soft edge fades blend into
 * the dark sheet chrome. Parallax is gated behind prefers-reduced-motion.
 */
export function BrandHeroBanner({ bg, accent, clash }: BrandHeroBannerProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [src, setSrc] = useState("/brand/worldvision-summons-logo.webp");

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
        setParallaxY(progress * 12);
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
      className="brand-hero relative no-print overflow-hidden"
      aria-label="WorldVision Summons official artwork"
      style={{ backgroundColor: bg }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 65% 50% at 50% 40%, ${accent}28 0%, ${glow}12 42%, transparent 72%)`,
        }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-[980px] px-3 sm:px-6 md:px-10 py-3 md:py-5">
        <div
          className="relative mx-auto flex justify-center"
          style={{
            transform: reduceMotion ? undefined : `translate3d(0, ${parallaxY}px, 0)`,
            transition: reduceMotion ? undefined : "transform 90ms linear",
            willChange: reduceMotion ? undefined : "transform",
          }}
        >
          <img
            src={src}
            alt="WorldVision Summons — carved stone title above a rune-ringed cosmic portal with summoned heroes"
            width={1024}
            height={1024}
            decoding="async"
            fetchPriority="high"
            onError={() => {
              if (src !== "/brand/worldvision-summons-logo.png") {
                setSrc("/brand/worldvision-summons-logo.png");
              }
            }}
            className="block h-auto w-full object-contain"
            style={{
              // Large enough for carved title legibility; capped so sticky
              // Instant Summon / theme engine stay near the fold.
              maxWidth: "min(92vw, 560px)",
              maxHeight: "min(46vh, 440px)",
              filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.7))",
              // Soft rectangular mask: keep the plate readable, fade only the rim.
              WebkitMaskImage:
                "radial-gradient(ellipse 92% 90% at 50% 48%, #000 62%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 92% 90% at 50% 48%, #000 62%, transparent 100%)",
            }}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 z-[2]"
        style={{ background: `linear-gradient(180deg, ${bg} 0%, transparent 100%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-[2]"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${bg} 100%)` }}
      />
    </section>
  );
}
