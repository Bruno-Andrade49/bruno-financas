-- AlterEnum
BEGIN;
CREATE TYPE "AuditActorType_new" AS ENUM ('user', 'system');
ALTER TABLE "audit_logs" ALTER COLUMN "actorType" TYPE "AuditActorType_new" USING ("actorType"::text::"AuditActorType_new");
ALTER TYPE "AuditActorType" RENAME TO "AuditActorType_old";
ALTER TYPE "AuditActorType_new" RENAME TO "AuditActorType";
DROP TYPE "public"."AuditActorType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InsightGeneratedBy_new" AS ENUM ('rule_engine');
ALTER TABLE "public"."financial_insights" ALTER COLUMN "generatedBy" DROP DEFAULT;
ALTER TABLE "financial_insights" ALTER COLUMN "generatedBy" TYPE "InsightGeneratedBy_new" USING ("generatedBy"::text::"InsightGeneratedBy_new");
ALTER TYPE "InsightGeneratedBy" RENAME TO "InsightGeneratedBy_old";
ALTER TYPE "InsightGeneratedBy_new" RENAME TO "InsightGeneratedBy";
DROP TYPE "public"."InsightGeneratedBy_old";
ALTER TABLE "financial_insights" ALTER COLUMN "generatedBy" SET DEFAULT 'rule_engine';
COMMIT;

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_userId_fkey";

-- DropForeignKey
ALTER TABLE "ai_messages" DROP CONSTRAINT "ai_messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ai_tool_call_logs" DROP CONSTRAINT "ai_tool_call_logs_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ai_tool_call_logs" DROP CONSTRAINT "ai_tool_call_logs_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ai_tool_call_logs" DROP CONSTRAINT "ai_tool_call_logs_userId_fkey";

-- DropIndex
DROP INDEX "users_whatsappPhoneNumber_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "whatsappLinkCode",
DROP COLUMN "whatsappLinkCodeExpires",
DROP COLUMN "whatsappPhoneNumber";

-- DropTable
DROP TABLE "ai_conversations";

-- DropTable
DROP TABLE "ai_messages";

-- DropTable
DROP TABLE "ai_tool_call_logs";

-- DropEnum
DROP TYPE "AIConversationChannel";

-- DropEnum
DROP TYPE "AIMessageRole";

-- DropEnum
DROP TYPE "AIToolCallStatus";


-- Origem "ai_nl" vira "quick_add" (lançamento rápido, sem IA). RENAME VALUE
-- preserva as transações que já existiam com essa origem.
ALTER TYPE "TransactionSource" RENAME VALUE 'ai_nl' TO 'quick_add';
