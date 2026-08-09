import { redirect } from "next/navigation";

export default async function LegacyWeeklyWinnerPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const week = (await params).week;
  redirect(`/daily-winners/${week}`);
}
