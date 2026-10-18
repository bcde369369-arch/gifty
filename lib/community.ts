export interface Comment {
  id: string;
  author: string;
  password?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  category: 'settlement' | 'meme' | 'tips' | 'feedback' | 'free';
  title: string;
  content: string;
  author: string;
  password?: string;
  views: number;
  likes: number;
  comments: Comment[];
  createdAt: string;
  badge?: string; // 예: '인기', '공지'
}

export const CATEGORIES = [
  { id: 'all', label: '🔥 전체글' },
  { id: 'settlement', label: '💰 체험단 정산&자랑' },
  { id: 'meme', label: '🪄 움짤 자랑' },
  { id: 'tips', label: '💡 블로그 꿀팁 & Q&A' },
  { id: 'feedback', label: '✍️ Gifty에 바란다' },
  { id: 'free', label: '☕ 자유수다' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  settlement: '💰 정산&자랑',
  meme: '🪄 움짤 자랑',
  tips: '💡 블로그 팁',
  feedback: '✍️ 기능 건의',
  free: '☕ 자유수다',
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    category: 'settlement',
    title: '🎉 이번 달 체험단 14건 완주! 식사권 70만원 + 원고료 25만원 정산 후기',
    content: `안녕하세요! 맛집/리뷰 블로그 운영 중인 블로거입니다.\n\n이번 달에 키프티 가계부 쓰면서 기록해봤는데 벌써 14건이나 뛰었네요!\n- 레뷰 6건\n- 리뷰노트 5건\n- 강남맛집 3건\n\n초반엔 신청해도 다 떨어졌는데, 글 쓸 때 키프티로 만든 고화질 움짤 2~3개씩 꼭 넣고 체류시간 늘리니까 선정률이 체감상 2배 이상 올랐습니다. 다들 포기하지 마시고 파이팅하세요!`,
    author: '맛동산블로거',
    views: 412,
    likes: 38,
    comments: [
      { id: 'c-1', author: '초보리뷰어', content: '우와 14건 대단하세요!! 움짤 몇 초 정도로 넣으시나요?', createdAt: '2026-10-17 14:20' },
      { id: 'c-2', author: '맛동산블로거', content: '저는 4~5초 정도로 음식 보글보글 끓는 장면이나 첫 숟가락 뜨는 장면 넣습니다 ㅎㅎ', createdAt: '2026-10-17 15:02' }
    ],
    createdAt: '2026-10-16 19:30',
    badge: '인기'
  },
  {
    id: 'post-2',
    category: 'tips',
    title: '꿀팁) 네이버 블로그에 움짤 20MB 넘어서 안 올라갈 때 해결법',
    content: `네이버 블로그는 움짤 파일 하나당 20MB 제한이 있어서 고화질로 찍은 영상은 업로드가 자주 튕깁니다.\n\n키프티 사이트에서 변환할 때 [블로그용(480px, 10fps)]으로 선택하면 알아서 20MB 이하로 용량을 맞춰주더라구요. 만약 그래도 크면 구간을 10초 이하로 줄이시면 무조건 잘 올라갑니다! 참고하세요~`,
    author: '블로그장인',
    views: 589,
    likes: 54,
    comments: [
      { id: 'c-3', author: '해피데이', content: '좋은 정보 감사합니다! 항상 용량 초과 떠서 답답했는데 해결됐네요.', createdAt: '2026-10-16 11:15' }
    ],
    createdAt: '2026-10-15 10:45',
    badge: '추천'
  },
  {
    id: 'post-3',
    category: 'meme',
    title: '우리 집 고양이 츄르 먹방 움짤 만들었어요 ㅋㅋㅋ',
    content: `집사 3년차인데 키프티에서 1.5배속하고 뽀샤시 필터 먹여서 만드니까 진짜 귀엽게 나왔네요 ㅠㅠ\n블로그 일상 글에 올렸더니 댓글 폭발했습니다 ㅋㅋ 무설치라 너무 편해요!`,
    author: '냥냥펀치',
    views: 298,
    likes: 29,
    comments: [
      { id: 'c-4', author: '댕댕이맘', content: '어머 너무 귀여워요 ㅠㅠ 필터 기능도 있었군요!', createdAt: '2026-10-16 18:22' }
    ],
    createdAt: '2026-10-16 16:10'
  },
  {
    id: 'post-4',
    category: 'feedback',
    title: '운영자님! 체험단 다이어리에 플랫폼별 집계 추가해주셔서 너무 감사해요',
    content: `가계부 보면서 레뷰 몇 건, 리뷰노트 몇 건 했는지 매번 손으로 셌는데 이제 버튼 하나로 몇 프로인지 다 보여서 속이 시원합니다 ㅠㅠ\n앞으로도 유용한 기능 많이 만들어주세요!`,
    author: '열혈블로거',
    views: 184,
    likes: 22,
    comments: [
      { id: 'c-5', author: 'Gifty운영자', content: '감사합니다! 앞으로도 블로거분들께 꼭 필요한 기능 지속해서 업데이트하겠습니다 :)', createdAt: '2026-10-18 20:30' }
    ],
    createdAt: '2026-10-18 19:05'
  },
  {
    id: 'post-5',
    category: 'free',
    title: '다들 체험단 신청 하루에 몇 개 정도 하시나요?',
    content: `저는 퇴근하고 1시간씩 투자해서 하루 5개 정도 꾸준히 넣고 있는데 평균 1~2개 당첨되는 것 같아요.\n다른 고수님들은 하루에 몇 개씩 신청하시나요??`,
    author: '직장인블로그',
    views: 310,
    likes: 15,
    comments: [
      { id: 'c-6', author: '주말러', content: '저는 주말에 몰아서 20개 정도 넣습니다 ㅎㅎ 선정률 20% 정도 돼요!', createdAt: '2026-10-18 12:40' },
      { id: 'c-7', author: '푸드러버', content: '경쟁률 적은 평일 낮 시간대 방문 캠페인 위주로 노리시면 승률 확 올라갑니다!', createdAt: '2026-10-18 13:10' }
    ],
    createdAt: '2026-10-17 21:00'
  }
];

const STORAGE_KEY = 'gifty_community_posts_v1';

export function getPosts(): Post[] {
  if (typeof window === 'undefined') return INITIAL_POSTS;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse community posts', e);
    return INITIAL_POSTS;
  }
}

export function savePosts(posts: Post[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
