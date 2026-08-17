import {
  getDailyWinnersOverview,
  selectDailyWinner,
} from "@/features/daily-winners/daily-winners";

export { selectDailyWinner as selectWeeklyWinner };

export async function getLatestWeeklyWinner() {
  return (await getDailyWinnersOverview()).latestWinner;
}
