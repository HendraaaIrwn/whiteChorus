import Link from "next/link";

import { CustomCursor } from "@/features/home/home-motion";

export default function LookDetailNotFound() {
  return (
    <div className="hall-page look-detail-page look-detail-state-page">
      <CustomCursor scope="hall" />
      <section
        className="look-detail-state"
        aria-labelledby="look-not-found-title"
      >
        <span className="look-detail-state__label">NO LOOK ON STAGE</span>
        <h1 id="look-not-found-title">THIS LOOK COULD NOT BE FOUND.</h1>
        <p>It may have moved, expired, or never entered the Hall.</p>
        <div className="look-detail-state__actions">
          <Link
            className="button button--primary button--md"
            href="/hall-of-fame"
            data-cursor="OPEN"
          >
            EXPLORE THE HALL
          </Link>
          <Link
            className="look-detail-state__link"
            href="/studio"
            data-cursor="DRESS"
          >
            CREATE A NEW LOOK ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
