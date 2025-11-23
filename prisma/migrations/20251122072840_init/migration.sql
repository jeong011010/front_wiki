-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArticleLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "fromArticleId" TEXT NOT NULL,
    "toArticleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleLink_fromArticleId_fkey" FOREIGN KEY ("fromArticleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleLink_toArticleId_fkey" FOREIGN KEY ("toArticleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_title_key" ON "Article"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_title_idx" ON "Article"("title");

-- CreateIndex
CREATE INDEX "ArticleLink_fromArticleId_idx" ON "ArticleLink"("fromArticleId");

-- CreateIndex
CREATE INDEX "ArticleLink_toArticleId_idx" ON "ArticleLink"("toArticleId");

-- CreateIndex
CREATE INDEX "ArticleLink_keyword_idx" ON "ArticleLink"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLink_fromArticleId_toArticleId_keyword_key" ON "ArticleLink"("fromArticleId", "toArticleId", "keyword");
