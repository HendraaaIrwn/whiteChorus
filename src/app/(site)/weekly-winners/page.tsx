import { redirect } from "next/navigation";

export default function LegacyWeeklyWinnersPage() {
  redirect("/daily-winners");
}
