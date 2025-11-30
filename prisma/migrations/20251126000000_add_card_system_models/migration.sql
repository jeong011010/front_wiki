-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obtainedBy" TEXT NOT NULL DEFAULT 'author',

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardDraw" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 100,
    "drawType" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardDraw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_articleId_key" ON "UserCard"("userId", "articleId");

-- CreateIndex
CREATE INDEX "UserCard_userId_idx" ON "UserCard"("userId");

-- CreateIndex
CREATE INDEX "UserCard_articleId_idx" ON "UserCard"("articleId");

-- CreateIndex
CREATE INDEX "UserCard_obtainedAt_idx" ON "UserCard"("obtainedAt");

-- CreateIndex
CREATE INDEX "UserCard_obtainedBy_idx" ON "UserCard"("obtainedBy");

-- CreateIndex
CREATE UNIQUE INDEX "UserPoint_userId_key" ON "UserPoint"("userId");

-- CreateIndex
CREATE INDEX "UserPoint_userId_idx" ON "UserPoint"("userId");

-- CreateIndex
CREATE INDEX "CardDraw_userId_idx" ON "CardDraw"("userId");

-- CreateIndex
CREATE INDEX "CardDraw_articleId_idx" ON "CardDraw"("articleId");

-- CreateIndex
CREATE INDEX "CardDraw_createdAt_idx" ON "CardDraw"("createdAt");

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPoint" ADD CONSTRAINT "UserPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

