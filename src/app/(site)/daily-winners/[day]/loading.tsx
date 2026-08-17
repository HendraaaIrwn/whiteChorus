export default function DailyWinnerDetailLoading() {
  return (
    <div
      className="winner-page winner-detail-page winner-detail-loading"
      aria-busy="true"
      aria-label="Loading Daily Winner detail"
    >
      <section className="winner-detail">
        <div className="winner-container">
          <span className="winner-detail-loading__back" />
          <div className="winner-grid-system winner-detail-loading__masthead">
            <span className="winner-detail-loading__line winner-detail-loading__line--label" />
            <span className="winner-detail-loading__line winner-detail-loading__line--title" />
            <span className="winner-detail-loading__line winner-detail-loading__line--title winner-detail-loading__line--offset" />
          </div>
          <div className="winner-grid-system winner-detail-loading__feature">
            <span className="winner-detail-loading__stage" />
            <div className="winner-detail-loading__information">
              <span className="winner-detail-loading__badge" />
              <span className="winner-detail-loading__line winner-detail-loading__line--identity" />
              <span className="winner-detail-loading__stats" />
              <span className="winner-detail-loading__action" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
