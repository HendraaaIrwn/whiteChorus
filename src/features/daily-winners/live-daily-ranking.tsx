"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { FallbackImage } from "@/components/ui/fallback-image";
import {
  buildLookDetailHref,
  DAILY_WINNER_LOOK_DETAIL_CONTEXT,
} from "@/features/outfits/look-detail-navigation";
import type {
  DailyRankingItem,
  LiveDailyRanking as LiveDailyRankingData,
} from "@/features/daily-winners/daily-winners";
import { productionAssets } from "@/features/dress-up/catalog";
import { Sparkle, ThreadStroke } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

const REFRESH_INTERVAL_MS = 15_000;

function formatUpdateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatRemaining(end: string, now: number) {
  const remaining = Math.max(0, new Date(end).getTime() - now);
  if (!remaining) return "CLOSING NOW";
  const totalSeconds = Math.floor(remaining / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function DailyCycleClock({ dayEnd }: { dayEnd: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      className="live-ranking__clock"
      aria-label="Time until this daily ranking closes"
    >
      <small>NEXT FINALIZATION</small>
      <strong>{formatRemaining(dayEnd, now)}</strong>
    </span>
  );
}

function rankingItemEqual(left: DailyRankingItem, right: DailyRankingItem) {
  return (
    left.rank === right.rank &&
    left.shortCode === right.shortCode &&
    left.thumbnailUrl === right.thumbnailUrl &&
    left.ratingAverage === right.ratingAverage &&
    left.ratingCount === right.ratingCount &&
    left.weightedScore === right.weightedScore &&
    left.eligible === right.eligible &&
    left.ratingsNeeded === right.ratingsNeeded
  );
}

export function mergeDailyRanking(
  current: LiveDailyRankingData | null,
  next: LiveDailyRankingData,
) {
  if (!current) return next;
  const currentById = new Map(current.items.map((item) => [item.id, item]));
  return {
    ...next,
    items: next.items.map((item) => {
      const previous = currentById.get(item.id);
      return previous && rankingItemEqual(previous, item) ? previous : item;
    }),
  };
}

const RankingEntry = memo(function RankingEntry({
  item,
  reduceMotion,
}: {
  item: DailyRankingItem;
  reduceMotion: boolean;
}) {
  return (
    <motion.li
      className="live-ranking__item"
      data-rank={item.rank}
      layout={reduceMotion ? false : "position"}
      transition={{
        layout: reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 38 },
      }}
    >
      <div className="live-ranking__rank-block">
        <span className="live-ranking__position" aria-hidden="true">
          {String(item.rank).padStart(2, "0")}
        </span>
        <span>{item.rank === 1 ? "CURRENT LEADER" : "LIVE POSITION"}</span>
      </div>

      <div className="live-ranking__image">
        <FallbackImage
          src={item.thumbnailUrl}
          fallbackSrc={productionAssets.defaultLookPath}
          alt={`Anonymous White Chorus look ${item.shortCode}, provisional rank ${item.rank}.`}
          fill
          sizes="(max-width: 767px) 30vw, 170px"
        />
      </div>

      <div className="live-ranking__identity">
        <span>LOOK {String(item.rank).padStart(3, "0")}</span>
        <span>ANONYMOUS #{item.shortCode}</span>
      </div>

      <dl className="live-ranking__metrics">
        <div className="live-ranking__weighted">
          <dt>WEIGHTED SCORE</dt>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.dd
              key={item.weightedScore}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
            >
              {item.weightedScore.toFixed(3)}
            </motion.dd>
          </AnimatePresence>
        </div>
        <div>
          <dt>AVERAGE</dt>
          <dd>{item.ratingAverage.toFixed(2)}</dd>
        </div>
        <div>
          <dt>RATINGS</dt>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.dd
              key={item.ratingCount}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              {item.ratingCount}
            </motion.dd>
          </AnimatePresence>
        </div>
      </dl>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          className="live-ranking__eligibility"
          data-eligible={item.eligible || undefined}
          key={item.eligible ? "eligible" : `needs-${item.ratingsNeeded}`}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.03 }}
          transition={{ duration: reduceMotion ? 0 : 0.24 }}
        >
          {item.eligible
            ? "ELIGIBLE"
            : `NEEDS ${item.ratingsNeeded} MORE ${item.ratingsNeeded === 1 ? "RATING" : "RATINGS"}`}
        </motion.span>
      </AnimatePresence>

      <Link
        className="live-ranking__link"
        href={buildLookDetailHref(item.id, DAILY_WINNER_LOOK_DETAIL_CONTEXT)}
        data-cursor="VIEW"
        aria-label={`Open Look ${item.shortCode}, provisional rank ${item.rank}. Weighted score ${item.weightedScore.toFixed(3)}, average rating ${item.ratingAverage.toFixed(2)} from ${item.ratingCount} ratings.${
          item.eligible
            ? " Eligible for Daily Winner selection."
            : ` Needs ${item.ratingsNeeded} more ratings to qualify.`
        }`}
      />
    </motion.li>
  );
});

function RankingExplanation({ minimumRatings }: { minimumRatings: number }) {
  return (
    <details className="live-ranking__explanation">
      <summary data-cursor="OPEN">
        <span>HOW THE RANKING WORKS</span>
        <span aria-hidden="true">+</span>
      </summary>
      <div>
        <p>
          <strong>Average rating</strong> is the direct star average. The rating
          count shows how much community evidence supports it.
        </p>
        <p>
          <strong>Weighted score</strong> balances that average against the
          community-wide rating baseline, so a look with very little evidence
          does not jump ahead on raw stars alone.
        </p>
        <p>
          <strong>Eligibility</strong> begins at {minimumRatings} ratings. After
          the daily period closes, the highest weighted eligible look is
          finalized; existing rating-count, average, publication-time, and ID
          tie-breaks keep the result deterministic.
        </p>
      </div>
    </details>
  );
}

export function LiveDailyRanking({
  initialRanking,
}: {
  initialRanking: LiveDailyRankingData | null;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const [ranking, setRanking] = useState(initialRanking);
  const [refreshFailed, setRefreshFailed] = useState(!initialRanking);
  const [refreshing, setRefreshing] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setRefreshing(true);
    try {
      const response = await fetch("/api/daily-winners", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Ranking refresh failed");
      const body = (await response.json()) as {
        data?: { ranking?: LiveDailyRankingData };
      };
      if (!body.data?.ranking) throw new Error("Ranking payload missing");
      setRanking((current) => mergeDailyRanking(current, body.data!.ranking!));
      setRefreshFailed(false);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setRefreshFailed(true);
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      requestRef.current?.abort();
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  return (
    <section className="live-ranking" aria-labelledby="live-ranking-title">
      <div className="winner-container">
        <div className="winner-grid-system live-ranking__heading">
          <span className="winner-label">02 · CURRENT COMPETITION</span>
          <MaskedHeading
            id="live-ranking-title"
            className="live-ranking__title"
            lines={["LIVE", "RANKING"]}
            tabIndex={-1}
          />
          <div className="live-ranking__intro">
            <span className="live-ranking__signal">
              <i aria-hidden="true" /> LIVE · PROVISIONAL
            </span>
            <p>
              This is the active race—not a finalized winner. Positions move
              only when real rating data changes.
            </p>
          </div>
        </div>

        {!ranking ? (
          <div className="live-ranking__error" role="status">
            <div>
              <span className="winner-label">RANKING SIGNAL LOST</span>
              <h3>THE CURRENT RACE COULD NOT BE VERIFIED.</h3>
              <p>
                No provisional data is shown as live until the source
                reconnects.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              replacementLabel="TRY AGAIN →"
            >
              {refreshing ? "RECONNECTING…" : "TRY AGAIN"}
            </Button>
            <ThreadStroke aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="live-ranking__status">
              <span aria-live="polite">
                <small>{refreshFailed ? "LAST VERIFIED" : "UPDATED"}</small>
                <strong>
                  {formatUpdateTime(ranking.generatedAt, ranking.timeZone)} ·{" "}
                  {ranking.timeZone}
                </strong>
                {refreshFailed ? <em>Reconnect pending</em> : null}
              </span>
              <DailyCycleClock dayEnd={ranking.dayEnd} />
              <span>
                <small>QUALIFY AT</small>
                <strong>{ranking.minimumRatings} RATINGS</strong>
              </span>
            </div>

            {ranking.items.length ? (
              <motion.ol className="live-ranking__list" layout={!reduceMotion}>
                {ranking.items.map((item) => (
                  <RankingEntry
                    key={item.id}
                    item={item}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </motion.ol>
            ) : (
              <div className="live-ranking__empty">
                <div>
                  <span className="winner-label">OPEN POSITION · 01</span>
                  <h3>TODAY&apos;S CHORUS IS JUST GETTING STARTED.</h3>
                  <p>Publish a look to enter the real provisional ranking.</p>
                  <Link
                    className="winner-editorial-link"
                    href="/studio"
                    data-cursor="DRESS"
                  >
                    START DRESSING <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <Sparkle aria-hidden="true" />
                <ThreadStroke aria-hidden="true" />
              </div>
            )}

            <RankingExplanation minimumRatings={ranking.minimumRatings} />
          </>
        )}
      </div>
    </section>
  );
}
