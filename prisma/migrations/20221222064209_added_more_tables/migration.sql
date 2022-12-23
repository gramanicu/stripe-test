/*
  Warnings:

  - You are about to drop the `pokemons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pokemons";

-- CreateTable
CREATE TABLE "pokemon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_pokemon" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_user_pokemon_AB_unique" ON "_user_pokemon"("A", "B");

-- CreateIndex
CREATE INDEX "_user_pokemon_B_index" ON "_user_pokemon"("B");

-- AddForeignKey
ALTER TABLE "_user_pokemon" ADD CONSTRAINT "_user_pokemon_A_fkey" FOREIGN KEY ("A") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_pokemon" ADD CONSTRAINT "_user_pokemon_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
