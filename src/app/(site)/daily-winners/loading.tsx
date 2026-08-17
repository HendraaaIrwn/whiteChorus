export default function DailyWinnersLoading() {
  return (
    <div
      className="winner-page winner-loading"
      aria-busy="true"
      aria-label="Loading Daily Competition and live ranking"
    >
      <section className="winner-loading__hero">
        <div className="winner-container">
          <span className="winner-loading__line winner-loading__line--label" />
          <span className="winner-loading__line winner-loading__line--display" />
          <span className="winner-loading__line winner-loading__line--display winner-loading__line--offset" />
        </div>
      </section>
      <section className="winner-loading__ranking">
        <div className="winner-container">
          <span className="winner-loading__line winner-loading__line--heading" />
          {[1, 2, 3].map((item) => (
            <span className="winner-loading__row" key={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
