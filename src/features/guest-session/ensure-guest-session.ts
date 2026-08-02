export async function ensureGuestSession(): Promise<void> {
  const response = await fetch("/api/guest/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error("Your anonymous session could not start.");
}
