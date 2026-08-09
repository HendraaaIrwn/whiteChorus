-- White Chorus uses these tables only through the server-side Prisma role.
-- No anon/authenticated policies are intentional: the Supabase Data API must
-- not expose anonymous session, rating, interaction, or competition data.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outfits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outfit_interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "weekly_winners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limit_counters" ENABLE ROW LEVEL SECURITY;
