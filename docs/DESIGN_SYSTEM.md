# 디자인 시스템

프론트위키의 디자인 시스템 가이드입니다.

## 색상 시스템

### Primary Colors (메인 색상)

프로젝트의 주요 브랜드 색상입니다.

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Primary 900 | `#1a1a2e` | 가장 진한 primary, 텍스트, 포그라운드 |
| Primary 700 | `#16213e` | Primary 호버 상태 |
| Primary 500 | `#0f3460` | 기본 primary, 주요 버튼, 링크 |
| Primary 300 | `#533483` | 옅은 primary, 강조 색상 |

**사용 예시:**
- 주요 버튼: `bg-primary-500`
- 버튼 호버: `bg-primary-700`
- 텍스트: `text-primary-500`

### Secondary Colors (서브 색상)

보조 색상으로, 덜 중요한 요소에 사용됩니다.

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Secondary 900 | `#2d3436` | 가장 진한 secondary |
| Secondary 700 | `#636e72` | Secondary, 보조 텍스트 |
| Secondary 500 | `#b2bec3` | 기본 secondary |
| Secondary 300 | `#dfe6e9` | 옅은 secondary, 배경, 보조 버튼 |

**사용 예시:**
- 보조 버튼: `bg-secondary-300`
- 보조 텍스트: `text-text-secondary` (Secondary 700 사용)

### Background & Surface Colors

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Background | `#fafafa` | 페이지 배경 |
| Surface | `#ffffff` | 카드, 모달 배경 |
| Surface Hover | `#f8f9fa` | 호버 시 표면 색상 |

### Text Colors

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Text Primary | `#1a1a2e` | 주요 텍스트 (Primary 900) |
| Text Secondary | `#636e72` | 보조 텍스트 (Secondary 700) |
| Text Tertiary | `#b2bec3` | 3차 텍스트 (Secondary 500) |

### Link Colors

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Link | `#2563eb` | 링크 색상 (밝은 파란색) |
| Link Hover | `#1d4ed8` | 링크 호버 색상 |

### Badge Colors

관계 유형을 나타내는 배지 색상입니다.

| 배지 유형 | 배경 | 텍스트 | 사용 용도 |
|-----------|------|--------|----------|
| Primary | `#533483` | `#ffffff` | 부모-자식 관계 |
| Secondary | `#b2bec3` | `#1a1a2e` | 관련 관계 |
| Auto | `#dfe6e9` | `#2d3436` | 자동 생성 링크 |
| Reference | `#0f3460` | `#ffffff` | 참조 관계 |

### Danger Colors

위험한 작업(삭제 등)에 사용되는 색상입니다.

| 색상 | Hex | 사용 용도 |
|------|-----|----------|
| Red 600 | `#dc2626` | 삭제 버튼, 에러 메시지 |
| Red 700 | `#b91c1c` | 삭제 버튼 호버 |

## 타이포그래피

### 폰트 패밀리

- **Sans**: Geist Sans (기본 텍스트)
- **Mono**: Geist Mono (코드 블록)

### 제목 계층 구조

| 레벨 | 크기 | Font Weight | 사용 용도 |
|------|------|-------------|----------|
| H1 | `2xl md:text-3xl lg:text-4xl` | `bold` | 페이지 제목 |
| H2 | `xl md:text-2xl` | `bold` | 섹션 제목 |
| H3 | `lg md:text-xl` | `semibold` | 하위 섹션 제목 |
| H4 | `base md:text-lg` | `semibold` | 소제목 |
| H5 | `sm md:text-base` | `medium` | 작은 제목 |
| H6 | `text-sm` | `medium` | 가장 작은 제목 |

### 본문 텍스트

- **기본**: `text-base` (16px)
- **작은 텍스트**: `text-sm` (14px)
- **아주 작은 텍스트**: `text-xs` (12px)

### Line Height

- **제목**: `leading-tight` 또는 `leading-normal`
- **본문**: `leading-relaxed` (1.625)

## 컴포넌트

### Button

통일된 버튼 컴포넌트입니다.

**Variants:**
- `primary`: 주요 액션 (기본값)
- `secondary`: 보조 액션
- `danger`: 위험한 액션 (삭제 등)
- `ghost`: 투명 배경 버튼

**Sizes:**
- `sm`: 작은 버튼
- `md`: 기본 버튼 (기본값)
- `lg`: 큰 버튼

**사용 예시:**
```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="md">저장</Button>
<Button variant="secondary">취소</Button>
<Button variant="danger">삭제</Button>
<Button variant="ghost">더보기</Button>
```

### Input

통일된 입력 필드 컴포넌트입니다.

**Props:**
- `error`: 에러 상태 표시 (boolean)

**사용 예시:**
```tsx
import { Input } from '@/components/ui'

<Input type="email" placeholder="이메일" />
<Input type="password" error={hasError} />
```

### Card

통일된 카드 컴포넌트입니다.

**Variants:**
- `default`: 기본 배경
- `outlined`: 테두리 있는 카드
- `elevated`: 그림자 있는 카드

**Padding:**
- `none`: 패딩 없음
- `sm`: 작은 패딩
- `md`: 기본 패딩 (기본값)
- `lg`: 큰 패딩

**사용 예시:**
```tsx
import { Card } from '@/components/ui'

<Card variant="outlined" padding="md">
  <h2>카드 제목</h2>
  <p>카드 내용</p>
</Card>
```

## 간격 시스템

일관된 간격을 위해 다음 scale을 사용합니다:

- `4px` (0.25rem) - `gap-1`, `p-1`
- `8px` (0.5rem) - `gap-2`, `p-2`
- `12px` (0.75rem) - `gap-3`, `p-3`
- `16px` (1rem) - `gap-4`, `p-4`
- `24px` (1.5rem) - `gap-6`, `p-6`
- `32px` (2rem) - `gap-8`, `p-8`
- `48px` (3rem) - `gap-12`, `p-12`
- `64px` (4rem) - `gap-16`, `p-16`

## 그림자

| 이름 | 값 | 사용 용도 |
|------|-----|----------|
| sm | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | 작은 그림자 |
| md | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | 기본 그림자 |
| lg | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | 큰 그림자 |
| xl | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | 매우 큰 그림자 |

## 반응형 브레이크포인트

| 브레이크포인트 | 크기 | 사용 용도 |
|---------------|------|----------|
| sm | 640px | 모바일 가로 |
| md | 768px | 태블릿 |
| lg | 1024px | 데스크톱 |
| xl | 1280px | 큰 데스크톱 |
| 2xl | 1536px | 매우 큰 데스크톱 |

## 접근성

### 색상 대비

모든 텍스트는 WCAG AA 기준을 충족합니다:
- 일반 텍스트: 최소 4.5:1
- 큰 텍스트 (18px 이상): 최소 3:1

### 포커스 상태

모든 인터랙티브 요소는 명확한 포커스 인디케이터를 가집니다:
- `focus:ring-2 focus:ring-primary-500`

### 터치 영역

모바일에서 최소 44px × 44px의 터치 영역을 보장합니다.

---

**마지막 업데이트**: 2025-01-27

