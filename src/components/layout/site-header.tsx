"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Music, Star } from "lucide-react";

import { publicConfig } from "@/config/public-config";
import { MusicControl } from "@/features/audio/music-control";

export function SiteHeader() {
  const pathname = usePathname();
  const hallActive =
    pathname.startsWith("/hall-of-fame") || pathname.startsWith("/outfits/");
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="White Chorus home">
        {publicConfig.assetMode === "production" ? (
          <Image
            src="/brand/logo-horizontal.svg"
            alt="White Chorus"
            width={180}
            height={48}
            priority
          />
        ) : (
          <>
            <Music aria-hidden="true" size={22} />
            <span>WHITE CHORUS</span>
            <Star aria-hidden="true" size={14} />
          </>
        )}
      </Link>
      <nav aria-label="Primary navigation">
        <Link
          href="/studio"
          aria-current={pathname.startsWith("/studio") ? "page" : undefined}
        >
          STUDIO
        </Link>
        <Link
          href="/hall-of-fame"
          aria-current={hallActive ? "page" : undefined}
        >
          HALL OF FAME
        </Link>
        <Link
          href="/weekly-winners"
          aria-current={
            pathname.startsWith("/weekly-winners") ? "page" : undefined
          }
        >
          WINNERS
        </Link>
      </nav>
      <MusicControl />
    </header>
  );
}
