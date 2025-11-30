# 카드 티어 시스템 및 글 속성 추가

## 개요
글의 참여도와 인기도를 측정하여 카드 티어를 동적으로 결정하는 시스템을 구축합니다. 댓글, 추천, 조회수, 참조 글 개수 등의 속성을 추가하고, 이를 기반으로 티어를 계산합니다. 또한 글 기여 시스템을 구현하여 커뮤니티 참여를 활성화합니다.

## 목표
- 글의 참여도와 인기도를 측정할 수 있는 속성 추가
- 동적 티어 계산 시스템 구현
- 댓글 및 추천 기능 구현 (로그인 필수)
- 글 기여 시스템 구현 (검토 및 승인 프로세스)
- 기여자에게 카드 소유 권한 부여

## 작업 범위

### 1. 데이터베이스 스키마 확장

#### 1.1 Article 모델 속성 추가
- [ ] `views` (Int, 기본값 0): 조회수
- [ ] `likes` (Int, 기본값 0): 추천 수
- [ ] `commentsCount` (Int, 기본값 0): 댓글 수 (실제 댓글 개수와 동기화)
- [ ] `referencedCount` (Int, 기본값 0): 이 글을 참조하는 글 개수

#### 1.2 Comment 모델 생성
- [ ] `id` (String, @id, @default(uuid))
- [ ] `content` (String): 댓글 내용
- [ ] `articleId` (String): 글 ID (Article과 관계)
- [ ] `authorId` (String): 작성자 ID (User와 관계)
- [ ] `createdAt` (DateTime, @default(now))
- [ ] `updatedAt` (DateTime, @updatedAt)
- [ ] `deletedAt` (DateTime?): 소프트 삭제
- [ ] `article` (Article, 관계)
- [ ] `author` (User, 관계)

#### 1.3 Like 모델 생성
- [ ] `id` (String, @id, @default(uuid))
- [ ] `articleId` (String): 글 ID (Article과 관계)
- [ ] `userId` (String): 사용자 ID (User와 관계)
- [ ] `createdAt` (DateTime, @default(now))
- [ ] `article` (Article, 관계)
- [ ] `user` (User, 관계)
- [ ] `@@unique([articleId, userId])`: 한 사용자는 한 글에 한 번만 추천 가능

#### 1.4 ArticleContribution 모델 생성
- [ ] `id` (String, @id, @default(uuid))
- [ ] `articleId` (String): 원본 글 ID (Article과 관계)
- [ ] `contributorId` (String): 기여자 ID (User와 관계)
- [ ] `type` (Enum): 기여 유형 (CONTENT_UPDATE, CONTENT_ADDITION, CORRECTION, etc.)
- [ ] `content` (String): 기여 내용 (변경된 마크다운 또는 변경 사항 설명)
- [ ] `status` (Enum): 상태 (PENDING, APPROVED, REJECTED)
- [ ] `reviewerId` (String?): 검토자 ID (User와 관계, nullable)
- [ ] `reviewedAt` (DateTime?): 검토 일시
- [ ] `reviewComment` (String?): 검토 코멘트
- [ ] `createdAt` (DateTime, @default(now))
- [ ] `updatedAt` (DateTime, @updatedAt)
- [ ] `article` (Article, 관계)
- [ ] `contributor` (User, 관계)
- [ ] `reviewer` (User?, 관계, nullable)

#### 1.5 ArticleOwner 모델 확장 (기여자 포함)
- [ ] `ArticleOwner` 모델에 `isContributor` (Boolean, 기본값 false) 필드 추가
- [ ] 기여가 승인되면 해당 기여자에게 카드 소유 권한 부여

#### 1.6 Article 모델 관계 추가
- [ ] `comments` (Comment[], 관계)
- [ ] `likes` (Like[], 관계)
- [ ] `contributions` (ArticleContribution[], 관계)
- [ ] `referencedBy` (Article[], 관계): 이 글을 참조하는 글들

### 2. 티어 계산 시스템 개선

#### 2.1 `lib/tier-calculator.ts` 확장
- [ ] 댓글 수 가중치 추가
- [ ] 추천 수 가중치 추가
- [ ] 조회수 가중치 추가
- [ ] 참조 글 개수 가중치 추가
- [ ] 가중치 조정 가능한 설정 파일 또는 환경 변수
- [ ] 티어 계산 공식 문서화

#### 2.2 티어 계산 공식 예시
```
점수 = (댓글 수 × 10) + (추천 수 × 5) + (조회수 × 0.1) + (참조 글 개수 × 20)
티어 = 
  - 점수 >= 1000: 전설 (devops)
  - 점수 >= 500: 레전드 (backend)
  - 점수 >= 200: 에픽 (cloud)
  - 점수 >= 50: 희귀 (frontend)
  - 점수 < 50: 일반 (general)
```

### 3. 댓글 시스템 구현

#### 3.1 API 엔드포인트
- [ ] `POST /api/articles/[slug]/comments`: 댓글 작성 (로그인 필수)
- [ ] `GET /api/articles/[slug]/comments`: 댓글 목록 조회
- [ ] `PUT /api/articles/[slug]/comments/[id]`: 댓글 수정 (작성자만)
- [ ] `DELETE /api/articles/[slug]/comments/[id]`: 댓글 삭제 (작성자 또는 관리자)
- [ ] 댓글 작성 시 `Article.commentsCount` 자동 증가
- [ ] 댓글 삭제 시 `Article.commentsCount` 자동 감소

#### 3.2 댓글 UI 컴포넌트
- [ ] `components/ArticleComments.tsx`: 댓글 목록 표시
- [ ] `components/CommentForm.tsx`: 댓글 작성 폼
- [ ] `components/CommentItem.tsx`: 개별 댓글 아이템
- [ ] 로그인하지 않은 사용자에게는 로그인 유도 메시지 표시
- [ ] 댓글 작성자 정보 표시 (프로필 이미지, 이름)
- [ ] 댓글 작성/수정/삭제 시간 표시

#### 3.3 글 상세 페이지에 댓글 섹션 추가
- [ ] `app/articles/[slug]/page.tsx`에 댓글 섹션 통합
- [ ] 댓글 작성 폼 (로그인 필수)
- [ ] 댓글 목록 표시
- [ ] 무한 스크롤 또는 페이지네이션

### 4. 추천 시스템 구현

#### 4.1 API 엔드포인트
- [ ] `POST /api/articles/[slug]/like`: 추천 추가/취소 (토글, 로그인 필수)
- [ ] `GET /api/articles/[slug]/like`: 현재 사용자의 추천 상태 확인
- [ ] 추천 추가 시 `Article.likes` 자동 증가
- [ ] 추천 취소 시 `Article.likes` 자동 감소
- [ ] 중복 추천 방지 (한 사용자는 한 글에 한 번만)

#### 4.2 추천 UI 컴포넌트
- [ ] `components/ArticleLikeButton.tsx`: 추천 버튼
- [ ] 추천 수 표시
- [ ] 추천 상태에 따른 버튼 스타일 변경 (추천됨/추천 안 됨)
- [ ] 로그인하지 않은 사용자에게는 로그인 유도 메시지

#### 4.3 글 상세 페이지에 추천 버튼 추가
- [ ] `app/articles/[slug]/page.tsx`에 추천 버튼 통합
- [ ] `components/ArticleCard.tsx`에 추천 수 표시 (선택사항)

### 5. 조회수 시스템 구현

#### 5.1 조회수 증가 로직
- [ ] `GET /api/articles/[slug]` 호출 시 조회수 증가
- [ ] 중복 조회 방지 (같은 사용자가 짧은 시간 내 여러 번 조회해도 1회로 카운트)
- [ ] 쿠키 또는 세션 기반 중복 방지
- [ ] 또는 IP + User-Agent 기반 중복 방지

#### 5.2 조회수 표시
- [ ] 글 상세 페이지에 조회수 표시
- [ ] `components/ArticleCard.tsx`에 조회수 표시 (선택사항)

### 6. 참조 글 개수 계산

#### 6.1 참조 관계 추적
- [ ] `lib/link-detector.ts`의 `detectKeywords` 함수 활용
- [ ] 글 A가 글 B의 제목을 포함하면, 글 B의 `referencedCount` 증가
- [ ] 글 A가 삭제되거나 수정되어 참조가 사라지면 `referencedCount` 감소
- [ ] 배치 작업으로 주기적으로 참조 관계 재계산 (선택사항)

#### 6.2 API 엔드포인트
- [ ] `GET /api/articles/[slug]/referenced-by`: 이 글을 참조하는 글 목록
- [ ] 참조 글 개수는 `Article.referencedCount`에서 조회

### 7. 글 기여 시스템 구현

#### 7.1 기여 작성 UI
- [ ] `components/ArticleContributionForm.tsx`: 기여 작성 폼
- [ ] 기여 유형 선택 (내용 수정, 내용 추가, 오류 수정 등)
- [ ] 변경 사항 설명 입력
- [ ] 변경된 마크다운 내용 입력 (선택사항)
- [ ] 글 상세 페이지에 "기여하기" 버튼 추가

#### 7.2 기여 API 엔드포인트
- [ ] `POST /api/articles/[slug]/contributions`: 기여 제출 (로그인 필수)
- [ ] `GET /api/articles/[slug]/contributions`: 기여 목록 조회
- [ ] `GET /api/articles/[slug]/contributions/[id]`: 기여 상세 조회
- [ ] `PUT /api/admin/contributions/[id]/approve`: 기여 승인 (관리자만)
- [ ] `PUT /api/admin/contributions/[id]/reject`: 기여 거부 (관리자만)
- [ ] 기여 승인 시 원본 글에 변경 사항 적용
- [ ] 기여 승인 시 기여자에게 카드 소유 권한 부여 (`ArticleOwner` 생성)

#### 7.3 기여 검토 시스템
- [ ] `app/admin/review/contributions/page.tsx`: 기여 검토 페이지
- [ ] 기여 목록 표시 (대기 중, 승인됨, 거부됨)
- [ ] 기여 상세 보기 (원본 글과 비교)
- [ ] 기여 승인/거부 기능
- [ ] 검토 코멘트 작성

#### 7.4 기여 알림 시스템 (선택사항)
- [ ] 기여 제출 시 관리자에게 알림
- [ ] 기여 승인/거부 시 기여자에게 알림

### 8. 카드 소유 권한 시스템 확장

#### 8.1 기여자 소유 권한
- [ ] 기여가 승인되면 자동으로 `ArticleOwner` 생성
- [ ] `isContributor` 플래그 설정
- [ ] 기여자도 카드 소유자로 표시

#### 8.2 소유자 표시 UI
- [ ] `components/ArticleCard.tsx`에 소유자 정보 표시
- [ ] 원작자와 기여자 구분 표시
- [ ] 마이페이지에서 기여로 획득한 카드 표시

### 9. 성능 최적화

#### 9.1 조회수 증가 최적화
- [ ] 조회수 증가를 비동기로 처리 (큐 또는 배치)
- [ ] Redis를 사용한 조회수 캐싱 (선택사항)

#### 9.2 댓글/추천 수 실시간 업데이트
- [ ] 댓글/추천 추가 시 실시간으로 카운트 업데이트
- [ ] 티어 재계산은 배치 작업으로 처리 (선택사항)

#### 9.3 인덱스 추가
- [ ] `Comment.articleId` 인덱스
- [ ] `Comment.authorId` 인덱스
- [ ] `Like.articleId` 인덱스
- [ ] `Like.userId` 인덱스
- [ ] `ArticleContribution.articleId` 인덱스
- [ ] `ArticleContribution.status` 인덱스

### 10. 마이그레이션 및 데이터 초기화

#### 10.1 Prisma 마이그레이션
- [ ] 새로운 모델 및 필드 추가 마이그레이션 생성
- [ ] 기존 데이터 마이그레이션 (필요 시)
- [ ] 인덱스 추가 마이그레이션

#### 10.2 초기 데이터 설정
- [ ] 기존 글의 `views`, `likes`, `commentsCount`, `referencedCount` 초기화
- [ ] 참조 관계 재계산 스크립트 작성

## 기술 스택
- **데이터베이스**: Prisma + Supabase (PostgreSQL)
- **인증**: JWT (로그인 필수 기능)
- **API**: Next.js API Routes
- **UI**: React + TypeScript

## 우선순위
1. **High**: 데이터베이스 스키마 확장, 티어 계산 시스템 개선
2. **High**: 댓글 시스템 구현
3. **High**: 추천 시스템 구현
4. **Medium**: 조회수 시스템 구현
5. **Medium**: 참조 글 개수 계산
6. **Medium**: 글 기여 시스템 구현
7. **Low**: 성능 최적화, 알림 시스템

## 예상 작업 시간
- 데이터베이스 스키마 확장: 2-3시간
- 티어 계산 시스템 개선: 1-2시간
- 댓글 시스템: 4-6시간
- 추천 시스템: 2-3시간
- 조회수 시스템: 1-2시간
- 참조 글 개수 계산: 2-3시간
- 글 기여 시스템: 6-8시간
- 성능 최적화: 2-3시간
- **총 예상 시간**: 20-30시간

## 참고 사항
- 모든 사용자 입력에 대한 검증 및 sanitization 필요
- 댓글 및 기여 내용에 대한 XSS 방지
- 로그인 필수 기능에 대한 인증 미들웨어 적용
- 관리자 권한 검증 필요
- 기여 승인 시 원본 글 백업 고려 (선택사항)

