-- CreateEnum
CREATE TYPE "RequestCatalogCategory" AS ENUM ('IT', 'HR', 'FACILITIES', 'OPERATIONS', 'FINANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_SUPPORT', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('INC', 'REQ', 'HR', 'OP', 'TASK', 'CR', 'PRB');

-- CreateEnum
CREATE TYPE "ResolutionType" AS ENUM ('RESOLVED_PERMANENT', 'QUICK_FIX', 'WORKAROUND', 'CANCELLED', 'NOT_REPRODUCIBLE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TICKET_CREATED', 'TICKET_UPDATED', 'TICKET_ASSIGNED', 'TICKET_RESOLVED', 'COMMENT_ADDED', 'SLA_BREACH', 'SYSTEM_ALERT', 'XP_EARNED', 'BADGE_EARNED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'END_USER', 'MANAGER', 'TECHNICIAN', 'TECH_LEAD', 'ADMIN', 'OPS', 'HR');

-- CreateEnum
CREATE TYPE "TicketRelationType" AS ENUM ('DUPLICATES', 'RELATED', 'BLOCKS', 'BLOCKED_BY', 'CAUSED_BY', 'CAUSES');

-- CreateEnum
CREATE TYPE "SLAEventType" AS ENUM ('RESPONSE_DUE', 'RESOLUTION_DUE', 'RESPONSE_BREACHED', 'RESOLUTION_BREACHED', 'ESCALATED', 'RESOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "novaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "profileImageUrl" TEXT,
    "department" TEXT,
    "title" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "timezone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'END_USER',
    "permissions" JSONB,
    "metadata" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "type" "TicketType" NOT NULL DEFAULT 'INC',
    "resolutionType" "ResolutionType",
    "category" TEXT,
    "subcategory" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "slaBreachAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "catalogItemId" TEXT,
    "parentTicketId" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT,
    "commentId" TEXT,
    "kbArticleId" TEXT,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kb_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,

    CONSTRAINT "kb_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_states" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "workflow_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "hours" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kiosks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "logoUrl" TEXT,
    "bgUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastSeen" TIMESTAMP(3),
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kiosks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kiosk_activations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kioskId" TEXT,

    CONSTRAINT "kiosk_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "email" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_info" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "announcement" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_catalog_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RequestCatalogCategory" NOT NULL,
    "formFields" JSONB NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "approvalRequired" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "request_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_relations" (
    "id" TEXT NOT NULL,
    "type" "TicketRelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromTicketId" TEXT NOT NULL,
    "toTicketId" TEXT NOT NULL,

    CONSTRAINT "ticket_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_kb_links" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,
    "kbArticleId" TEXT NOT NULL,

    CONSTRAINT "ticket_kb_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticketType" "TicketType" NOT NULL,
    "priority" "Priority",
    "department" TEXT,
    "responseTimeMinutes" INTEGER,
    "resolutionTimeMinutes" INTEGER,
    "escalationChain" JSONB,
    "businessHours" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_events" (
    "id" TEXT NOT NULL,
    "type" "SLAEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "ticketId" TEXT NOT NULL,
    "slaRuleId" TEXT NOT NULL,

    CONSTRAINT "sla_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_xp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stardust" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'Cadet',
    "badges" TEXT[],
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_xp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userXpId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "actions" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_configs" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToUserGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToUserGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_novaId_key" ON "users"("novaId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_name_key" ON "user_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketNumber_key" ON "tickets"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_key_key" ON "configurations"("key");

-- CreateIndex
CREATE UNIQUE INDEX "kiosk_activations_code_key" ON "kiosk_activations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_key_key" ON "security_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_relations_fromTicketId_toTicketId_type_key" ON "ticket_relations"("fromTicketId", "toTicketId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_kb_links_ticketId_kbArticleId_key" ON "ticket_kb_links"("ticketId", "kbArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_xp_userId_key" ON "user_xp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "module_configs_module_key" ON "module_configs"("module");

-- CreateIndex
CREATE INDEX "_UserToUserGroup_B_index" ON "_UserToUserGroup"("B");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "request_catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parentTicketId_fkey" FOREIGN KEY ("parentTicketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_kbArticleId_fkey" FOREIGN KEY ("kbArticleId") REFERENCES "kb_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_states" ADD CONSTRAINT "workflow_states_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_states" ADD CONSTRAINT "workflow_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiosk_activations" ADD CONSTRAINT "kiosk_activations_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "kiosks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_catalog_items" ADD CONSTRAINT "request_catalog_items_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_relations" ADD CONSTRAINT "ticket_relations_fromTicketId_fkey" FOREIGN KEY ("fromTicketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_relations" ADD CONSTRAINT "ticket_relations_toTicketId_fkey" FOREIGN KEY ("toTicketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_kb_links" ADD CONSTRAINT "ticket_kb_links_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_kb_links" ADD CONSTRAINT "ticket_kb_links_kbArticleId_fkey" FOREIGN KEY ("kbArticleId") REFERENCES "kb_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_events" ADD CONSTRAINT "sla_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_events" ADD CONSTRAINT "sla_events_slaRuleId_fkey" FOREIGN KEY ("slaRuleId") REFERENCES "sla_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_xp" ADD CONSTRAINT "user_xp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_userXpId_fkey" FOREIGN KEY ("userXpId") REFERENCES "user_xp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroup" ADD CONSTRAINT "_UserToUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroup" ADD CONSTRAINT "_UserToUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
