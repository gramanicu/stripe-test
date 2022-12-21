/*
  Warnings:

  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `permissions` table. All the data in the column will be lost.
  - The primary key for the `privileges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `privileges` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `privileges` DROP FOREIGN KEY `privileges_permissionId_fkey`;

-- AlterTable
ALTER TABLE `permissions` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`name`);

-- AlterTable
ALTER TABLE `privileges` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`permissionId`);

-- AddForeignKey
ALTER TABLE `privileges` ADD CONSTRAINT `privileges_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
