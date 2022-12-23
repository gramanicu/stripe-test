-- DropForeignKey
ALTER TABLE "_subscription_plugin" DROP CONSTRAINT "_subscription_plugin_B_fkey";

-- CreateTable
CREATE TABLE "_template_plugin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_template_plugin_AB_unique" ON "_template_plugin"("A", "B");

-- CreateIndex
CREATE INDEX "_template_plugin_B_index" ON "_template_plugin"("B");

-- AddForeignKey
ALTER TABLE "_subscription_plugin" ADD CONSTRAINT "_subscription_plugin_B_fkey" FOREIGN KEY ("B") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_template_plugin" ADD CONSTRAINT "_template_plugin_A_fkey" FOREIGN KEY ("A") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_template_plugin" ADD CONSTRAINT "_template_plugin_B_fkey" FOREIGN KEY ("B") REFERENCES "subscription_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
