/*
  Warnings:

  - You are about to drop the column `tiersId` on the `plugins` table. All the data in the column will be lost.
  - You are about to drop the `privileges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tiers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "plugins" DROP CONSTRAINT "plugins_tiersId_fkey";

-- DropForeignKey
ALTER TABLE "privileges" DROP CONSTRAINT "privileges_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "privileges" DROP CONSTRAINT "privileges_userId_fkey";

-- AlterTable
ALTER TABLE "plugins" DROP COLUMN "tiersId";

-- DropTable
DROP TABLE "privileges";

-- DropTable
DROP TABLE "tiers";

-- CreateTable
CREATE TABLE "subscription_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "subscription_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_subscription_plugin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "_subscription_plugin_AB_unique" ON "_subscription_plugin"("A", "B");

-- CreateIndex
CREATE INDEX "_subscription_plugin_B_index" ON "_subscription_plugin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_plugin" ADD CONSTRAINT "_subscription_plugin_A_fkey" FOREIGN KEY ("A") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_plugin" ADD CONSTRAINT "_subscription_plugin_B_fkey" FOREIGN KEY ("B") REFERENCES "subscription_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
