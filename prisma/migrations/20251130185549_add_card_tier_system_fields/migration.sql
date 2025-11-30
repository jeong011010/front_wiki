-- AlterTable: Article에 새 필드 추가
ALTER TABLE "Article" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "commentsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "referencedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex: Article의 새 필드에 인덱스 추가
CREATE INDEX "Article_views_idx" ON "Article"("views");
CREATE INDEX "Article_likes_idx" ON "Article"("likes");
CREATE INDEX "Article_commentsCount_idx" ON "Article"("commentsCount");
CREATE INDEX "Article_referencedCount_idx" ON "Article"("referencedCount");

-- AlterTable: UserCard에 isContributor 필드 추가
ALTER TABLE "UserCard" ADD COLUMN "isContributor" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: UserCard의 isContributor에 인덱스 추가
CREATE INDEX "UserCard_isContributor_idx" ON "UserCard"("isContributor");

-- CreateTable: Comment 모델
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Comment 인덱스
CREATE INDEX "Comment_articleId_idx" ON "Comment"("articleId");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");
CREATE INDEX "Comment_deletedAt_idx" ON "Comment"("deletedAt");

-- AddForeignKey: Comment 관계
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Like 모델
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Like 인덱스
CREATE UNIQUE INDEX "Like_articleId_userId_key" ON "Like"("articleId", "userId");
CREATE INDEX "Like_articleId_idx" ON "Like"("articleId");
CREATE INDEX "Like_userId_idx" ON "Like"("userId");
CREATE INDEX "Like_createdAt_idx" ON "Like"("createdAt");

-- AddForeignKey: Like 관계
ALTER TABLE "Like" ADD CONSTRAINT "Like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum: ContributionType
CREATE TYPE "ContributionType" AS ENUM ('CONTENT_UPDATE', 'CONTENT_ADDITION', 'CORRECTION', 'IMPROVEMENT', 'OTHER');

-- CreateEnum: ContributionStatus
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: ArticleContribution 모델
CREATE TABLE "ArticleContribution" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "type" "ContributionType" NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ArticleContribution 인덱스
CREATE INDEX "ArticleContribution_articleId_idx" ON "ArticleContribution"("articleId");
CREATE INDEX "ArticleContribution_contributorId_idx" ON "ArticleContribution"("contributorId");
CREATE INDEX "ArticleContribution_status_idx" ON "ArticleContribution"("status");
CREATE INDEX "ArticleContribution_reviewerId_idx" ON "ArticleContribution"("reviewerId");
CREATE INDEX "ArticleContribution_createdAt_idx" ON "ArticleContribution"("createdAt");

-- AddForeignKey: ArticleContribution 관계
ALTER TABLE "ArticleContribution" ADD CONSTRAINT "ArticleContribution_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleContribution" ADD CONSTRAINT "ArticleContribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleContribution" ADD CONSTRAINT "ArticleContribution_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

