`~/projects/the-greenhouse` E2E 시각 검증을 진행해줘.

<instructions>
agent-browser로 `http://localhost:4321`에 접속해서 아래 11개 시나리오를 순서대로 검증해.
각 시나리오마다 스크린샷을 찍고 PASS/FAIL을 판정해.

시나리오 실행 전 dev 서버가 떠있는지 확인하고, 안 떠있으면 `cd ~/projects/the-greenhouse && npm run dev`로 띄워줘.

검증 시 다음 기준으로 판정해:
- 요소가 화면에 보이면 PASS
- 인터랙션(클릭, 호버, 스크롤) 후 기대한 시각적 변화가 있으면 PASS
- 요소가 없거나 기대한 변화가 없으면 FAIL, 구체적 증상을 기록해

스크린샷은 각 시나리오의 핵심 상태를 캡처해.
</instructions>

<scenarios>
<scenario id="1" name="다크모드 토글">
1. `http://localhost:4321` 접속
2. 네비게이션 바 우측에서 테마 토글 아이콘 찾아서 클릭 (sun → moon → monitor 순환)
3. 다크모드에서 페이지 배경이 어두운 녹색-검정 계열로 변하는지 확인
4. 페이지 새로고침 → 테마가 유지되는지 확인
5. 스크린샷: 라이트 모드 1장, 다크 모드 1장
</scenario>

<scenario id="2" name="모바일 메뉴">
1. 뷰포트를 375px 너비로 리사이즈
2. 햄버거 아이콘(3줄)이 보이는지 확인
3. 햄버거 클릭 → 드로어가 슬라이드 다운 + 아이콘이 X로 변하는지 확인
4. X 클릭 → 드로어 닫힘 확인
5. 스크린샷: 드로어 열린 상태 1장
6. 뷰포트를 원래 크기로 복원
</scenario>

<scenario id="3" name="검색 (Pagefind)">
1. `/search/` 이동
2. 검색 입력란에 "AI" 타이핑
3. 검색 결과가 나타나는지 확인 (포스트 제목이 표시되어야 함)
4. 스크린샷: 검색 결과 1장
</scenario>

<scenario id="4" name="태그 필터링">
1. `/flora/` 이동
2. 포스트 목록 위에 태그 버튼들이 보이는지 확인
3. 아무 태그 버튼 1개 클릭 → 해당 태그 포스트만 남고 나머지 페이드아웃 확인
4. 같은 태그 다시 클릭 → 전체 포스트 복원 확인
5. 스크린샷: 필터 적용 상태 1장
</scenario>

<scenario id="5" name="읽기 시간">
1. `/flora/` 에서 PostCard에 날짜 옆 "· N min" 텍스트 확인
2. 아무 포스트 클릭 → 상세 페이지 헤더에도 읽기 시간 확인
3. 스크린샷: 포스트 상세 헤더 1장
</scenario>

<scenario id="6" name="목차 (ToC)">
1. Flora 포스트 상세 페이지에서 우측 사이드바에 "목차" 블록 확인
2. 목차 링크 클릭 → 해당 heading 위치로 스크롤 확인
3. 페이지를 천천히 스크롤 → 활성 heading에 인디케이터 바가 이동하는지 확인
4. 스크린샷: ToC 활성 상태 1장
</scenario>

<scenario id="7" name="스크롤 진행률 바">
1. Flora 포스트 상세 페이지 최상단에서 시작
2. 페이지 절반까지 스크롤
3. 화면 최상단에 가로 진행률 바가 약 50% 채워져 있는지 확인
4. 스크린샷: 진행률 바 보이는 상태 1장
</scenario>

<scenario id="8" name="View Transitions">
1. 홈 (`/`) 에서 Flora 링크 클릭
2. 페이지 전환 시 크로스페이드 효과가 있는지 확인
3. 전환 중 네비게이션 바가 사라지지 않고 유지되는지 확인
4. 스크린샷 불필요 — 육안 판정
</scenario>

<scenario id="9" name="PostCard 호버 리프트">
1. `/flora/` 에서 PostCard 위에 마우스 호버
2. 카드가 위로 살짝 올라가면서 그림자가 커지는지 확인
3. 스크린샷: 호버 상태 1장
</scenario>

<scenario id="10" name="404 페이지">
1. `/this-page-does-not-exist/` 접속
2. "404" 큰 숫자 + "이 페이지는 아직 싹이 트지 않았습니다." 메시지 확인
3. Flora, Nursery, Seeds 섹션 링크 3개 확인
4. 요소들이 아래에서 위로 순차적으로 나타나는지 확인 (sprout 애니메이션)
5. 스크린샷: 404 전체 1장
</scenario>

<scenario id="11" name="ContactForm 접근성 + 다크모드">
1. `/gardener/` 이동
2. Name, Email, Message 폼 필드 3개 확인
3. Name 필드 클릭 → border가 sage 색으로 부드럽게 전환되는지 확인
4. 테마 토글로 다크모드 전환 → 폼이 정상적으로 보이는지 확인 (글자색, 배경색 대비)
5. 스크린샷: 다크모드 폼 1장
</scenario>
</scenarios>

<output_format>
모든 시나리오 완료 후 아래 형식으로 결과를 정리해:

## E2E 테스트 결과

| # | 시나리오 | 결과 | 비고 |
|---|---------|------|------|
| 1 | 다크모드 토글 | PASS/FAIL | |
| 2 | 모바일 메뉴 | PASS/FAIL | |
| 3 | 검색 | PASS/FAIL | |
| 4 | 태그 필터링 | PASS/FAIL | |
| 5 | 읽기 시간 | PASS/FAIL | |
| 6 | 목차 | PASS/FAIL | |
| 7 | 스크롤 진행률 | PASS/FAIL | |
| 8 | View Transitions | PASS/FAIL | |
| 9 | 호버 리프트 | PASS/FAIL | |
| 10 | 404 페이지 | PASS/FAIL | |
| 11 | ContactForm | PASS/FAIL | |

통과: N/11
실패: N/11

### 실패 상세
(실패한 시나리오가 있으면 구체적 증상, 스크린샷 참조, 예상 원인 기록)

### 후속 조치
(실패 항목에 대한 수정 방향 제안)
</output_format>

<follow_up>
E2E 검증 통과 후, 통과한 시나리오를 기반으로 Playwright 스크립트를 `tests/e2e/`에 작성해서 CI에서 반복 실행 가능하게 전환해.
</follow_up>
