-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArticleLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "fromArticleId" TEXT NOT NULL,
    "toArticleId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'auto',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleLink_fromArticleId_fkey" FOREIGN KEY ("fromArticleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleLink_toArticleId_fkey" FOREIGN KEY ("toArticleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ArticleLink" ("createdAt", "fromArticleId", "id", "keyword", "toArticleId") SELECT "createdAt", "fromArticleId", "id", "keyword", "toArticleId" FROM "ArticleLink";
DROP TABLE "ArticleLink";
ALTER TABLE "new_ArticleLink" RENAME TO "ArticleLink";
CREATE INDEX "ArticleLink_fromArticleId_idx" ON "ArticleLink"("fromArticleId");
CREATE INDEX "ArticleLink_toArticleId_idx" ON "ArticleLink"("toArticleId");
CREATE INDEX "ArticleLink_keyword_idx" ON "ArticleLink"("keyword");
CREATE INDEX "ArticleLink_relationType_idx" ON "ArticleLink"("relationType");
CREATE UNIQUE INDEX "ArticleLink_fromArticleId_toArticleId_keyword_key" ON "ArticleLink"("fromArticleId", "toArticleId", "keyword");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
