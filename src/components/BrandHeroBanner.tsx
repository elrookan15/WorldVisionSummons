import { useEffect, useRef, useState } from "react";

type BrandHeroBannerProps = {
  /** Theme background hex for edge fades */
  bg: string;
  /** Accent for soft glow */
  accent: string;
  /** Optional clash tint */
  clash?: string;
};

/**
 * Landing hero that features the full official WorldVision Summons artwork
 * large enough for the carved title to read. Soft vignette blends into the
 * dark sheet chrome. Parallax is gated behind prefers-reduced-motion.
 */
export function BrandHeroBanner({ bg, accent, clash }: BrandHeroBannerProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

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
        // Mild drift while the hero is in view; clamp so it never feels floaty.
        const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));
        setParallaxY(progress * 14);
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
      {/* Soft ambient glow behind the plate */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${accent}33 0%, ${glow}14 38%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-[1100px] px-3 sm:px-6 md:px-10">
        <div
          className="relative mx-auto flex items-center justify-center"
          style={{
            // Keep desktop fold usable: sticky Instant Summon stays in header,
            // but theme engine should still peek below the hero.
            minHeight: "clamp(220px, 38vh, 440px)",
            maxHeight: "min(48vh, 460px)",
          }}
        >
          <picture
            className="relative z-[1] block w-full"
            style={{
              transform: reduceMotion ? undefined : `translate3d(0, ${parallaxY}px, 0)`,
              transition: reduceMotion ? undefined : "transform 80ms linear",
              willChange: reduceMotion ? undefined : "transform",
            }}
          >
            <source
              type="image/webp"
              srcSet={[
                "/brand/worldvision-summons-logo-512.webp 512w",
                "/brand/worldvision-summons-logo.webp 1024w",
                "/brand/og-image.webp 1200w",
              ].join(", ")}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 560px"
            />
            <img
              src="/brand/worldvision-summons-logo.png"
              srcSet="/brand/worldvision-summons-logo-512.png 512w, /brand/worldvision-summons-logo.png 1024w"
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 560px"
              alt="WorldVision Summons — carved stone title above a rune-ringed cosmic portal with summoned heroes"
              width={1024}
              height={1024}
              decoding="async"
              fetchPriority="high"
              className="mx-auto h-auto w-full max-w-[min(92vw,420px)] sm:max-w-[min(80vw,480px)] md:max-w-[min(62vw,560px)] object-contain drop-shadow-[0_18px_48px_rgba(0,0,0,0.65)]"
              style={{
                maxHeight: "min(48vh, 460px)",
              }}
            />
          </picture>

          {/* Edge fades into page background so the square plate isn't a hard card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              background: [
                `linear-gradient(90deg, ${bg} 0%, transparent 12%, transparent 88%, ${bg} 100%)`,
                `linear-gradient(180deg, ${bg}cc 0%, transparent 18%, transparent 78%, ${bg} 100%)`,
                `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, ${bg}e6 100%)`,
              ].join(", "),
            }}
          />
        </div>
      </div>

      {/* Bottom hairline blend into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${bg} 100%)`,
        }}
      />
    </section>
  );
}
