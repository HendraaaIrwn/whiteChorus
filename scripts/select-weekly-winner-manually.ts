import { selectDailyWinner } from "../src/features/daily-winners/daily-winners";
import { getPrisma } from "../src/server/database/prisma";

async function main() {
  const requestedTime = process.argv[2];
  const now = requestedTime ? new Date(requestedTime) : new Date();
  if (Number.isNaN(now.getTime()))
    throw new Error(
      "Pass an ISO timestamp, for example 2026-08-10T00:05:00+07:00",
    );
  try {
    console.log(await selectDailyWinner(now));
  } finally {
    await getPrisma().$disconnect();
  }
}

void main();
