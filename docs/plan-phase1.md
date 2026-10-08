# hyebin.dev 1차 작업 계획

기준 문서: [hyebin.dev 블로그 기획서](https://claude.ai/code/artifact/51189cf4-db64-40f2-ac12-ae267da4893c) (rev 11, 2026-10-08)

**목표: 기획서 1차 범위가 실제 GitHub Pages URL `https://hyebinhwang1.github.io/hyebin-bblog/`에서 동작하는 것을 확인한다.**
2차·이후 항목(커스텀 도메인, 다크모드 토글, RSS, 댓글, 태그 페이지, 검색, 키보드 카드 조작)은 넣지 않는다.

---

## 0. 확정된 결정 (2026-10-08)

| 항목 | 결정 | 기획서와 다른 점 |
| --- | --- | --- |
| 저장소 | `HyebinHwang1/hyebin-bblog` 유지 → 프로젝트 페이지, `base: '/hyebin-bblog'` | 기획서는 `hyebinhwang1.github.io` + base 없음 |
| 배포 브랜치 | `master` push 시 배포 | 기획서는 `main` |
| 원본 사진 | `.context/attachments/mYCQc4/IMG_5398 2.HEIC` (커밋하지 않음, 참고용) | 시안 three.js 코드 없음 → 처음부터 구현 |
| 키보드 카드 조작 | 1차에서 제외 (Enter 열기 포함) | 품질 기준표의 "카드 키보드 조작" 삭제, 내비만 남김 |
| 컬러 | 기획서 토큰 그대로 | 라이트 muted(3.23:1)·teal-deep(3.99:1)은 대비 미달로 둠 → Lighthouse 접근성 100 대신 "대비 외 항목 통과" |
| 3D 청크 예산 | gzip **400KB** 이하 | 기획서는 200KB |
| 3D 방향 | R3F + drei, 예산 안에서 최대한 예쁘게 | — |
| 글 URL | 파일명 날짜 접두사 제거: `2026-09-21-slug.md` → `/hyebin-bblog/posts/slug/` | — |
| 그 외 결정할 것들 | 한국어만, hover 3% 확대 유지, 글 하단 About 링크 없음 | — |
| 첫 글 | 1차에서 만들지 않음. 글이 없으면 목록에 빈 상태 문구 | 1차 완료 기준 "첫 글 1편 발행" 보류 |
| 브이 손 | 화면 왼쪽(캐릭터 오른손), 시계도 같은 손목 | 사진과 좌우 반대 |
| 가슴 로고 | 글자 없는 흰 패치 | — |
| 움직임 | 숨쉬기·고개 갸웃·깜빡임·브이 손 흔들기. reduced-motion이면 정지 | 기획서는 "가만히 서 있음" |
| 프레임워크 버전 | Astro 7, three 0.182 고정 | 기획서는 Astro 5. three r183부터 R3F 9.8이 쓰는 `THREE.Clock`이 콘솔 경고를 내서 0.182에 고정 |
| 배포 워크플로우 | `withastro/action` 대신 직접 단계 구성 (check·lint·test·글 페이지 JS 0 체크 포함) | — |
| About·카드 문구 | 임시 문구 (`src/data/profile.ts`, `src/data/cards.ts`). 메일 링크는 주소를 받을 때까지 뺌 | — |

---

## 1. 작업 순서

```
T1 셋업 → T2 배포(빈 페이지 실배포) → T3 토큰·레이아웃 ─┬→ T4 글 로직 → T5 목록·상세 ─┐
                                                       └→ T6 About 정적 → T7 3D → T8 카드 ─┴→ T9 실배포 검증
```

T2에서 빈 페이지를 먼저 실제 Pages에 올린다. base 경로, Pages 설정, 권한 문제를 콘텐츠가 없을 때 잡기 위해서다.

공통 검증 (모든 태스크): `pnpm check`(타입 에러 0) · `pnpm lint`(에러 0) · `pnpm test` · `pnpm build` 통과. UI가 바뀌는 태스크는 Playwright로 `pnpm preview` 화면을 열어 콘솔 error/warning 0, 네트워크 실패 0까지 확인한다.

---

## 2. 태스크

### T1. 프로젝트 셋업

- Astro 5 + TypeScript strict, pnpm, Node 22
- 통합: `@astrojs/react`(React 19), Tailwind 4(`@tailwindcss/vite`), `@astrojs/sitemap`
- ESLint(`eslint-plugin-astro`, typescript-eslint), Vitest
- 스크립트: `dev` `build` `preview` `check` `lint` `test`

**검증:** 공통 검증 4개 명령이 빈 프로젝트에서 통과

### T2. 배포 파이프라인 + 빈 페이지 실배포

- `.github/workflows/deploy.yml`: `withastro/action` 빌드 → `actions/deploy-pages` 배포, `master` push에서만
- PR에서는 check + lint + test + build만 실행
- `astro.config.mjs`: `site: 'https://hyebinhwang1.github.io'`, `base: '/hyebin-bblog'`, `trailingSlash: 'always'`
- 내부 링크·에셋 경로는 모두 `import.meta.env.BASE_URL` 기준으로 만든다 (base 누락 404 방지)
- 저장소 Pages 소스를 "GitHub Actions"로 설정

**검증:** 빈 페이지가 `https://hyebinhwang1.github.io/hyebin-bblog/`에서 열림. CSS·파비콘 요청이 404 없이 base 경로로 나감

### T3. 디자인 토큰 · Base 레이아웃 · 내비 · 푸터

- `styles/tokens.css`: 기획서 토큰 10개, `prefers-color-scheme: dark`로 전환, Tailwind 4 `@theme` 연결
- IBM Plex Sans KR 400·500·600 셀프 호스팅(`@fontsource`)
- 본문 16px / 1.7, 제목 letter-spacing -0.02em, 본문 폭 34~40자
- 반경: 스테이지 24px, 카드 16px, 그 외 0
- `Nav.astro`: 상단 고정, 현재 섹션 틸 밑줄 (홈은 IntersectionObserver 인라인 스크립트, 글 상세는 Blog 정적 활성)

**검증:** 라이트/다크 각각 확인. 360px에서 가로 스크롤 없음. 탭 키로 내비 이동, 포커스 링 보임

### T4. 콘텐츠 컬렉션 · 글 로직 (테스트 먼저)

- zod 스키마: `title`, `date`, `summary` 필수, `tags` 기본 `[]`, `draft` 기본 `false`
- 실패하는 테스트 → 구현 순서로:
  - 파일명 → slug (날짜 접두사 제거, 형식이 틀리면 빌드 실패)
  - 공개 글 목록 (draft 제외, 날짜 내림차순, 같은 날짜는 파일명 순)
  - 이전·다음 글 (첫 글·마지막 글·1편일 때 경계)
  - 날짜 표기

**검증:** 테스트가 먼저 실패한 뒤 통과. `summary`가 빠진 글로 빌드하면 실패

### T5. Blog 목록 · 글 상세

- 목록: 날짜 · 제목 · 한 줄 요약, 최신순, 태그 열 자리만 확보
- 상세: 제목, 날짜, 본문, 이전·다음 글. Shiki 듀얼 테마
- 표·이미지·코드 블록 스타일 (코드 블록만 내부 가로 스크롤)
- CI 체크: 빌드 후 글 상세 HTML에 `<script`가 있으면 실패

**검증:** 긴 코드·표가 있는 샘플 글로 360px·데스크톱 확인. JS 비활성 상태에서 글 전체가 읽힘

### T6. About 정적 부분

- 직군, 한 줄 소개, 2~3문단, GitHub·메일 링크
- 캐릭터 스테이지에 **폴백 PNG를 기본 내용으로** 렌더하고, 3D 로드 후 교체 (JS 없음·WebGL 실패에도 같은 구도, LCP는 PNG가 담당)
- 스테이지 크기 고정으로 레이아웃 이동 없음, 360px에서 1열

**검증:** JS 비활성 상태에서 PNG와 소개 문구가 보임

### T7. 3D 캐릭터

원본 사진 기준 착장·포즈:

| 항목 | 사진에서 확인한 것 | 구현 |
| --- | --- | --- |
| 상의 | 검정 오버핏 반팔 티, 왼쪽 가슴에 흰 로고 | 넓은 RoundedBox 몸통 + 짧은 소매, 흰 로고 패치 |
| 하의 | 검정 와이드 바지, 발목까지 | 약간 넓어지는 실린더 |
| 신발 | 검정 운동화, 흰 밑창 | RoundedBox 2단 |
| 머리 | 짧은 다크브라운, 앞머리 내림 | 구 + 앞머리 볼륨 |
| 표정 | 웃는 눈(아치), 웃는 입, 양볼 홍조 | 토러스 조각 + 반투명 원 |
| 포즈 | 정면, 한 손 브이, 같은 손목에 검정 시계, 다른 팔은 내림 | 브이 손은 사진처럼 화면 오른쪽 |

"최대한 예쁘게" 위해 쓰는 것 (예산 400KB 안):

- 각진 박스 대신 RoundedBox·Capsule로 둥근 실루엣, 머리 비율을 키운 치비 스타일
- `MeshStandardMaterial` 낮은 금속성 + 높은 거칠기로 천 질감, ACES 톤매핑
- 반구광 + 따뜻한 직사광(늦은 오후) + 뒤쪽 림라이트로 검정 옷 윤곽 살리기
- 바닥은 틸 18% 원 + drei `ContactShadows`
- 외부 HDR·모델 파일 없음 (CDN 요청 0)

진행:

1. 빈 Canvas로 청크 크기 먼저 측정
2. 캐릭터 조립 → 사진과 나란히 놓고 비교 스크린샷
3. hover 3% 확대 + 포인터 커서, reduced-motion이면 끔
4. WebGL 미지원 감지 + 에러 바운더리 → PNG 유지
5. 완성된 캐릭터를 같은 구도로 캡처해 `public/character-fallback.png` 생성

**검증:** 3D 청크 gzip 400KB 이하, About이 뷰포트에 들어올 때만 요청, 글 상세에서는 요청 없음. WebGL을 끈 브라우저에서 PNG 표시, 콘솔 에러 없음

### T8. 소개 카드 3장 (테스트 먼저)

- 캐릭터 위 HTML 오버레이, 소개 → 일하는 방식 → 요즘 하는 일
- 상태 로직을 순수 reducer로 분리하고 테스트 먼저:
  - 닫힘 → 캐릭터 클릭 → 1번 카드
  - 다음: 1 → 2 → 3 → 1
  - 닫기 버튼, 캐릭터 밖 클릭 → 닫힘
- 카드 문구는 데이터 파일 하나로 분리
- 등장 전환은 reduced-motion에서 끔

**검증:** reducer 테스트 통과. Playwright로 클릭 → 3장 순환 → 닫기 플로우 확인

### T9. 실배포 검증 (최종 목표)

master 머지 후 Actions 배포가 끝나면 **실제 URL에서** 확인한다.

- [ ] `https://hyebinhwang1.github.io/hyebin-bblog/`에서 About + Blog 목록이 열림
- [ ] 글 상세가 열리고, 이전·다음 글 링크가 base 경로 포함해 동작
- [ ] 3D 캐릭터가 뜨고, 클릭하면 카드 3장이 넘어감
- [ ] 글 상세에서 JS 0KB, 3D 청크 미요청
- [ ] 3D 청크 gzip 400KB 이하
- [ ] 360px 가로 스크롤 없음
- [ ] 라이트·다크 둘 다 깨지지 않음
- [ ] 콘솔 error/warning 0, 네트워크 404 0
- [ ] Lighthouse 모바일 성능 90 이상, 접근성은 색 대비 외 항목 통과
- [ ] 새 마크다운 글 1편을 커밋 → master 반영 → 자동으로 목록에 뜸

---

## 3. 1차 완료 기준 ↔ 태스크

| 완료 기준 | 태스크 |
| --- | --- |
| About + Blog 목록 + 글 상세가 GitHub Pages에서 열린다 | T2, T5, T6, T9 |
| 3D 캐릭터가 정면으로 서 있고, 클릭하면 소개 카드 3장이 넘어간다 | T7, T8, T9 |
| 마크다운 파일을 커밋하면 글이 자동 배포된다 | T2, T4, T9 |
| 모바일에서 가로 스크롤 없이 읽힌다 | T3, T5, T9 |
| 첫 글 1편 발행 | T9 |
