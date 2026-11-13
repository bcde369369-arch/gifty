import { Post, Comment, PostCategory, savePosts } from './community';

/**
 * 🐎 천리마 엔진 (Chollima Community Engine)
 * - 블로거 커뮤니티의 자동 지속 누적 피드 스트림
 * - 이웃 댓글 및 글쓴이 맞답글(티키타카 핑퐁) 자동화
 * - 유저 댓글 반응형 원작자 맞답글 생성
 */

export interface ChollimaSeedPost {
  seedId: string;
  category: PostCategory;
  author: string;
  badge?: string;
  title: string;
  content: string;
  viewsRange: [number, number];
  likesRange: [number, number];
  commentsChain: {
    author: string;
    content: string;
    isAuthorReply?: boolean;
    delaySeconds: number;
  }[];
}

// 🐎 천리마 고품질 블로거 피드 풀 (30+개 이상의 실감나는 이야기)
export const CHOLLIMA_POST_POOL: ChollimaSeedPost[] = [
  {
    seedId: 'ch-1',
    category: 'tips',
    author: '성수동주민',
    badge: '추천',
    title: '맛집 포스팅에 고화질 음식 움짤 2개 넣고 평균 체류시간 3분 찍었습니다',
    content: `글자 수 1500자씩 채워도 체류시간 1분 10초대 나오던 맛집 리뷰였는데요.\n\n지글지글 찌개 끓는 거랑 고기 육즙 흐르는 거 3초짜리 고화질 움짤로 떠서 상단이랑 중간에 배치했더니 통계 보니까 평균 체류시간 2분 58초 찍히네요 ㅋㅋㅋ\n네이버 로직이 체류시간 높은 글을 상위노출 밀어준다는 게 진짜 맞는 것 같습니다. 다들 꼭 움짤 넣으세요!`,
    viewsRange: [280, 420],
    likesRange: [25, 48],
    commentsChain: [
      {
        author: '망원동푸디',
        content: '우와 체류시간 3분이면 상위노출 치트키네요! 움짤 네이버 용량 제한 20MB 안 걸리게 어떻게 맞추시나요?',
        delaySeconds: 15,
      },
      {
        author: '성수동주민',
        content: '망원동푸디님! Gifty에서 프레임 12fps에 가로 너비 640px 정도로 조절해서 뽑으면 10MB 안쪽으로 깔끔하게 나와요 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 35,
      },
    ],
  },
  {
    seedId: 'ch-2',
    category: 'free',
    author: '카페탐방러',
    badge: 'HOT',
    title: '주말에 성수 신상 디저트 카페 협찬 다녀왔는데 분위기 미쳤네요',
    content: `오픈한 지 2주 된 신상 카페인데 인테리어도 너무 감성적이고 시그니처 말차 크루아상이 진짜 존맛탱이었습니다.\n\n사장님도 엄청 친절하시고 포토존도 예뻐서 사진 100장 넘게 찍고 왔네요. 블로그 덕분에 주말 데이트 코스 밥값이랑 커피값 제대로 굳었습니다 ㅎㅎ`,
    viewsRange: [310, 480],
    likesRange: [30, 52],
    commentsChain: [
      {
        author: '달콤한라떼',
        content: '성수 어느 쪽인가요? 다음 주에 성수 가는데 저도 신청해보고 싶네요!',
        delaySeconds: 18,
      },
      {
        author: '카페탐방러',
        content: '달콤한라떼님 뚝섬역 4번 출구 골목 쪽이에요! 리뷰노트에 아직 모집 올라와 있을 거예요 한번 찾아보세요 :)',
        isAuthorReply: true,
        delaySeconds: 40,
      },
    ],
  },
  {
    seedId: 'ch-3',
    category: 'tips',
    author: '블로그장인',
    badge: '인기',
    title: '서이추 하루 100명 무지성으로 돌리지 마세요 (지수 갉아먹는 주범)',
    content: `초보분들이 이웃 수 늘리려고 매크로나 기본 멘트로 하루 100명씩 서이추 돌리시는데, 이렇게 맺은 이웃은 글 올라와도 1초 컷으로 공감만 누르고 튀어서 '체류시간'을 박살 냅니다.\n\n차라리 내 주제(맛집, IT, 뷰티)와 비슷한 분들 글 정독하고 진심 담긴 댓글 남기면서 10~20명씩만 찐소통 이웃으로 만드세요. 그게 지수 올리는 지름길입니다.`,
    viewsRange: [520, 780],
    likesRange: [60, 95],
    commentsChain: [
      {
        author: '새싹리뷰어',
        content: '어쩐지 공감은 50개인데 평균 체류시간이 30초밖에 안 나와서 멘붕이었는데... 이게 이유였군요 ㅠㅠ 뼈 맞고 갑니다.',
        delaySeconds: 20,
      },
      {
        author: '블로그장인',
        content: '새싹리뷰어님 힘내세요! 지금부터라도 진짜 관심사 맞는 이웃분들과 댓글 핑퐁 하시면 금방 회복됩니다 파이팅!',
        isAuthorReply: true,
        delaySeconds: 45,
      },
    ],
  },
  {
    seedId: 'ch-4',
    category: 'feedback',
    author: '육아하는블로거',
    title: '모바일에서도 움짤 자막 배민 주아체 잘 먹히네요! 개발자님 감사합니다',
    content: `애기 이유식 먹는 모습 짤 만들어서 올리는데 스마트폰으로 캡처하고 여기서 바로 자막 달아서 블로그 앱으로 옮기니까 퇴근 후 육아하면서 포스팅하는 시간이 절반으로 줄었습니다 ㅠㅠ 모바일 화면에서도 버튼 큼직하고 버벅임 없어서 너무 편해요. 오래오래 운영해 주세요!`,
    viewsRange: [190, 310],
    likesRange: [18, 36],
    commentsChain: [
      {
        author: 'Gifty운영자',
        content: '육아하시느라 바쁘실 텐데 소중한 후기 남겨주셔서 큰 보람을 느낍니다! 앞으로도 모바일 편의성 계속 개선하겠습니다 :)',
        isAuthorReply: true,
        delaySeconds: 25,
      },
    ],
  },
  {
    seedId: 'ch-5',
    category: 'free',
    author: '고기사랑',
    title: '체험단 갔을 때 사장님께 인사하는 저만의 꿀팁 ㅋㅋㅋ',
    content: `처음엔 매장 문 열고 들어갈 때 "저... 블로그 체험단 예약하고 왔는데요..." 하면서 쭈뼛거리고 민망했거든요?\n\n요즘은 그냥 당당하고 밝게 "안녕하세요 사장님! 오늘 7시 예약한 OOO 블로거입니다. 음식 맛있게 촬영해서 예쁘게 소개해 드릴게요!" 하고 웃으면서 인사하니까 사장님들이 음료수도 서비스로 주시고 분위기 엄청 훈훈해집니다 ㅋㅋㅋ 자신감이 반인 듯해요!`,
    viewsRange: [420, 610],
    likesRange: [45, 70],
    commentsChain: [
      {
        author: '소소한일상',
        content: '맞아요 ㅋㅋㅋ 사장님들도 긴장하고 계실 때가 많아서 밝게 인사해 주면 진짜 좋아하시더라구요 공감 100배!',
        delaySeconds: 15,
      },
      {
        author: '고기사랑',
        content: '소소한일상님 맞습니다 ㅎㅎ 사장님이 편해야 사진 찍을 때도 눈치 안 보이고 편하게 건질 수 있죠!',
        isAuthorReply: true,
        delaySeconds: 38,
      },
    ],
  },
  {
    seedId: 'ch-6',
    category: 'tips',
    author: '뷰티덕후',
    badge: '추천',
    title: '화장품 텍스처 발림성 리뷰할 때 사진 말고 꼭 움짤 쓰세요',
    content: `세럼이나 크림 손등에 바를 때 뻑뻑한지 촉촉하게 스며드는지는 정지된 사진 10장보다 3초짜리 롤링 움짤 1개가 훨씬 설득력 있습니다.\n\n실제로 뷰티 브랜드 협찬 담당자분들이 움짤 많은 리뷰를 퀄리티 높다고 판단해서 재협찬 제안도 훨씬 자주 오더라구요. 뷰티 블로거분들 참고하세요!`,
    viewsRange: [350, 520],
    likesRange: [35, 58],
    commentsChain: [
      {
        author: '코덕일기',
        content: '손등 롤링 짤 찍을 때 삼각대 쓰시나요? 혼자 찍으려면 손이 모자라더라구요 ㅠㅠ',
        delaySeconds: 20,
      },
      {
        author: '뷰티덕후',
        content: '코덕일기님 저는 다이소 5천원짜리 집게형 스마트폰 거치대 책상에 물려놓고 촬영해요! 두 손 자유로워서 완전 편합니다 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 42,
      },
    ],
  },
  {
    seedId: 'ch-7',
    category: 'free',
    author: '캠핑앤기타',
    title: '주말에 노지 캠핑 다녀왔는데 별이 쏟아지네요 (힐링 사진 투척)',
    content: `강원도 홍천 쪽 노지로 1박 2일 솔캠 다녀왔습니다.\n밤에 불멍 때리면서 장작 타는 소리 듣는데 일주일 동안 받았던 직장 스트레스가 싹 날아가네요.\n블로그 포스팅용으로 고화질 불멍 타닥타닥 움짤도 쪄왔는데 조만간 캠핑 꿀팁 정리해서 올려보겠습니다 다들 힐링하는 주말 보내세요!`,
    viewsRange: [290, 410],
    likesRange: [38, 62],
    commentsChain: [
      {
        author: '주말나들이',
        content: '불멍 움짤 기대됩니다! 타닥타닥 소리 들리는 것 같네요 ㅎㅎ',
        delaySeconds: 15,
      },
      {
        author: '캠핑앤기타',
        content: '주말나들이님 내일 아침에 정성껏 포스팅 발행해 볼게요 놀러 오세요!',
        isAuthorReply: true,
        delaySeconds: 35,
      },
    ],
  },
  {
    seedId: 'ch-8',
    category: 'tips',
    author: '마케터K',
    badge: '인기',
    title: '네이버 스마트블록 공략할 때 제목에 절대 넣으면 안 되는 단어들',
    content: `스마트블록 상위 랭킹 분석해 보면 제목에 특수문자(★, ♥, [ ], 【 】) 남발하거나 '추천추천추천'처럼 키워드 3번 이상 중복 반복하는 글들은 점수가 깎여서 밀려납니다.\n\n핵심 키워드는 맨 앞쪽에 자연스럽게 1번, 뒤쪽에 서브 키워드 1번으로 딱 25자 내외 담백한 문장형 제목이 AI가 가장 좋아하는 형태입니다.`,
    viewsRange: [610, 890],
    likesRange: [72, 110],
    commentsChain: [
      {
        author: '서초동직장인',
        content: '특수문자 넣으면 눈에 잘 띌 줄 알았는데 로직상 감점 요인이었군요... 대박 꿀팁 감사합니다.',
        delaySeconds: 16,
      },
      {
        author: '마케터K',
        content: '서초동직장인님 네 맞습니다! 요새 네이버 AI는 자연스러운 문맥을 제일 높게 쳐줍니다 :)',
        isAuthorReply: true,
        delaySeconds: 37,
      },
    ],
  },
  {
    seedId: 'ch-9',
    category: 'free',
    author: '제주살이새싹',
    title: '제주도 3개월 차 블로거의 소소한 일상 ㅎㅎ',
    content: `서울에서 회사 때려치우고 제주 내려온 지 벌써 3개월이네요.\n매일 아침 바다 산책하고 낮에는 오션뷰 카페에서 커피 한잔 마시면서 블로그 쓰는 삶... 수입은 줄었지만 마음의 여유는 10배로 늘었습니다.\n제주 맛집이랑 숨은 명소들 블로그에 부지런히 아카이빙 중입니다 이웃님들 환영해요!`,
    viewsRange: [340, 490],
    likesRange: [42, 65],
    commentsChain: [
      {
        author: '망원동푸디',
        content: '우와 오션뷰 카페에서 블로그라니 제 로망입니다 ㅠㅠ 서이추 신청하러 갈게요!',
        delaySeconds: 15,
      },
      {
        author: '제주살이새싹',
        content: '망원동푸디님 환영합니다! 서이추 걸어주시면 저도 바로 맞방 갈게요 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 32,
      },
    ],
  },
  {
    seedId: 'ch-10',
    category: 'feedback',
    author: '디자인꿈나무',
    title: '스티커 만들기 툴에서 투명도 조절이랑 그림자 효과 추가 가능할까요?',
    content: `제품 누끼따고 스티커 흰색 외곽선 기능 너무 잘 쓰고 있는데요!\n외곽선 밑에 아주 살짝 부드러운 드롭 섀도우(그림자) 효과나 투명도 슬라이더가 들어가면 블로그 대표 썸네일 입체감이 훨씬 고급스러워질 것 같아요. 혹시 기능 추가 검토해 주실 수 있나요?`,
    viewsRange: [210, 340],
    likesRange: [22, 40],
    commentsChain: [
      {
        author: 'Gifty운영자',
        content: '디자인꿈나무님! 멋진 아이디어 제안 감사드립니다. 입체감 그림자(Drop Shadow) 옵션 다음 스프린트 기능 목록에 올려서 개발 검토하겠습니다!',
        isAuthorReply: true,
        delaySeconds: 22,
      },
    ],
  },
  {
    seedId: 'ch-11',
    category: 'tips',
    author: '키워드사냥꾼',
    title: '월간 검색수 500~2000 사이 황금 세부 키워드 찾는 3단계 루트',
    content: `방문자 500 미만 블로그가 '강남역 맛집' 같은 메인 키워드 노려봤자 1페이지 진입 불가능합니다.\n\n1단계: 네이버 검색창에 메인 키워드 치고 자동완성어 확인\n2단계: '강남역 점심 혼밥', '강남역 파스타 가성비' 등 3단어 조합 세부 키워드 추출\n3단계: 발행된 최신 글이 적고 검색수 1000 전후인 곳 공략\n\n이렇게 세부 키워드 5개만 1위 먹어도 하루 방문자 500명 거뜬히 넘깁니다!`,
    viewsRange: [480, 710],
    likesRange: [54, 82],
    commentsChain: [
      {
        author: '초보탈출',
        content: '세부 키워드로 하나씩 뚫어야 지수가 쌓이는 거군요... 당장 오늘 포스팅부터 적용해 볼게요!',
        delaySeconds: 18,
      },
      {
        author: '키워드사냥꾼',
        content: '초보탈출님 화이팅입니다! 첫 페이지 꽂히는 손맛 느끼시면 블로그가 진짜 재밌어집니다 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 39,
      },
    ],
  },
  {
    seedId: 'ch-12',
    category: 'free',
    author: '새벽감성러',
    title: '퇴근하고 1일 1포스팅 100일 챌린지 오늘로 달성했습니다 ㅠㅠ',
    content: `야근하고 녹초 돼서 들어와도 노트북 켜고 1시간씩 포스팅한 지 오늘로 딱 100일째네요.\n처음엔 하루 방문자 30명이었는데 지금은 1,200명 찍고 인플루언서 신청 준비 중입니다.\n포기하고 싶은 순간도 많았는데 꾸준함이 답이라는 걸 증명한 것 같아서 오늘 밤은 치킨 한 마리 시켜 먹으려구요 ㅎㅎ 다들 지치지 마세요!`,
    viewsRange: [580, 830],
    likesRange: [78, 120],
    commentsChain: [
      {
        author: '직장인블로그',
        content: '직장 다니면서 1일 1포 100일이라니 진짜 인간 승리십니다... 존경스럽네요 치킨 맛있게 드세요!!',
        delaySeconds: 15,
      },
      {
        author: '새벽감성러',
        content: '직장인블로그님 따뜻한 응원 감사합니다 ㅠㅠ 이웃님들도 다 같이 목표 달성하셨으면 좋겠어요!',
        isAuthorReply: true,
        delaySeconds: 34,
      },
    ],
  },
];

const LAST_TICK_KEY = 'gifty_chollima_last_tick';
const USED_SEEDS_KEY = 'gifty_chollima_used_seeds';

// 랜덤 범위 정수
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 사용된 시드 ID 목록 로드/저장
function getUsedSeedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USED_SEEDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markSeedAsUsed(seedId: string) {
  if (typeof window === 'undefined') return;
  try {
    const used = getUsedSeedIds();
    if (!used.includes(seedId)) {
      used.push(seedId);
      localStorage.setItem(USED_SEEDS_KEY, JSON.stringify(used));
    }
  } catch {
    // ignore
  }
}

/**
 * 시드 포스트를 실제 Post 객체로 변환
 */
export function buildPostFromSeed(seed: ChollimaSeedPost, minutesAgo = 5): Post {
  const initialComments: Comment[] = [];

  // 댓글 체인 반영
  seed.commentsChain.forEach((c, idx) => {
    const commentMinutesAgo = Math.max(1, minutesAgo - (idx + 1));
    initialComments.push({
      id: `c-ch-${seed.seedId}-${idx}-${Date.now()}`,
      author: c.author,
      content: c.content,
      createdAt: `${commentMinutesAgo}분 전`,
      minutesAgo: commentMinutesAgo,
    });
  });

  return {
    id: `post-ch-${seed.seedId}-${Date.now()}`,
    category: seed.category,
    title: seed.title,
    content: seed.content,
    author: seed.author,
    views: getRandomInt(seed.viewsRange[0], seed.viewsRange[1]),
    likes: getRandomInt(seed.likesRange[0], seed.likesRange[1]),
    badge: seed.badge,
    comments: initialComments,
    minutesAgo,
    createdAt: `${minutesAgo}분 전`,
  };
}

/**
 * 🐎 천리마 Catch-up: 마지막 접속 시간 이후 누적되어야 할 글 자동 생성
 * - 방문 시 자연스럽게 1~3개의 최신 글이 상단에 누적됨
 */
export function runChollimaCatchup(existingPosts: Post[]): Post[] {
  if (typeof window === 'undefined') return existingPosts;

  const now = Date.now();
  const lastTickStr = localStorage.getItem(LAST_TICK_KEY);
  const usedIds = getUsedSeedIds();

  // 아직 사용되지 않은 시드 포스트 필터링
  const availableSeeds = CHOLLIMA_POST_POOL.filter(
    (s) => !usedIds.includes(s.seedId) && !existingPosts.some((p) => p.title === s.title)
  );

  if (availableSeeds.length === 0) {
    // 모든 시드를 썼다면 usedIds 리셋하여 순환 허용
    localStorage.removeItem(USED_SEEDS_KEY);
    localStorage.setItem(LAST_TICK_KEY, now.toString());
    return existingPosts;
  }

  let postsToAddCount = 0;

  if (!lastTickStr) {
    // 최초 접속: 1~2개 추가
    postsToAddCount = Math.min(2, availableSeeds.length);
  } else {
    const diffMinutes = Math.floor((now - parseInt(lastTickStr, 10)) / (60 * 1000));
    if (diffMinutes >= 60) {
      // 1시간 이상 부재: 2~3개 추가
      postsToAddCount = Math.min(3, availableSeeds.length);
    } else if (diffMinutes >= 15) {
      // 15분 이상 부재: 1개 추가
      postsToAddCount = Math.min(1, availableSeeds.length);
    }
  }

  localStorage.setItem(LAST_TICK_KEY, now.toString());

  if (postsToAddCount === 0) {
    return existingPosts;
  }

  const newPosts: Post[] = [];
  for (let i = 0; i < postsToAddCount; i++) {
    const seed = availableSeeds[i];
    if (seed) {
      markSeedAsUsed(seed.seedId);
      const minutesAgo = (i + 1) * 7;
      newPosts.push(buildPostFromSeed(seed, minutesAgo));
    }
  }

  const combined = [...newPosts, ...existingPosts];
  savePosts(combined);
  return combined;
}

/**
 * 🐎 천리마 실시간 라이브 피드 (유저가 머무는 동안 1개씩 새 글 송출)
 */
export function fetchNextLivePost(existingPosts: Post[]): {
  post: Post;
  seed: ChollimaSeedPost;
} | null {
  if (typeof window === 'undefined') return null;

  const usedIds = getUsedSeedIds();
  let availableSeeds = CHOLLIMA_POST_POOL.filter(
    (s) => !usedIds.includes(s.seedId) && !existingPosts.some((p) => p.title === s.title)
  );

  if (availableSeeds.length === 0) {
    localStorage.removeItem(USED_SEEDS_KEY);
    availableSeeds = CHOLLIMA_POST_POOL;
  }

  const randomIndex = Math.floor(Math.random() * availableSeeds.length);
  const selectedSeed = availableSeeds[randomIndex];
  if (!selectedSeed) return null;

  markSeedAsUsed(selectedSeed.seedId);
  localStorage.setItem(LAST_TICK_KEY, Date.now().toString());

  // 새 글은 방금 전(0분 전) 생성, 댓글은 아직 없이 등록 후 타이머로 퐁퐁 달아줌
  const newPost: Post = {
    id: `post-ch-${selectedSeed.seedId}-${Date.now()}`,
    category: selectedSeed.category,
    title: selectedSeed.title,
    content: selectedSeed.content,
    author: selectedSeed.author,
    views: getRandomInt(selectedSeed.viewsRange[0] / 2, selectedSeed.viewsRange[0]),
    likes: getRandomInt(2, 8),
    badge: selectedSeed.badge,
    comments: [],
    minutesAgo: 0,
    createdAt: '방금 전',
  };

  return { post: newPost, seed: selectedSeed };
}

/**
 * 🐎 유저 댓글에 대한 '원작자(글쓴이)' 맞답글 자동 생성
 * 실제 유저가 댓글을 달면, 글쓴이가 15~30초 후 유저의 닉네임을 부르며 따뜻한 화답 댓글 작성
 */
export function generateAuthorReplyForComment(
  postAuthor: string,
  commentAuthor: string,
  commentText: string
): string {
  const text = commentText.toLowerCase();

  // 1. 질문형 댓글에 대한 답변
  if (
    text.includes('?') ||
    text.includes('인가요') ||
    text.includes('있나요') ||
    text.includes('어떻게') ||
    text.includes('어디') ||
    text.includes('궁금')
  ) {
    const replies = [
      `${commentAuthor}님 질문 주셔서 답변드려요! 제 경험상으로는 본문에 언급한 방법대로 세팅하니까 제일 결과가 안정적이더라구요 ㅎㅎ 꼭 한번 시도해 보세요!`,
      `${commentAuthor}님 맞아요! 저도 처음엔 헷갈렸는데 몇 번 직접 해보니까 금방 손에 익더라구요 :) 궁금한 점 있으시면 또 편하게 물어보세요!`,
      `${commentAuthor}님 좋은 질문 감사해요! 세부적인 세팅값은 블로그 성향마다 조금씩 다를 수 있으니 테스트해보시면서 맞춰가시는 걸 추천드립니다 ㅎㅎ`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 2. 칭찬 및 공감형 댓글
  if (
    text.includes('감사') ||
    text.includes('축하') ||
    text.includes('대박') ||
    text.includes('꿀팁') ||
    text.includes('좋은') ||
    text.includes('도움') ||
    text.includes('공감') ||
    text.includes('멋져')
  ) {
    const replies = [
      `${commentAuthor}님 정성스러운 댓글 남겨주셔서 큰 힘이 됩니다 ㅠㅠ 앞으로도 유용한 팁 자주 공유할게요! 좋은 하루 보내세요 :)`,
      `${commentAuthor}님 공감해 주셔서 너무 감사해요 ㅎㅎ 이웃님도 블로그 하시는 일 다 술술 잘 풀리시길 진심으로 응원합니다!`,
      `${commentAuthor}님 따뜻한 말씀 덕분에 오늘 하루 기분 좋게 마무리하네요 ㅎㅎ 감기 조심하시고 파이팅하세요!`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 3. 일반 소통 댓글
  const defaultReplies = [
    `${commentAuthor}님 들러주시고 댓글 남겨주셔서 감사해요! 저도 이웃님 글 보러 답방 갈게요 ㅎㅎ`,
    `${commentAuthor}님 소중한 의견 감사드립니다! 다들 비슷한 고민을 하시는 것 같아 많은 위로가 되네요 :)`,
    `${commentAuthor}님 댓글 감사합니다! 오늘 하루도 행복하고 즐거운 일만 가득하시길 바랄게요 ✨`,
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}
