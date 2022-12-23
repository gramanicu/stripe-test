/*
  Warnings:

  - You are about to drop the `_user_pokemon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_user_pokemon" DROP CONSTRAINT "_user_pokemon_A_fkey";

-- DropForeignKey
ALTER TABLE "_user_pokemon" DROP CONSTRAINT "_user_pokemon_B_fkey";

-- DropTable
DROP TABLE "_user_pokemon";

-- CreateTable
CREATE TABLE "_owned_pokemon" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_owned_pokemon_AB_unique" ON "_owned_pokemon"("A", "B");

-- CreateIndex
CREATE INDEX "_owned_pokemon_B_index" ON "_owned_pokemon"("B");

-- AddForeignKey
ALTER TABLE "_owned_pokemon" ADD CONSTRAINT "_owned_pokemon_A_fkey" FOREIGN KEY ("A") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_owned_pokemon" ADD CONSTRAINT "_owned_pokemon_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
