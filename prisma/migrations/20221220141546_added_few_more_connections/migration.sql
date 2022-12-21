/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `users` table. All the data in the column will be lost.
  - Added the required column `stripeProductId` to the `plugins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSubscriptionID` to the `privileges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeCustomerId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plugins` ADD COLUMN `stripeProductId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `privileges` ADD COLUMN `stripeSubscriptionID` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `email`,
    DROP COLUMN `stripeId`,
    ADD COLUMN `stripeCustomerId` VARCHAR(191) NOT NULL;
