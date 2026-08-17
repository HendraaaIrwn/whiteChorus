import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDailyWinnersOverviewMock, getLiveDailyRankingMock } = vi.hoisted(
  () => ({
    getDailyWinnersOverviewMock: vi.fn(),
    getLiveDailyRankingMock: vi.fn(),
  }),
);

vi.mock("@/features/daily-winners/daily-winners", () => ({
  getDailyWinnersOverview: getDailyWinnersOverviewMock,
  getLiveDailyRanking: getLiveDailyRankingMock,
}));

import { GET } from "@/app/api/daily-winners/route";

beforeEach(() => {
  vi.clearAllMocks();
  getDailyWinnersOverviewMock.mockResolvedValue({
    latestWinner: { id: "latest-winner" },
    completedDays: [{ id: "previous-winner" }],
  });
  getLiveDailyRankingMock.mockResolvedValue({
    items: [],
    page: 2,
    pageSize: 10,
    totalItems: 12,
    totalPages: 2,
  });
});

describe("GET /api/daily-winners", () => {
  it("returns the overview separately from the requested ranking page", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/daily-winners?page=2"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getLiveDailyRankingMock).toHaveBeenCalledWith({
      now: expect.any(Date),
      page: 2,
    });
    expect(body.data).toEqual({
      latestWinner: { id: "latest-winner" },
      completedDays: [{ id: "previous-winner" }],
      ranking: expect.objectContaining({ page: 2, pageSize: 10 }),
    });
    expect(body.data).not.toHaveProperty("winners");
  });

  it("rejects an invalid page", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/daily-winners?page=0"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
    expect(getLiveDailyRankingMock).not.toHaveBeenCalled();
  });
});
