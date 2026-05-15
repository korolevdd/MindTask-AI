-- CreateTable
CREATE TABLE "TaskNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inbox',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT DEFAULT '[]',
    "aiSummary" TEXT,
    "discussionHistory" TEXT DEFAULT '[]',
    "embedding" TEXT,
    "x" REAL NOT NULL DEFAULT 0,
    "y" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaskNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "aiProvider" TEXT NOT NULL DEFAULT 'gemini',
    "baseUrl" TEXT,
    "modelName" TEXT DEFAULT 'gemini-3-flash-preview',
    "apiKey" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark'
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT
);
