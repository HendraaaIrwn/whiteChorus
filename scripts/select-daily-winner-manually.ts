import { selectDailyWinner } from "../src/features/daily-winners/daily-winners";

async function main() {
  const input = process.argv[2];
  const now = input ? new Date(input) : new Date();
  if (Number.isNaN(now.getTime()))
    throw new Error("Pass a valid ISO timestamp when overriding the clock.");
  console.log(await selectDailyWinner(now));
}

void main();
