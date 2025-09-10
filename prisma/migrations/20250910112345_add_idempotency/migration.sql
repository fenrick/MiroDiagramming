-- CreateTable
CREATE TABLE "IdempotencyEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "accepted" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyEntry_key_key" ON "IdempotencyEntry"("key");
