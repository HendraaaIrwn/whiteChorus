"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MusicControl } from "@/features/audio/music-control";
import {
  ChorusWave,
  Sparkle,
  ThreadStroke,
} from "@/features/home/home-doodles";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer className="site-footer site-footer--home">
        <div className="home-editorial-footer home-container">
          <span className="home-label">10 · THE LAST NOTE</span>
          <div
            className="home-editorial-footer__title"
            aria-label="White Chorus"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/">HOME</Link>
            <Link href="/studio">DRESS UP</Link>
            <Link href="/hall-of-fame">HALL OF FAME</Link>
            <Link href="/daily-winners">DAILY WINNERS</Link>
          </nav>
          <div className="home-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <MusicControl />
            <span>WHITE CHORUS © 2026</span>
          </div>
          <ChorusWave aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </footer>
    );
  }

  if (pathname === "/studio") {
    return (
      <footer className="site-footer site-footer--studio">
        <div className="studio-editorial-footer">
          <span className="studio-kicker">THE LOOK CONTINUES</span>
          <Link
            className="studio-editorial-footer__link"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            <span>ENTER THE</span>
            <span>HALL OF FAME ↗</span>
          </Link>
          <div className="studio-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <Link href="/daily-winners">DAILY WINNERS</Link>
          </div>
          <ThreadStroke aria-hidden="true" />
        </div>
      </footer>
    );
  }

  if (pathname === "/hall-of-fame" || pathname.startsWith("/outfits/")) {
    return (
      <footer className="site-footer site-footer--hall">
        <div className="hall-editorial-footer hall-container">
          <span className="hall-label">05 · THE LAST LOOK</span>
          <div
            className="hall-editorial-footer__title"
            aria-label="White Chorus"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/" data-cursor="OPEN">
              HOME
            </Link>
            <Link href="/studio" data-cursor="DRESS">
              DRESS UP
            </Link>
            <Link href="/daily-winners" data-cursor="OPEN">
              DAILY WINNERS
            </Link>
          </nav>
          <div className="hall-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <MusicControl />
            <span>WHITE CHORUS © 2026</span>
          </div>
          <ChorusWave aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </footer>
    );
  }

  if (pathname.startsWith("/daily-winners")) {
    return (
      <footer className="site-footer site-footer--winners">
        <div className="winner-editorial-footer winner-container">
          <span className="winner-label">THE RACE CONTINUES</span>
          <div
            className="winner-editorial-footer__title"
            aria-label="White Chorus"
          >
            <span>WHITE</span>
            <span>CHORUS</span>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/" data-cursor="OPEN">
              HOME
            </Link>
            <Link href="/studio" data-cursor="DRESS">
              DRESS UP
            </Link>
            <Link href="/hall-of-fame" data-cursor="OPEN">
              HALL OF FAME
            </Link>
          </nav>
          <div className="winner-editorial-footer__meta">
            <span>ANONYMOUS BY DESIGN.</span>
            <MusicControl />
            <span>WHITE CHORUS © 2026</span>
          </div>
          <ChorusWave aria-hidden="true" />
          <Sparkle aria-hidden="true" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>WHITE CHORUS</strong>
          <span>Dress together. Shine together.</span>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/studio">STUDIO</Link>
          <Link href="/hall-of-fame">HALL OF FAME</Link>
          <Link href="/daily-winners">DAILY WINNERS</Link>
        </nav>
        <span>Anonymous by design.</span>
      </div>
    </footer>
  );
}
