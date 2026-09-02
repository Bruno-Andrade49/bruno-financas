-- CreateEnum
CREATE TYPE "AIConversationChannel" AS ENUM ('web', 'whatsapp');

-- DropIndex
DROP INDEX "ai_conversations_userId_updatedAt_idx";

-- AlterTable
ALTER TABLE "ai_conversations" ADD COLUMN     "channel" "AIConversationChannel" NOT NULL DEFAULT 'web';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "whatsappLinkCode" TEXT,
ADD COLUMN     "whatsappLinkCodeExpires" TIMESTAMP(3),
ADD COLUMN     "whatsappPhoneNumber" TEXT;

-- CreateIndex
CREATE INDEX "ai_conversations_userId_channel_updatedAt_idx" ON "ai_conversations"("userId", "channel", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsappPhoneNumber_key" ON "users"("whatsappPhoneNumber");

