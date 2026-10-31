export interface Comment {
  id: string;
  author: string;
  password?: string;
  content: string;
  createdAt: string;
  minutesAgo?: number; // 상대 시간 계산용
}

export interface Post {
  id: string;
  category: 'settlement' | 'tips' | 'feedback' | 'free';
  title: string;
  content: string;
  author: string;
  password?: string;
  views: number;
  likes: number;
  comments: Comment[];
  createdAt: string;
  minutesAgo?: number; // 오늘 기준 몇 분 전 글인지 (실시간 상대 시간 생성용)
  badge?: string; // 예: '인기', '추천', 'HOT'
}

export const CATEGORIES = [
  { id: 'all', label: '🔥 전체글' },
  { id: 'settlement', label: '💰 체험단 정산' },
  { id: 'tips', label: '💡 블로그 꿀팁 & Q&A' },
  { id: 'free', label: '☕ 자유수다' },
  { id: 'feedback', label: '✍️ Gifty에 바란다' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  settlement: '💰 체험단 정산',
  tips: '💡 블로그 팁',
  free: '☕ 자유수다',
  feedback: '✍️ 기능 건의',
};

// 현재 시각 기준 상대 시간 포맷터 (예: 12분 전, 1시간 전, 오늘 14:20, 어제)
export function formatTimeAgo(minutesAgo: number, absoluteDateStr?: string): string {
  if (minutesAgo < 1) return '방금 전';
  if (minutesAgo < 60) return `${minutesAgo}분 전`;
  
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}시간 전`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  
  return absoluteDateStr || `${days}일 전`;
}

// 100% 리얼 블로거들의 현실적이고 자연스러운 시드 게시글
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    category: 'settlement',
    title: '이번 달 체험단 밥값 64만원 방어 + 원고료 18만원 정산 완료! (가계부 인증)',
    content: `안녕하세요! 맛집이랑 카페 위주로 리뷰하는 블로거입니다.\n\n이번 달에 키프티 가계부 쓰면서 지출 적어봤는데, 평소 밥값으로 90만원씩 나가던 게 이번 달엔 20만원대로 뚝 떨어졌네요 ㅋㅋㅋ\n- 리뷰노트: 맛집 6건 (32만원 상당)\n- 레뷰: 레스토랑 3건 + 배송형 2건 (원고료 18만원)\n- 강남맛집: 카페 3건 (14만원 상당)\n\n초반엔 신청해도 광탈만 당해서 접을까 했는데, 글 쓸 때 키프티로 만든 고화질 보글보글 음식 움짤 2개씩 꼭 넣고 체류시간 늘리니까 선정률이 진짜 눈에 띄게 올랐습니다. 다들 포기하지 마시고 파이팅하세요!`,
    author: '맛동산블로거',
    views: 482,
    likes: 45,
    minutesAgo: 14, // 14분 전
    createdAt: '14분 전',
    badge: '인기',
    comments: [
      { id: 'c-1', author: '초보리뷰어', content: '우와 14건 대단하세요!! 원고료는 보통 신청하고 얼마 만에 입금되나요?', createdAt: '10분 전', minutesAgo: 10 },
      { id: 'c-2', author: '맛동산블로거', content: '플랫폼마다 다른데 보통 다음 달 15일이나 말일에 3.3% 사업소득세 떼고 깔끔하게 들어옵니다 ㅎㅎ', createdAt: '6분 전', minutesAgo: 6 },
      { id: 'c-3', author: '망원동주민', content: '식비 64만원 방어면 웬만한 월급 보너스네요 ㄷㄷ 자극받고 갑니다!', createdAt: '2분 전', minutesAgo: 2 }
    ]
  },
  {
    id: 'post-2',
    category: 'tips',
    title: '일방문자 150따리 초보인데 체험단 선정률 3배 올린 3가지 팁 공유',
    content: `저도 두 달 전까진 신청 30개 넣으면 1~2개 겨우 붙던 초보였는데, 사장님들 입장에서 생각하고 프로필이랑 글 구조 바꾼 뒤로 지금은 주 3~4회씩 다닙니다.\n\n1. 신청 한마디에 복붙 금지\n'열심히 쓰겠습니다' 대신 '매장 메인 메뉴인 시그니처 화덕피자 치즈 늘어나는 고화질 움짤과 네이버 영수증 포토리뷰까지 정성껏 남기겠습니다'처럼 구체적으로 쓰세요.\n\n2. 글에 고화질 움짤 최소 2개 필수\n네이버는 체류시간이 깡패입니다. 정지된 사진보다 음식 끓는 짤이나 고기 굽는 짤 넣으면 스크롤 멈추면서 체류시간 2분 이상 나와요.\n\n3. 주말 저녁 피하고 평일 낮 시간대 공략\n초보일 땐 경쟁률 20:1 넘는 주말 메인 시간대 피해 평일 낮이나 화/수 요일 신청하면 방문자 적어도 꽤 잘 뽑힙니다!`,
    author: '블로그장인',
    views: 624,
    likes: 58,
    minutesAgo: 48, // 48분 전
    createdAt: '48분 전',
    badge: '추천',
    comments: [
      { id: 'c-4', author: '성수러버', content: '신청 한마디 팁 진짜 공감합니다! 저도 영수증 리뷰 언급하고 나서 승률 확 올랐어요.', createdAt: '35분 전', minutesAgo: 35 },
      { id: 'c-5', author: '열혈블로거', content: '스크랩해두고 신청할 때마다 참고하겠습니다 감사합니다 ㅠㅠ', createdAt: '20분 전', minutesAgo: 20 }
    ]
  },
  {
    id: 'post-3',
    category: 'free',
    title: '리뷰노트 vs 레뷰 여러분은 주로 어디가 당첨 잘 되시나요?',
    content: `저는 이상하게 레뷰는 경쟁률 5:1짜리 낮은 거 넣어도 자주 떨어지는데,\n리뷰노트는 신청하면 60~70%는 붙는 느낌이에요.\n\n사람마다 블로그 지수나 카테고리 따라서 맞는 플랫폼이 따로 있나 봐요 ㅋㅋ\n다른 분들은 주로 어디 플랫폼 승률이 제일 좋으신가요?`,
    author: '직장인블로그',
    views: 395,
    likes: 27,
    minutesAgo: 110, // 약 1.8시간 전
    createdAt: '1시간 전',
    comments: [
      { id: 'c-6', author: '주말러', content: '저도 리뷰노트 파입니다 ㅋㅋ 레뷰는 인플루언서 위주로 뽑는 느낌이 강해요', createdAt: '1시간 전', minutesAgo: 65 },
      { id: 'c-7', author: '푸드러버', content: '디너의여왕도 은근 맛집 퀄리티 좋고 당첨 잘 돼요! 추천합니다', createdAt: '50분 전', minutesAgo: 50 },
      { id: 'c-8', author: '직장인블로그', content: '디너의여왕도 가입해봐야겠네요 꿀팁 감사합니다 ㅎㅎ', createdAt: '30분 전', minutesAgo: 30 }
    ]
  },
  {
    id: 'post-4',
    category: 'feedback',
    title: '운영자님! 움짤 자막에 귀여운 주아체랑 노란 예능 자막 생겨서 진짜 편해요 ㅠㅠ',
    content: `맛집 짤 찔 때마다 딱딱한 기본 폰트라 뭔가 2% 아쉬웠는데,\n방금 비디오 올려서 보니까 배민 주아체랑 방송 자막처럼 노란 글씨에 검은 테두리 도톰하게 들어가는 옵션 생겼네요 ㅋㅋㅋ\n\n지글지글 고기 굽는 짤에 노란 글씨 박으니까 포스팅 퀄리티가 확 살아납니다 ㅋㅋㅋ 대표 썸네일로 쓰기 딱 좋아요. 빠른 업데이트 감사드립니다!!`,
    author: '카페탐방러',
    views: 290,
    likes: 34,
    minutesAgo: 175, // 약 2.9시간 전
    createdAt: '2시간 전',
    badge: 'HOT',
    comments: [
      { id: 'c-9', author: 'Gifty운영자', content: '마음에 드셨다니 정말 기쁩니다! 블로거분들이 더 편하고 예쁘게 움짤 만드실 수 있도록 계속 다듬겠습니다 :)', createdAt: '2시간 전', minutesAgo: 130 },
      { id: 'c-10', author: '달콤한하루', content: '오 저도 방금 써봤는데 핑크색 자막도 디저트 짤에 찰떡이네요 ㅋㅋ', createdAt: '1시간 전', minutesAgo: 80 }
    ]
  },
  {
    id: 'post-5',
    category: 'free',
    title: '체험단 갔는데 사장님이 예약 안 됐다고 하면 어떻게 대처하시나요?;;',
    content: `어제 저녁 7시 방문으로 플랫폼 확정 알림톡 받고 매장 갔는데,\n알바생은 전달받은 거 없다고 하고 사장님은 통화도 안 돼서 가게 카운터 앞에서 15분 서있다가 겨우 들어갔네요 ㅠㅠ\n뒤에 다른 손님들 줄 서있는데 너무 민망하고 땀 삐질 났습니다...\n\n이런 경우 사장님 불친절했다고 솔직하게 적으면 패널티 먹나요? 다들 어떻게 대처하시나요?`,
    author: '초보리뷰어',
    views: 430,
    likes: 19,
    minutesAgo: 240, // 4시간 전
    createdAt: '4시간 전',
    comments: [
      { id: 'c-11', author: '베테랑블로거', content: '헐 진짜 속상하셨겠어요ㅠㅠ 그럴 땐 감정적으로 악평 쓰기보다는 플랫폼 1:1 고객센터에 먼저 상황 캡처해서 남겨두시는 게 안전합니다.', createdAt: '3시간 전', minutesAgo: 210 },
      { id: 'c-12', author: '초보리뷰어', content: '아 고객센터에 먼저 접수해야 하는군요! 바로 남겨둬야겠어요 감사합니다 ㅠㅠ', createdAt: '3시간 전', minutesAgo: 190 },
      { id: 'c-13', author: '소소한일상', content: '저도 비슷한 적 있는데 본문에는 음식 맛이랑 인테리어 위주로 담백하게 적고 나왔어요', createdAt: '2시간 전', minutesAgo: 140 }
    ]
  },
  {
    id: 'post-6',
    category: 'settlement',
    title: '주말에 부모님 모시고 8만원 고깃집 체험단 다녀왔습니다 ㅎㅎ',
    content: `소갈비 3인분에 된장찌개 시켜서 총 9만 4천원 나왔는데,\n8만원 식사권 쓰고 1만 4천원만 내돈내산 결제하고 푸짐하게 먹고 왔네요.\n\n엄마 아빠가 처음에 블로그에 사진 찍는 거 보고 뭘 그렇게 찍냐고 하시더니, 계산할 때 14,000원 찍히는 거 보시고 우리 딸 블로그 열심히 하더니 효도한다고 엄청 좋아하셨습니다 ㅋㅋㅋ\n체험단 하면서 가장 보람찬 순간이었네요!`,
    author: '효도블로거',
    views: 512,
    likes: 62,
    minutesAgo: 320, // 5시간 전
    createdAt: '5시간 전',
    badge: '인기',
    comments: [
      { id: 'c-14', author: '고기사랑', content: '부모님 모시고 가는 게 진짜 최고의 효도죠 ㅠㅠ 멋지십니다!', createdAt: '4시간 전', minutesAgo: 280 },
      { id: 'c-15', author: '효도블로거', content: '감사합니다 ㅎㅎ 다음 달엔 한우 코스요리 노려보려구요!', createdAt: '4시간 전', minutesAgo: 260 }
    ]
  },
  {
    id: 'post-7',
    category: 'tips',
    title: 'Q. 깜빡하고 하단에 공정위 배너 안 넣고 발행했는데 수정해도 될까요?',
    content: `글 올리고 3시간 뒤에 보니까 협찬 문구 배너 넣는 걸 깜빡했더라구요 ㅠㅠ\n네이버 로직이 발행 직후 글 수정하면 순위 떨어진다는 말이 있어서 너무 불안한데 그냥 놔둬야 할까요? 아니면 지금이라도 문구 추가해야 할까요?`,
    author: '불안한새싹',
    views: 340,
    likes: 15,
    minutesAgo: 410, // 약 6.8시간 전
    createdAt: '6시간 전',
    comments: [
      { id: 'c-16', author: '블로그장인', content: '공정위 문구 누락은 과태료 및 법적 제재 대상이라 발견 즉시 무조건 넣으셔야 합니다! 하단에 텍스트 1줄 수정하는 건 순위에 지장 전혀 없으니 안심하고 수정하세요.', createdAt: '6시간 전', minutesAgo: 390 },
      { id: 'c-17', author: '불안한새싹', content: '헐 과태료라니... 방금 바로 추가했습니다! 알려주셔서 정말 감사해요 ㅠㅠ', createdAt: '5시간 전', minutesAgo: 350 }
    ]
  },
  {
    id: 'post-8',
    category: 'tips',
    title: '누끼따기로 딴 제품 사진 블로그 썸네일에 쓸 때 꿀팁 (클릭률 2배 상승)',
    content: `뷰티나 패션, 맛집 포스팅할 때 네이버 피드에서 사진들 쭉 보면 다 비슷비슷해서 묻히기 쉽습니다.\n\n여기 누끼따기 툴에서 제품 배경 지우고 [스티커 흰색 외곽선(도톰하게 4px)] 씌워서 대표 이미지로 설정해 보세요.\n검색 결과 화면에서 제품이 스티커처럼 튀어나와 보여서 클릭률(CTR) 진짜 2배는 뜁니다. 뷰티 인플루언서들이 많이 쓰는 비법이에요!`,
    author: '뷰티덕후',
    views: 450,
    likes: 41,
    minutesAgo: 580, // 약 9.6시간 전
    createdAt: '9시간 전',
    badge: '추천',
    comments: [
      { id: 'c-18', author: '코덕일기', content: '오 포토샵 없이 흰색 외곽선 주는 거 찾고 있었는데 여기서 바로 되네요 대박!', createdAt: '8시간 전', minutesAgo: 500 },
      { id: 'c-19', author: '뷰티덕후', content: '맞아요 캡처해서 Ctrl+V 누르면 3초 만에 따져서 진짜 빠릅니다 ㅎㅎ', createdAt: '7시간 전', minutesAgo: 450 }
    ]
  },
  {
    id: 'post-9',
    category: 'free',
    title: '체험단 마감 D-Day 알림 없었으면 어제 패널티 먹을 뻔했네요 휴...',
    content: `체험단 당첨된 거 7개 쌓여있어서 날짜 헷갈렸는데,\n다이어리 캘린더에 빨간불로 [오늘마감!] 떠있는 거 보고 퇴근길에 지하철에서 부랴부랴 포스팅 마감 쳤습니다 휴 ㅋㅋㅋ\n\n예전에 마감 하루 지나서 제출했다가 레뷰 1달 이용정지 먹은 적 있어서 가슴 철렁했네요 ㅠㅠ 일정 정리는 진짜 필수인 듯합니다.`,
    author: '덜렁이리뷰어',
    views: 310,
    likes: 22,
    minutesAgo: 740, // 약 12시간 전
    createdAt: '12시간 전',
    comments: [
      { id: 'c-20', author: '칼마감러', content: '저도 캘린더 D-Day 색깔별로 바뀌는 거 보고 우선순위 정해서 글 씁니다 ㅋㅋ 공감돼요', createdAt: '11시간 전', minutesAgo: 680 }
    ]
  }
];

const STORAGE_KEY = 'gifty_community_posts_v3';

export function getPosts(): Post[] {
  if (typeof window === 'undefined') return INITIAL_POSTS;
  
  let loadedPosts: Post[] = [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      loadedPosts = JSON.parse(saved);
    } catch {
      loadedPosts = INITIAL_POSTS;
    }
  } else {
    loadedPosts = INITIAL_POSTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
  }

  // 동적 시간 반영 (언제 접속하든 현재 시간 기준 몇 분 전인지 계산)
  const formatted = loadedPosts.map((post) => {
    const timeDisplay = formatTimeAgo(post.minutesAgo || 30, post.createdAt);
    const updatedComments = (post.comments || []).map((c) => ({
      ...c,
      createdAt: formatTimeAgo(c.minutesAgo || 15, c.createdAt),
    }));
    return {
      ...post,
      createdAt: timeDisplay,
      comments: updatedComments,
    };
  });

  return formatted;
}

export function savePosts(posts: Post[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
