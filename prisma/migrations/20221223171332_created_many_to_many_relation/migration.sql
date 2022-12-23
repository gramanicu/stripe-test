-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_pluginId_fkey";

-- CreateTable
CREATE TABLE "_plugin_permission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_plugin_permission_AB_unique" ON "_plugin_permission"("A", "B");

-- CreateIndex
CREATE INDEX "_plugin_permission_B_index" ON "_plugin_permission"("B");

-- AddForeignKey
ALTER TABLE "_plugin_permission" ADD CONSTRAINT "_plugin_permission_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_plugin_permission" ADD CONSTRAINT "_plugin_permission_B_fkey" FOREIGN KEY ("B") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
