export interface AutoCommentResult {
  author: string;
  content: string;
  minutesAgo: number;
}

// 블로거 친화적인 리얼 닉네임 목록
const BLOGGER_AUTHORS = [
  '망원동푸디',
  '소소한일상',
  '성수동주민',
  '열혈리뷰어',
  '초보탈출',
  '달콤한하루',
  '고기사랑',
  '카페탐방러',
  '주말나들이',
  '직장인블로그',
];

function pickRandomAuthor(exclude?: string): string {
  const filtered = BLOGGER_AUTHORS.filter((a) => a !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)] || '이웃블로거';
}

/**
 * 글의 제목, 본문, 카테고리를 깊이 있게 분석하여
 * 실제 블로거 이웃이 작성한 것 같은 100% 맥락 맞춤형 자연스러운 댓글 생성
 */
export function generateSmartComments(
  title: string,
  content: string,
  category: string
): AutoCommentResult[] {
  const text = `${title} ${content}`.toLowerCase();

  // 1. 기능 건의 / 칭찬 / 운영자 호출
  if (
    category === 'feedback' ||
    text.includes('운영자') ||
    text.includes('개발자') ||
    text.includes('키프티') ||
    text.includes('gifty') ||
    text.includes('업데이트') ||
    text.includes('기능') ||
    text.includes('에러') ||
    text.includes('버그')
  ) {
    return [
      {
        author: 'Gifty운영자',
        content:
          '소중한 의견 남겨주셔서 진심으로 감사드립니다! 말씀해 주신 내용 꼼꼼히 확인해서 다음 업데이트에 적극 반영하도록 하겠습니다. 이용하시면서 불편한 점이나 필요한 기능이 있으시면 언제든 편하게 말씀해 주세요 :)',
        minutesAgo: 1,
      },
    ];
  }

  // 2. 축하 & 당첨 & 정산 & 식비 방어
  if (
    category === 'settlement' ||
    text.includes('당첨') ||
    text.includes('선정') ||
    text.includes('원고료') ||
    text.includes('정산') ||
    text.includes('식비') ||
    text.includes('밥값') ||
    text.includes('방어') ||
    text.includes('붙었') ||
    text.includes('완주') ||
    text.includes('합격')
  ) {
    const author1 = pickRandomAuthor();
    const author2 = pickRandomAuthor(author1);

    const comments: AutoCommentResult[] = [
      {
        author: author1,
        content: text.includes('원고료')
          ? '우와 원고료까지 대박이네요 축하드려요!! 밥값 방어에 용돈까지 쏠쏠하시겠습니다 ㅎㅎ 저도 자극받고 오늘 신청하러 가야겠어요!'
          : '우와 축하드립니다!! 요즘 경쟁률 높은데 당첨되시다니 대단하세요 ㅎㅎ 맛있게 드시고 정성 리뷰 남겨주세요!',
        minutesAgo: 1,
      },
    ];

    // 질문이 포함된 두 번째 댓글
    if (Math.random() > 0.3) {
      comments.push({
        author: author2,
        content: text.includes('리뷰노트') || text.includes('레뷰')
          ? '부럽습니다 ㅎㅎ 저도 그쪽 지역 자주 보는데 경쟁률 빡세던데 노하우가 있으신가요?!'
          : '축하드려요! 혹시 주로 어떤 플랫폼 위주로 신청하셨는지 여쭤봐도 될까요?!',
        minutesAgo: 2,
      });
    }

    return comments;
  }

  // 3. 고민 & 하소연 & 불친절 & 광탈 & 스트레스
  if (
    text.includes('불친절') ||
    text.includes('사장님') ||
    text.includes('광탈') ||
    text.includes('탈락') ||
    text.includes('ㅠㅠ') ||
    text.includes('속상') ||
    text.includes('떨어') ||
    text.includes('민망') ||
    text.includes('눈치') ||
    text.includes('스트레스') ||
    text.includes('힘드')
  ) {
    const author1 = pickRandomAuthor();
    return [
      {
        author: author1,
        content: text.includes('사장님') || text.includes('불친절')
          ? '헐 진짜 속상하고 당황하셨겠어요 ㅠㅠ 그럴 땐 감정적으로 악평 쓰기보다는 플랫폼 1:1 고객센터에 먼저 매장 앞 사진이랑 같이 문의 남겨두시는 게 제일 안전합니다. 힘내세요 토닥토닥!'
          : '저도 초반에 진짜 매일 광탈만 당해서 접을까 했었는데 공감되네요 ㅠㅠ 방문자수 적을 땐 평일 낮이나 새로 오픈한 신규 매장 위주로 노리시면 승률 잘 나옵니다! 파이팅하세요!',
        minutesAgo: 1,
      },
    ];
  }

  // 4. 질문형 글 (공정위, 꿀팁, 방법 문의 등)
  if (
    text.includes('?') ||
    text.includes('인가요') ||
    text.includes('있나요') ||
    text.includes('어떨까요') ||
    text.includes('궁금') ||
    text.includes('어떻게') ||
    text.includes('질문')
  ) {
    const author1 = pickRandomAuthor();

    if (text.includes('공정위') || text.includes('배너') || text.includes('수정')) {
      return [
        {
          author: author1,
          content:
            '공정위 문구는 누락 시 과태료 대상이라 늦게라도 발견 즉시 추가하시는 게 맞습니다! 본문 하단에 텍스트나 배너 1줄 추가하는 건 검색 순위에 영향 없으니 안심하고 수정하세요 :)',
          minutesAgo: 1,
        },
      ];
    }

    if (text.includes('원고료') || text.includes('세금') || text.includes('입금')) {
      return [
        {
          author: author1,
          content:
            '원고료는 플랫폼마다 조금씩 다른데 보통 리뷰 마감 후 익월 15일이나 말일에 사업소득세 3.3% 원천징수 떼고 계좌로 깔끔하게 입금됩니다 ㅎㅎ',
          minutesAgo: 1,
        },
      ];
    }

    if (text.includes('플랫폼') || text.includes('어디')) {
      return [
        {
          author: author1,
          content:
            '초보 블로거이시면 레뷰보다는 리뷰노트나 강남맛집 쪽이 방문자수 적어도 당첨이 훨씬 잘 되는 편이에요! 신청 한마디 정성스럽게 적으시면 승률 확 오릅니다.',
          minutesAgo: 1,
        },
      ];
    }

    return [
      {
        author: author1,
        content:
          '제 경험상으로는 본문에 고화질 움짤 2개 정도 넣고 글자수 1,500자 이상 채우면 상위노출도 잘 되고 사장님들도 다음 체험단에 또 뽑아주시더라구요! 참고해보세요 ㅎㅎ',
        minutesAgo: 1,
      },
    ];
  }

  // 5. 꿀팁 & 정보 공유 글
  if (
    category === 'tips' ||
    text.includes('꿀팁') ||
    text.includes('팁') ||
    text.includes('노하우') ||
    text.includes('공유') ||
    text.includes('방법')
  ) {
    const author1 = pickRandomAuthor();
    return [
      {
        author: author1,
        content:
          '와 진짜 실전 꿀팁이네요!! 스크랩해두고 다음 포스팅 쓸 때 꼭 적용해 봐야겠습니다. 정성스러운 정보 공유 감사합니다 ㅎㅎ',
        minutesAgo: 1,
      },
    ];
  }

  // 6. 일반 일상 & 자유 수다
  const author1 = pickRandomAuthor();
  return [
    {
      author: author1,
      content:
        '공감하면서 글 재밌게 잘 읽었습니다 ㅎㅎ 날씨도 좋은데 맛있는 거 많이 드시고 오늘도 즐거운 블로그 라이프 되세요~!',
      minutesAgo: 1,
    },
  ];
}
