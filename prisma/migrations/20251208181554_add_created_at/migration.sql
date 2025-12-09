/*
  Warnings:

  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueAt" DATETIME NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "recurringTaskId" TEXT,
    "creatorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Task_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("companyId", "creatorId", "description", "dueAt", "id", "priority", "recurringTaskId", "status", "title", "weekStart") SELECT "companyId", "creatorId", "description", "dueAt", "id", "priority", "recurringTaskId", "status", "title", "weekStart" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_companyId_weekStart_idx" ON "Task"("companyId", "weekStart");
CREATE INDEX "Task_recurringTaskId_idx" ON "Task"("recurringTaskId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
