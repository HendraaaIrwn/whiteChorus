import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <section className="empty-state">
        <h1>THIS LOOK ISN&apos;T ON STAGE</h1>
        <p>It may have moved, expired, or never existed.</p>
        <Link
          className="button button--primary button--md"
          href="/hall-of-fame"
        >
          EXPLORE HALL OF FAME
        </Link>
      </section>
    </div>
  );
}
