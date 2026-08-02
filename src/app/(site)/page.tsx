import Link from "next/link";
import type { Metadata } from "next";

import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { getFeaturedOutfits } from "@/features/hall-of-fame/hall-of-fame";
import { OutfitCard } from "@/features/hall-of-fame/outfit-card";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedOutfits().catch(() => []);
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">A two-character fashion playground</p>
          <h1>
            DRESS. CREATE. <em>CHORUS.</em>
          </h1>
          <p className="hero-copy">
            Style Emir and Friska together, publish your look anonymously, and
            let the community decide who earns the weekly spotlight.
          </p>
          <EntryAudioGate />
        </div>
        <div
          className="hero-stage"
          aria-label="Emir and Friska ready to be styled"
        >
          <span className="paper-note">MIX &amp; MATCH</span>
          <span className="hero-person hero-person--a" aria-hidden="true" />
          <span className="hero-person hero-person--b" aria-hidden="true" />
          <span className="hero-caption">EMIR + FRISKA ✦</span>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <p className="eyebrow">Three easy beats</p>
        <h2 className="section-title" id="how-title">
          HOW IT WORKS
        </h2>
        <div className="steps">
          <article className="step-card">
            <span>01</span>
            <h3>DRESS THE DUO</h3>
            <p>
              Choose a shared scene, switch characters, and build two
              coordinated looks.
            </p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>TAKE THE STAGE</h3>
            <p>Publish one immutable snapshot to the anonymous Hall of Fame.</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>SHARE THE SPOTLIGHT</h3>
            <p>Rate, share, and compete for a permanent weekly winner card.</p>
          </article>
        </div>
      </section>

      {featured.length ? (
        <section className="section" aria-labelledby="featured-title">
          <p className="eyebrow">Fresh from the community</p>
          <h2 className="section-title" id="featured-title">
            FEATURED LOOKS
          </h2>
          <div className="hall-grid hall-grid--featured">
            {featured.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="cta-strip">
          <div>
            <p className="eyebrow">The hall is listening</p>
            <h2>DISCOVER THIS WEEK&apos;S LOOKS</h2>
          </div>
          <Link
            className="button button--tertiary button--lg"
            href="/hall-of-fame"
          >
            EXPLORE HALL OF FAME
          </Link>
        </div>
      </section>
    </div>
  );
}
