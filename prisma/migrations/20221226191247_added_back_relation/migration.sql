-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "subscriptionTemplateId" TEXT;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionTemplateId_fkey" FOREIGN KEY ("subscriptionTemplateId") REFERENCES "subscription_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
