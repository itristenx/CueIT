-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "recurringRuleId" TEXT;

-- CreateTable
CREATE TABLE "recurring_ticket_rules" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "type" "TicketType" NOT NULL DEFAULT 'INC',
    "category" TEXT,
    "tags" TEXT[],
    "assigneeId" TEXT,
    "schedule" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_ticket_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recurring_ticket_rules" ADD CONSTRAINT "recurring_ticket_rules_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_ticket_rules" ADD CONSTRAINT "recurring_ticket_rules_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "recurring_ticket_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
