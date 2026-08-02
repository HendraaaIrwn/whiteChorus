import { cleanupOutfits } from "../src/features/outfits/cleanup-outfits";
import { getPrisma } from "../src/server/database/prisma";

async function main() {
  try {
    console.log(await cleanupOutfits());
  } finally {
    await getPrisma().$disconnect();
  }
}

void main();
