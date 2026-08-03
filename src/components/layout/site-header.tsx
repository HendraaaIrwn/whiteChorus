"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Music, Star } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { publicConfig } from "@/config/public-config";
import { MusicControl } from "@/features/audio/music-control";

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();
  const hallActive =
    pathname.startsWith("/hall-of-fame") || pathname.startsWith("/outfits/");
  const navigation = [
    ["/studio", "STUDIO", pathname.startsWith("/studio")],
    ["/hall-of-fame", "HALL OF FAME", hallActive],
    ["/weekly-winners", "WINNERS", pathname.startsWith("/weekly-winners")],
  ] as const;

  return (
    <motion.header
      className="site-header"
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
    >
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
        {navigation.map(([href, label, active]) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            <span>{label}</span>
            {active ? (
              <motion.span
                className="nav-indicator"
                layoutId="primary-navigation-indicator"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            ) : null}
          </Link>
        ))}
      </nav>
      <MusicControl />
    </motion.header>
  );
}
