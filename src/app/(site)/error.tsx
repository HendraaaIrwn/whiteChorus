"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: { reset(): void }) {
  return (
    <div className="page">
      <section className="empty-state" role="alert">
        <h1>THE STAGE MISSED A BEAT</h1>
        <p>We could not load this page. Try again in a moment.</p>
        <Button onClick={reset}>TRY AGAIN</Button>
        <Link className="button button--tertiary button--md" href="/">
          BACK HOME
        </Link>
      </section>
    </div>
  );
}
