# Vercel 배포 문제 해결 가이드

## 🔴 문제: GitHub main 브랜치 갱신이 Vercel에 반영되지 않음

### 가능한 원인

1. **GitHub 저장소 이름 변경**
   - 저장소 이름이 `kimjazz_blog`에서 `front_wiki`로 변경되었을 수 있음
   - Vercel 프로젝트가 이전 저장소 이름을 가리키고 있을 수 있음

2. **GitHub Webhook 문제**
   - Vercel과 GitHub 간의 webhook 연결이 끊어졌을 수 있음
   - GitHub에서 webhook이 비활성화되었을 수 있음

3. **Vercel 프로젝트 설정 문제**
   - Production 브랜치가 `main`으로 설정되지 않았을 수 있음
   - 자동 배포가 비활성화되었을 수 있음

4. **Vercel 프로젝트가 다른 저장소를 가리킴**
   - 프로젝트가 다른 GitHub 저장소를 연결하고 있을 수 있음

## 🛠️ 해결 방법

### 방법 1: Vercel 프로젝트 설정 확인 및 수정

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `front-wiki` 또는 `kimjazz_blog` 프로젝트 선택

3. **Settings → Git 확인**
   - **Repository**: 올바른 저장소를 가리키는지 확인
     - 예상: `jeong011010/front_wiki` 또는 `jeong011010/kimjazz_blog`
   - **Production Branch**: `main`으로 설정되어 있는지 확인
   - **Automatic deployments**: 활성화되어 있는지 확인

4. **저장소 이름이 변경된 경우**
   - **Disconnect** 클릭
   - **Connect Git Repository** 클릭
   - 새로운 저장소 이름(`front_wiki`) 선택
   - **Import** 클릭

### 방법 2: GitHub Webhook 재설정

1. **GitHub 저장소 접속**
   - https://github.com/jeong011010/front_wiki

2. **Settings → Webhooks**
   - Vercel webhook이 있는지 확인
   - webhook이 없다면 Vercel에서 자동으로 재생성됨 (프로젝트 재연결 시)

3. **Webhook이 있는 경우**
   - 최근 배송(Deliveries) 확인
   - 실패한 요청이 있는지 확인
   - 실패한 경우 webhook 삭제 후 Vercel에서 재연결

### 방법 3: 수동 배포 트리거

1. **Vercel Dashboard → Deployments**
2. **최신 배포 선택**
3. **"Redeploy" 버튼 클릭**
4. 또는 **"Deploy" → "Deploy from Git"** 선택

### 방법 4: Vercel CLI로 배포

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 프로젝트 디렉토리에서
vercel --prod
```

### 방법 5: GitHub 저장소 이름 확인 및 업데이트

1. **로컬에서 원격 저장소 확인**
   ```bash
   git remote -v
   ```

2. **저장소 이름이 변경된 경우 원격 URL 업데이트**
   ```bash
   git remote set-url origin https://github.com/jeong011010/front_wiki.git
   ```

3. **변경사항 푸시**
   ```bash
   git push origin main
   ```

## 📋 체크리스트

- [ ] Vercel 프로젝트가 올바른 GitHub 저장소를 가리키는지 확인
- [ ] Production 브랜치가 `main`으로 설정되어 있는지 확인
- [ ] 자동 배포가 활성화되어 있는지 확인
- [ ] GitHub webhook이 정상 작동하는지 확인
- [ ] 로컬 원격 저장소 URL이 올바른지 확인
- [ ] 최신 커밋이 GitHub main 브랜치에 푸시되었는지 확인

## 🔍 추가 디버깅

### Vercel 로그 확인

1. **Vercel Dashboard → 프로젝트 → Deployments**
2. **최신 배포 선택 → Logs 탭**
3. 빌드 에러나 배포 실패 원인 확인

### GitHub Actions 확인 (있는 경우)

1. **GitHub 저장소 → Actions 탭**
2. 최근 워크플로우 실행 확인
3. 실패한 워크플로우가 있는지 확인

## 💡 예방 방법

- 정기적으로 Vercel 프로젝트 설정 확인
- GitHub 저장소 이름 변경 시 Vercel 프로젝트도 업데이트
- 자동 배포가 활성화되어 있는지 확인


