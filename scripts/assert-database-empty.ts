import { Client } from "pg";

async function main(): Promise<void> {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DIRECT_URL is required.");

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    if (result.rows.length > 0) {
      throw new Error(
        `Migration target is not empty; found ${result.rows.length} public table(s).`,
      );
    }
    console.log("Migration target is an empty PostgreSQL database.");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Empty database check failed.",
  );
  process.exitCode = 1;
});
