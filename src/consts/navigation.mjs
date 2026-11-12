// Shared destinations for desktop, mobile, home and the workspace index.
export const PRIMARY_LINKS = [
  { label: '글', href: '/' },
  { label: '음악', href: '/topics/music/', activePaths: '/topics/music/ /music/ /music-tiers/' },
  { label: '작업실', href: '/workbench/' },
  { label: '글쓰기', href: '/write/', reload: true },
  { label: '소개', href: '/gardener/' },
];
export const QUICK_LINKS = [
  { label: '케이팝 감상', href: '/music/tiers/' },
  { label: '감상 작업실', href: '/music-tiers/studio/', reload: true },
  { label: '글쓰기', href: '/write/', reload: true },
  { label: '모든 도구', href: '/workbench/' },
];
export const WORKSPACE_GROUPS = [
  { title: '음악', items: [
    { label: '케이팝 감상', href: '/music/tiers/', description: '분기별 감상 목록과 티어, 곡별 한줄평을 확인합니다.' },
    { label: '감상 작업실', href: '/music-tiers/studio/', reload: true, description: '들은 곡 선택부터 평가·검수·백업·공유·내보내기까지.', note: '개인 작업은 이 브라우저에 저장됩니다. 공개 반영은 별도 절차입니다.' },
    { label: '음악 글', href: '/topics/music/', description: '음악에 관해 쓴 글을 모아 봅니다.' },
  ]},
  { title: '글쓰기와 발행', items: [
    { label: '글쓰기', href: '/write/', reload: true, description: 'Pages CMS에서 새 글을 쓰거나 기존 글을 이어 씁니다.' },
    { label: '초안 미리보기', href: '/preview/', description: '공개 미리보기를 켜고 저장한 초안을 실제 글 화면으로 확인합니다.', note: '링크를 아는 누구나 열 수 있는 미리보기입니다.' },
    { label: '배포 상태 확인', href: '/write/#publishing-status', reload: true, description: '저장한 변경이 블로그에 반영됐는지 확인합니다.' },
    { label: '미디어 삽입 도우미', href: '/write/#media-title', reload: true, description: 'Spotify·YouTube·GitHub 주소를 본문에 넣을 형식으로 바꿉니다.' },
  ]},
  { title: '글 찾아보기', items: [
    { label: '전체 글', href: '/', description: '주제와 날짜로 글을 찾아봅니다.' },
    { label: '긴 글 · Flora', href: '/flora/', description: '경험과 생각을 차분하게 풀어 쓴 글.' },
    { label: '짧은 기록 · Seeds', href: '/seeds/', description: '가볍게 남긴 생각과 순간.' },
    { label: '계속 다듬는 글 · Nursery', href: '/nursery/', description: '이어 가는 아이디어와 프로젝트.' },
    { label: '검색', href: '/search/', reload: true, description: '본문에 담긴 단어로 글을 찾습니다.' },
    { label: 'RSS 구독', href: '/rss.xml', reload: true, description: 'RSS 리더로 새 글을 받아 봅니다.' },
  ]},
  { title: '인터랙티브 데모', items: [
    { label: '토큰과 컨텍스트', href: '/demos/#token-flow', description: '컨텍스트 크기를 바꾸며 토큰 배분을 살펴봅니다.' },
    { label: 'API 요청 흐름', href: '/demos/#api-flow', description: '요청부터 응답까지의 단계를 시뮬레이션합니다.' },
  ]},
];
