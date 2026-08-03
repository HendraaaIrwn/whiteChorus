"use client";

import { useEffect, useRef } from "react";

export function HomeMotionExperience({
  children,
}: {
  children: React.ReactNode;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let context: gsap.Context | null = null;
    let media: gsap.MatchMedia | null = null;

    async function setupScrollMotion() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !scopeRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        media = gsap.matchMedia();

        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.to("[data-home-progress]", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          });

          gsap.to("[data-hero-scroll-layer]", {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-home-hero]",
              start: "top top",
              end: "bottom top",
              scrub: 0.35,
            },
          });

          gsap.to("[data-steps-progress]", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-home-steps]",
              start: "top 72%",
              end: "bottom 55%",
              scrub: 0.25,
            },
          });

          gsap.utils
            .toArray<HTMLElement>("[data-scroll-beat]")
            .forEach((beat) => {
              gsap.fromTo(
                beat,
                { opacity: 0.35, rotate: -10, scale: 0.72 },
                {
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  duration: 0.36,
                  ease: "back.out(1.35)",
                  scrollTrigger: {
                    trigger: beat,
                    start: "top 82%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            });

          gsap.to("[data-cta-orbit]", {
            rotate: 18,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-home-cta]",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.3,
            },
          });
        });
      }, scopeRef);
    }

    void setupScrollMotion();

    return () => {
      cancelled = true;
      media?.revert();
      context?.revert();
    };
  }, []);

  return (
    <div className="page home-motion-experience" ref={scopeRef}>
      <span aria-hidden="true" className="home-scroll-rail">
        <span className="home-scroll-progress" data-home-progress />
      </span>
      {children}
    </div>
  );
}
