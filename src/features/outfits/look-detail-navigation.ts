export type LookDetailOrigin = "hall-of-fame" | "daily-winner";

export type LookDetailNavigationContext = {
  origin: LookDetailOrigin;
  returnTo: string;
};

export type ResolvedLookDetailNavigation = LookDetailNavigationContext & {
  backLabel: "BACK TO HALL OF FAME" | "BACK TO DAILY WINNER";
};

type SearchParams = Record<string, string | string[] | undefined>;

const SAFE_ORIGIN = "https://white-chorus.local";
const HALL_SORTS = new Set(["newest", "top-rated", "trending"]);

export const DAILY_WINNER_LOOK_DETAIL_CONTEXT = {
  origin: "daily-winner",
  returnTo: "/daily-winners",
} as const satisfies LookDetailNavigationContext;

export function createHallLookDetailContext(
  sort: "newest" | "top-rated" | "trending",
  page: number,
): LookDetailNavigationContext {
  const search = new URLSearchParams({ sort, page: String(page) });
  return {
    origin: "hall-of-fame",
    returnTo: `/hall-of-fame?${search.toString()}`,
  };
}

export function buildLookDetailHref(
  outfitId: string,
  context: LookDetailNavigationContext,
) {
  const search = new URLSearchParams({
    from: context.origin,
    returnTo: context.returnTo,
  });
  return `/outfits/${encodeURIComponent(outfitId)}?${search.toString()}`;
}

export function resolveLookDetailNavigation(
  searchParams: SearchParams,
): ResolvedLookDetailNavigation {
  const origin = firstValue(searchParams.from);
  const requestedReturnTo = firstValue(searchParams.returnTo);

  if (origin === "daily-winner") {
    return {
      origin,
      returnTo: normalizeDailyWinnerReturnTo(requestedReturnTo),
      backLabel: "BACK TO DAILY WINNER",
    };
  }

  if (origin === "hall-of-fame") {
    return {
      origin,
      returnTo: normalizeHallReturnTo(requestedReturnTo),
      backLabel: "BACK TO HALL OF FAME",
    };
  }

  return {
    origin: "hall-of-fame",
    returnTo: "/hall-of-fame",
    backLabel: "BACK TO HALL OF FAME",
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeDailyWinnerReturnTo(value?: string) {
  if (!value) return "/daily-winners";
  const url = parseInternalUrl(value);
  if (url?.pathname !== "/daily-winners" || url.search || url.hash)
    return "/daily-winners";
  return "/daily-winners";
}

function normalizeHallReturnTo(value?: string) {
  if (!value) return "/hall-of-fame";
  const url = parseInternalUrl(value);
  if (url?.pathname !== "/hall-of-fame" || url.hash) {
    return "/hall-of-fame";
  }

  const keys = [...url.searchParams.keys()];
  if (keys.some((key) => key !== "sort" && key !== "page")) {
    return "/hall-of-fame";
  }

  const sort = url.searchParams.get("sort");
  const page = url.searchParams.get("page");
  if (sort && !HALL_SORTS.has(sort)) return "/hall-of-fame";
  if (page && (!/^\d+$/.test(page) || Number(page) < 1)) {
    return "/hall-of-fame";
  }

  const sanitizedSearch = new URLSearchParams();
  if (sort) sanitizedSearch.set("sort", sort);
  if (page) sanitizedSearch.set("page", page);
  const search = sanitizedSearch.toString();
  return search ? `/hall-of-fame?${search}` : "/hall-of-fame";
}

function parseInternalUrl(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, SAFE_ORIGIN);
    return url.origin === SAFE_ORIGIN ? url : null;
  } catch {
    return null;
  }
}
