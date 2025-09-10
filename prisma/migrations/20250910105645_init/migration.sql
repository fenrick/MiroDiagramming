-- CreateTable
CREATE TABLE "Board" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "board_id" TEXT,
    "owner_id" TEXT
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "board_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Tag_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shape" (
    "board_id" TEXT NOT NULL,
    "shape_id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("board_id", "shape_id"),
    CONSTRAINT "Shape_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board" ("board_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CacheEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_name_key" ON "Board"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Board_board_id_key" ON "Board"("board_id");

-- CreateIndex
CREATE INDEX "Tag_board_id_idx" ON "Tag"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CacheEntry_key_key" ON "CacheEntry"("key");
