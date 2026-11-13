import { Post, Comment, PostCategory, savePosts } from './community';

/**
 * 🐎 천리마 엔진 v2.0 (Chollima Realistic Community Engine)
 * - 100% 실제 블로거들의 현실적인 말투와 상황 기반 콘텐츠
 * - 기존 글 영구 보존 (Immutable History)
 * - 현실적인 페이싱: 하루 1~2개씩 은근하게 누적 (Catch-up 캡 제한)
 * - 실시간 15~25분 은근한 간격 스트림
 * - 리얼 티키타카 핑퐁 대화 및 유저 반응형 원작자 맞답글
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

// 🐎 진짜 블로거들이 직접 쓴 것 같은 100% 현실감 넘치는 시드 풀 (20+개)
export const CHOLLIMA_POST_POOL: ChollimaSeedPost[] = [
  {
    seedId: 'ch-real-1',
    category: 'tips',
    author: '성수동주민',
    badge: '추천',
    title: '맛집 포스팅에 고화질 음식 움짤 2개 넣고 평균 체류시간 2분 50초 찍었습니다 ㅋㅋㅋ',
    content: `글자 수 1500자씩 꽉꽉 채워도 체류시간 1분 10초대 나와서 현타 오던 1인입니다 ㅠㅠ\n\n지글지글 찌개 끓는 거랑 고기 육즙 촤르륵 흐르는 거 딱 3초짜리 고화질 움짤로 떠서 상단이랑 중간에 2개 넣었더니 블로그 평균 사용시간 2분 50초 찍히네요 ㄷㄷ\n네이버 로직이 체류시간 긴 글을 상위로 밀어준다는 게 진짜 맞는 듯합니다. 사진만 올리시는 분들은 꼭 움짤 써보세요 체감 확 됩니다!`,
    viewsRange: [320, 480],
    likesRange: [28, 49],
    commentsChain: [
      {
        author: '망원동푸디',
        content: '헐 체류시간 2분 50초면 대박이네요... 움짤 네이버 용량 제한 20MB 안 걸리게 어떻게 맞추시나요?',
        delaySeconds: 15,
      },
      {
        author: '성수동주민',
        content: '망원동푸디님! Gifty에서 프레임 12fps로 두고 가로 너비 640px 정도로 조절해서 뽑으면 화질 쨍하면서도 8~10MB 안쪽으로 쏙 들어와요 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 32,
      },
    ],
  },
  {
    seedId: 'ch-real-2',
    category: 'free',
    author: '카페탐방러',
    badge: 'HOT',
    title: '주말에 성수 신상 디저트 카페 협찬 다녀왔는데 분위기 미쳤네요 ㅎㅎ',
    content: `오픈한 지 2주 된 신상 카페인데 인테리어도 너무 감성적이고 시그니처 말차 크루아상이 진짜 존맛탱이었습니다.\n\n사장님도 엄청 친절하시고 포토존도 예뻐서 사진 100장 넘게 찍고 왔네요. 블로그 덕분에 주말 데이트 코스 밥값이랑 커피값 제대로 굳었습니다 ㅋㅋㅋ`,
    viewsRange: [280, 410],
    likesRange: [22, 38],
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
        delaySeconds: 35,
      },
    ],
  },
  {
    seedId: 'ch-real-3',
    category: 'tips',
    author: '블로그장인',
    badge: '인기',
    title: '서이추 하루 100명 무지성으로 돌리지 마세요 (지수 갉아먹는 주범)',
    content: `초보분들이 이웃 수 늘리려고 기본 멘트로 하루 100명씩 서이추 돌리시는데, 이렇게 맺은 이웃은 글 올라와도 1초 컷으로 공감만 누르고 도망가서 '체류시간'을 박살 냅니다.\n\n차라리 내 주제(맛집, IT, 뷰티)와 비슷한 분들 글 정독하고 진심 담긴 댓글 남기면서 하루 10~15명씩만 찐소통 이웃으로 만드세요. 그게 지수 올리는 지름길입니다.`,
    viewsRange: [510, 750],
    likesRange: [55, 88],
    commentsChain: [
      {
        author: '새싹리뷰어',
        content: '어쩐지 공감은 50개인데 평균 체류시간이 30초밖에 안 나와서 멘붕이었는데... 이게 이유였군요 ㅠㅠ 뼈 맞고 갑니다.',
        delaySeconds: 16,
      },
      {
        author: '블로그장인',
        content: '새싹리뷰어님 힘내세요! 지금부터라도 진짜 관심사 맞는 이웃분들과 댓글 핑퐁 하시면 금방 회복됩니다 파이팅!',
        isAuthorReply: true,
        delaySeconds: 38,
      },
    ],
  },
  {
    seedId: 'ch-real-4',
    category: 'free',
    author: '고기사랑',
    title: '체험단 갔을 때 사장님께 인사하는 저만의 꿀팁 ㅋㅋㅋ',
    content: `처음엔 매장 문 열고 들어갈 때 "저... 블로그 체험단 예약하고 왔는데요..." 하면서 쭈뼛거리고 눈치 보였거든요?\n\n요즘은 그냥 당당하고 밝게 "안녕하세요 사장님! 오늘 7시 예약한 OOO 블로거입니다. 음식 맛있게 촬영해서 예쁘게 소개해 드릴게요!" 하고 웃으면서 인사하니까 사장님들이 음료수도 서비스로 주시고 분위기 엄청 훈훈해집니다 ㅋㅋㅋ 자신감이 반인 듯해요!`,
    viewsRange: [390, 580],
    likesRange: [40, 65],
    commentsChain: [
      {
        author: '소소한일상',
        content: '맞아요 ㅋㅋㅋ 사장님들도 블로거 처음 오면 긴장하고 계실 때가 많아서 밝게 인사해 주면 진짜 좋아하시더라구요 공감 100배!',
        delaySeconds: 15,
      },
      {
        author: '고기사랑',
        content: '소소한일상님 맞습니다 ㅎㅎ 사장님이 편해야 사진 찍을 때도 눈치 안 보고 편하게 건질 수 있죠!',
        isAuthorReply: true,
        delaySeconds: 34,
      },
    ],
  },
  {
    seedId: 'ch-real-5',
    category: 'tips',
    author: '키워드사냥꾼',
    badge: '추천',
    title: '월간 검색수 500~2000 사이 황금 세부 키워드 찾는 3단계 루트',
    content: `방문자 500 미만 블로그가 '강남역 맛집' 같은 메인 키워드 노려봤자 1페이지 진입 불가능합니다.\n\n1단계: 네이버 검색창에 메인 키워드 치고 자동완성어 확인\n2단계: '강남역 점심 혼밥', '강남역 파스타 가성비' 등 3단어 조합 세부 키워드 추출\n3단계: 발행된 최신 글이 적고 검색수 1000 전후인 곳 공략\n\n이렇게 세부 키워드 5개만 1위 먹어도 하루 방문자 500명 거뜬히 넘깁니다!`,
    viewsRange: [460, 680],
    likesRange: [48, 79],
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
        delaySeconds: 36,
      },
    ],
  },
  {
    seedId: 'ch-real-6',
    category: 'free',
    author: '직장인블로그',
    title: '퇴근하고 1일 1포스팅 100일 챌린지 오늘로 달성했습니다 ㅠㅠ',
    content: `야근하고 녹초 돼서 들어와도 노트북 켜고 1시간씩 포스팅한 지 오늘로 딱 100일째네요.\n처음엔 하루 방문자 30명이었는데 지금은 1,200명 찍고 인플루언서 신청 준비 중입니다.\n포기하고 싶은 순간도 많았는데 꾸준함이 답이라는 걸 증명한 것 같아서 오늘 밤은 치킨 한 마리 시켜 먹으려구요 ㅎㅎ 다들 지치지 마세요!`,
    viewsRange: [540, 790],
    likesRange: [70, 115],
    commentsChain: [
      {
        author: '새벽감성러',
        content: '직장 다니면서 1일 1포 100일이라니 진짜 인간 승리십니다... 존경스럽네요 치킨 맛있게 드세요!!',
        delaySeconds: 15,
      },
      {
        author: '직장인블로그',
        content: '새벽감성러님 따뜻한 응원 감사합니다 ㅠㅠ 이웃님들도 다 같이 목표 달성하셨으면 좋겠어요!',
        isAuthorReply: true,
        delaySeconds: 32,
      },
    ],
  },
  {
    seedId: 'ch-real-7',
    category: 'tips',
    author: '뷰티덕후',
    badge: '추천',
    title: '화장품 텍스처 발림성 리뷰할 때 사진 말고 꼭 움짤 쓰세요',
    content: `세럼이나 크림 손등에 바를 때 뻑뻑한지 촉촉하게 스며드는지는 정지된 사진 10장보다 3초짜리 롤링 움짤 1개가 훨씬 설득력 있습니다.\n\n실제로 뷰티 브랜드 협찬 담당자분들이 움짤 많은 리뷰를 퀄리티 높다고 판단해서 재협찬 제안도 훨씬 자주 오더라구요. 뷰티 블로거분들 참고하세요!`,
    viewsRange: [340, 510],
    likesRange: [32, 54],
    commentsChain: [
      {
        author: '코덕일기',
        content: '손등 롤링 짤 찍을 때 삼각대 쓰시나요? 혼자 찍으려면 손이 모자라더라구요 ㅠㅠ',
        delaySeconds: 17,
      },
      {
        author: '뷰티덕후',
        content: '코덕일기님 저는 다이소 5천원짜리 집게형 스마트폰 거치대 책상에 물려놓고 촬영해요! 두 손 자유로워서 완전 편합니다 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 35,
      },
    ],
  },
  {
    seedId: 'ch-real-8',
    category: 'feedback',
    author: '육아하는블로거',
    title: '모바일에서도 움짤 자막 배민 주아체 잘 먹히네요! 개발자님 감사합니다',
    content: `애기 이유식 먹는 모습 짤 만들어서 올리는데 스마트폰으로 캡처하고 여기서 바로 자막 달아서 블로그 앱으로 옮기니까 퇴근 후 육아하면서 포스팅하는 시간이 절반으로 줄었습니다 ㅠㅠ 모바일 화면에서도 버튼 큼직하고 버벅임 없어서 너무 편해요. 오래오래 운영해 주세요!`,
    viewsRange: [180, 290],
    likesRange: [16, 33],
    commentsChain: [
      {
        author: 'Gifty운영자',
        content: '육아하시느라 바쁘실 텐데 소중한 후기 남겨주셔서 큰 보람을 느낍니다! 앞으로도 모바일 편의성 계속 다듬겠습니다 :)',
        isAuthorReply: true,
        delaySeconds: 22,
      },
    ],
  },
  {
    seedId: 'ch-real-9',
    category: 'free',
    author: '제주살이새싹',
    title: '제주도 3개월 차 블로거의 소소한 일상 ㅎㅎ',
    content: `서울에서 회사 때려치우고 제주 내려온 지 벌써 3개월이네요.\n매일 아침 바다 산책하고 낮에는 오션뷰 카페에서 커피 한잔 마시면서 블로그 쓰는 삶... 수입은 줄었지만 마음의 여유는 10배로 늘었습니다.\n제주 맛집이랑 숨은 명소들 블로그에 부지런히 아카이빙 중입니다 이웃님들 환영해요!`,
    viewsRange: [310, 460],
    likesRange: [38, 60],
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
        delaySeconds: 30,
      },
    ],
  },
  {
    seedId: 'ch-real-10',
    category: 'tips',
    author: '마케터K',
    badge: '인기',
    title: '네이버 스마트블록 공략할 때 제목에 절대 넣으면 안 되는 단어들',
    content: `스마트블록 상위 랭킹 분석해 보면 제목에 특수문자(★, ♥, [ ], 【 】) 남발하거나 '추천추천추천'처럼 키워드 3번 이상 중복 반복하는 글들은 점수가 깎여서 밀려납니다.\n\n핵심 키워드는 맨 앞쪽에 자연스럽게 1번, 뒤쪽에 서브 키워드 1번으로 딱 25자 내외 담백한 문장형 제목이 AI가 가장 좋아하는 형태입니다.`,
    viewsRange: [590, 840],
    likesRange: [65, 102],
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
        delaySeconds: 34,
      },
    ],
  },
  {
    seedId: 'ch-real-11',
    category: 'free',
    author: '캠핑앤기타',
    title: '주말에 노지 캠핑 다녀왔는데 별이 쏟아지네요 (힐링 사진 투척)',
    content: `강원도 홍천 쪽 노지로 1박 2일 솔캠 다녀왔습니다.\n밤에 불멍 때리면서 장작 타는 소리 듣는데 일주일 동안 받았던 직장 스트레스가 싹 날아가네요.\n블로그 포스팅용으로 고화질 불멍 타닥타닥 움짤도 쪄왔는데 조만간 캠핑 꿀팁 정리해서 올려보겠습니다 다들 힐링하는 주말 보내세요!`,
    viewsRange: [270, 390],
    likesRange: [35, 56],
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
        delaySeconds: 33,
      },
    ],
  },
  {
    seedId: 'ch-real-12',
    category: 'tips',
    author: '리뷰어노트',
    badge: '추천',
    title: '신청 한마디에 네이버 영수증 포토리뷰 언급하니까 승률 2배 뛰네요',
    content: `신청서 작성할 때 '정성껏 쓰겠습니다' 대신,\n'블로그 메인 포스팅은 물론이고 매장 네이버 플레이스 영수증 포토리뷰까지 꼼꼼하게 남겨 사장님 매장 리뷰 수와 별점 관리에 실질적인 도움을 드리겠습니다'라고 썼더니 당첨률이 눈에 띄게 올랐습니다.\n\n사장님들은 네이버 플레이스 순위에도 엄청 민감하셔서 영수증 리뷰 언급해 주는 블로거를 진짜 좋아하십니다. 꿀팁 공유해요!`,
    viewsRange: [420, 630],
    likesRange: [45, 73],
    commentsChain: [
      {
        author: '성수러버',
        content: '와 이거 진짜 꿀팁이네요... 사장님 가려운 곳을 긁어주는 멘트네요 당장 써먹어야겠습니다!',
        delaySeconds: 16,
      },
      {
        author: '리뷰어노트',
        content: '성수러버님 네 꼭 써보세요! 사장님 입장에서 생각하면 신청서 쓰는 법이 완전히 달라집니다 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 34,
      },
    ],
  },
  {
    seedId: 'ch-real-13',
    category: 'free',
    author: '효도블로거',
    title: '주말에 부모님 모시고 흑돼지 식사권 다녀왔는데 딸 덕분에 호강한다고 용돈 주심 ㅋㅋㅋ',
    content: `제주 흑돼지 3인분 세트 식사권 당첨돼서 부모님 모시고 다녀왔는데요.\n처음엔 식당 가서 사진 찍는 거 보시고 뭘 그렇게 찍냐고 하시더니, 계산할 때 0원 찍히는 거 보시고 우리 딸 블로그 열심히 하더니 효도한다고 아빠가 차비하라고 5만원 쥐여주셨네요 ㅋㅋㅋ\n체험단 하면서 가장 뿌듯했던 순간이었습니다 ㅎㅎ`,
    viewsRange: [380, 560],
    likesRange: [42, 68],
    commentsChain: [
      {
        author: '고기사랑',
        content: '부모님 모시고 가는 게 진짜 최고의 보람이죠 ㅠㅠ 멋지십니다!',
        delaySeconds: 15,
      },
      {
        author: '효도블로거',
        content: '고기사랑님 감사해요 ㅎㅎ 다음엔 한우 코스요리 당첨 노려보려구요!',
        isAuthorReply: true,
        delaySeconds: 35,
      },
    ],
  },
  {
    seedId: 'ch-real-14',
    category: 'tips',
    author: '썸네일장인',
    title: '대표 이미지에 흰색 외곽선 스티커 테두리 주니까 클릭률(CTR) 2배 뜁니다',
    content: `네이버 검색 피드에서 사진들 쭉 내릴 때 다 비슷비슷한 각도라 묻히기 쉬운데요.\n\n여기 누끼따기 툴에서 제품 배경 지우고 [스티커 흰색 테두리(도톰하게 4px)] 씌워서 대표 이미지로 걸어보세요.\n검색 결과 썸네일에서 혼자 톡 튀어나와 보여서 클릭률(CTR) 진짜 2배는 뜁니다. 뷰티랑 푸드 인플루언서들이 많이 쓰는 비법이에요!`,
    viewsRange: [490, 710],
    likesRange: [52, 85],
    commentsChain: [
      {
        author: '초보리뷰어',
        content: '포토샵 없이 흰색 외곽선 주는 거 찾고 있었는데 여기서 바로 되네요 대박!',
        delaySeconds: 17,
      },
      {
        author: '썸네일장인',
        content: '초보리뷰어님 네 캡처해서 붙여넣기만 하면 3초 컷이라 작업 속도 엄청 빨라집니다 ㅎㅎ',
        isAuthorReply: true,
        delaySeconds: 36,
      },
    ],
  },
  {
    seedId: 'ch-real-15',
    category: 'free',
    author: '덜렁이리뷰어',
    title: '체험단 마감 D-Day 알림 없었으면 어제 패널티 먹을 뻔했네요 휴...',
    content: `체험단 당첨된 거 6개 쌓여있어서 날짜 헷갈렸는데,\n다이어리 캘린더에 빨간불로 [오늘마감!] 떠있는 거 보고 퇴근길에 지하철에서 부랴부랴 포스팅 마감 쳤습니다 휴 ㅋㅋㅋ\n\n예전에 마감 하루 지나서 제출했다가 1달 이용정지 먹은 적 있어서 가슴 철렁했네요 ㅠㅠ 일정 관리는 진짜 필수인 듯합니다.`,
    viewsRange: [310, 450],
    likesRange: [25, 42],
    commentsChain: [
      {
        author: '칼마감러',
        content: '저도 캘린더 D-Day 색깔별로 바뀌는 거 보고 우선순위 정해서 글 씁니다 ㅋㅋ 공감돼요',
        delaySeconds: 16,
      },
      {
        author: '덜렁이리뷰어',
        content: '칼마감러님 맞아요 저 같은 덜렁이한텐 알림이 생명줄입니다 ㅋㅋㅋ',
        isAuthorReply: true,
        delaySeconds: 33,
      },
    ],
  },
];

const LAST_TICK_KEY = 'gifty_chollima_last_tick_v3';
const USED_SEEDS_KEY = 'gifty_chollima_used_seeds_v3';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
 * 시드 포스트를 실제 Post 객체로 변환 (실제 timestamp 기반)
 */
export function buildPostFromSeed(seed: ChollimaSeedPost, minutesAgo = 5): Post {
  const initialComments: Comment[] = [];
  const postTimestamp = Date.now() - minutesAgo * 60 * 1000;

  // 댓글 체인 반영
  seed.commentsChain.forEach((c, idx) => {
    const commentMinutesAgo = Math.max(1, minutesAgo - (idx + 1));
    const commentTimestamp = Date.now() - commentMinutesAgo * 60 * 1000;
    initialComments.push({
      id: `c-ch-${seed.seedId}-${idx}-${Date.now()}`,
      author: c.author,
      content: c.content,
      createdAt: `${commentMinutesAgo}분 전`,
      minutesAgo: commentMinutesAgo,
      timestamp: commentTimestamp,
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
    timestamp: postTimestamp,
  };
}

/**
 * 🐎 천리마 Catch-up: 현실적인 누적 속도 (하루 1~2개로 엄격히 제한)
 * - 기존 글은 100% 영구 보존
 * - 최소 6시간 이상 경과 시 1개, 24시간 이상 경과 시 최대 2개만 살포시 누적
 */
export function runChollimaCatchup(existingPosts: Post[]): Post[] {
  if (typeof window === 'undefined') return existingPosts;

  const now = Date.now();
  const lastTickStr = localStorage.getItem(LAST_TICK_KEY);
  const usedIds = getUsedSeedIds();

  // 아직 사용되지 않고 기존 글 목록에 없는 시드만 필터링
  const availableSeeds = CHOLLIMA_POST_POOL.filter(
    (s) => !usedIds.includes(s.seedId) && !existingPosts.some((p) => p.title === s.title)
  );

  if (availableSeeds.length === 0) {
    localStorage.setItem(LAST_TICK_KEY, now.toString());
    return existingPosts;
  }

  let postsToAddCount = 0;

  if (!lastTickStr) {
    // 최초 접속 시 1개만 살포시 추가 (과도하지 않게)
    postsToAddCount = 1;
  } else {
    const diffHours = Math.floor((now - parseInt(lastTickStr, 10)) / (60 * 60 * 1000));
    if (diffHours >= 24) {
      // 24시간(하루) 이상 부재 시 최대 2개 누적
      postsToAddCount = Math.min(2, availableSeeds.length);
    } else if (diffHours >= 6) {
      // 6시간 이상 부재 시 1개 누적
      postsToAddCount = Math.min(1, availableSeeds.length);
    } else {
      // 6시간 미만은 추가하지 않고 자연스러운 상태 유지
      postsToAddCount = 0;
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
      const minutesAgo = (i + 1) * 25 + getRandomInt(5, 15);
      newPosts.push(buildPostFromSeed(seed, minutesAgo));
    }
  }

  // 기존 글 절대 삭제 없이 상단에 새 글 1~2개 얹기
  const combined = [...newPosts, ...existingPosts];
  savePosts(combined);
  return combined;
}

/**
 * 🐎 천리마 라이브 피드 (은근한 간격으로 1개씩 방출)
 */
export function fetchNextLivePost(existingPosts: Post[]): {
  post: Post;
  seed: ChollimaSeedPost;
} | null {
  if (typeof window === 'undefined') return null;

  const usedIds = getUsedSeedIds();
  const availableSeeds = CHOLLIMA_POST_POOL.filter(
    (s) => !usedIds.includes(s.seedId) && !existingPosts.some((p) => p.title === s.title)
  );

  if (availableSeeds.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableSeeds.length);
  const selectedSeed = availableSeeds[randomIndex];
  if (!selectedSeed) return null;

  markSeedAsUsed(selectedSeed.seedId);
  localStorage.setItem(LAST_TICK_KEY, Date.now().toString());

  const newPost: Post = {
    id: `post-ch-${selectedSeed.seedId}-${Date.now()}`,
    category: selectedSeed.category,
    title: selectedSeed.title,
    content: selectedSeed.content,
    author: selectedSeed.author,
    views: getRandomInt(selectedSeed.viewsRange[0] / 3, selectedSeed.viewsRange[0] / 2),
    likes: getRandomInt(2, 6),
    badge: selectedSeed.badge,
    comments: [],
    minutesAgo: 0,
    createdAt: '방금 전',
    timestamp: Date.now(),
  };

  return { post: newPost, seed: selectedSeed };
}

/**
 * 🐎 유저 댓글에 대한 '진짜 블로거 원작자'의 정겨운 맞답글 생성
 * 인위적인 멘트가 아닌, 실제 블로거들이 답방 갈 때 쓰는 생생한 말투
 */
export function generateAuthorReplyForComment(
  postAuthor: string,
  commentAuthor: string,
  commentText: string
): string {
  const text = commentText.toLowerCase();

  // 질문형 댓글 대응
  if (
    text.includes('?') ||
    text.includes('인가요') ||
    text.includes('있나요') ||
    text.includes('어떻게') ||
    text.includes('어디') ||
    text.includes('궁금')
  ) {
    const replies = [
      `${commentAuthor}님 질문 주셔서 감사해요! 제 경험상으로는 본문에 쓴 세팅대로 하니까 제일 깔끔하더라구요 ㅎㅎ 꼭 한번 시도해 보세요!`,
      `${commentAuthor}님 맞아요 저도 처음에 엄청 헷갈렸는데 몇 번 직접 해보니까 금방 익숙해지더라구요 :) 하시다가 막히시면 또 편하게 물어보세요!`,
      `${commentAuthor}님 좋은 질문이네요! 블로그 카테고리나 방문자수 따라 조금씩 다를 수는 있는데, 일단 알려드린 방법으로 해보시면 효과 보실 거예요 ㅎㅎ`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 칭찬 & 공감형 댓글 대응
  if (
    text.includes('감사') ||
    text.includes('축하') ||
    text.includes('대박') ||
    text.includes('꿀팁') ||
    text.includes('도움') ||
    text.includes('공감') ||
    text.includes('좋은')
  ) {
    const replies = [
      `${commentAuthor}님 따뜻한 댓글 남겨주셔서 큰 힘이 됩니다 ㅠㅠ 앞으로도 유용한 팁 자주 남길게요! 좋은 하루 보내세요 :)`,
      `${commentAuthor}님 공감해 주셔서 너무 감사해요 ㅎㅎ 이웃님도 블로그 하시는 일 다 술술 잘 풀리시길 진심으로 응원합니다!`,
      `${commentAuthor}님 찰떡같이 알아봐 주셔서 기분 좋네요 ㅋㅋㅋ 감기 조심하시고 오늘 포스팅도 화이팅입니다 ✨`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 일반 소통 및 일상 댓글 대응
  const defaultReplies = [
    `${commentAuthor}님 들러주시고 댓글 남겨주셔서 감사해요! 저도 이웃님 글 보러 답방 갈게요 ㅎㅎ`,
    `${commentAuthor}님 소중한 댓글 감사드립니다! 다들 비슷한 고민하시는 거 보니까 위로가 되네요 ㅠㅠ`,
    `${commentAuthor}님 댓글 감사합니다 ㅎㅎ 오늘 하루도 맛있는 거 많이 드시고 행복한 하루 보내세요!`,
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}
