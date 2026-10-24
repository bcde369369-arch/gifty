export interface ParsedCampaign {
  title: string;
  platform: string;
  visitDate: string;
  deadlineDate: string;
  benefitAmount: number;
  cashAmount: number;
  confidence: 'high' | 'medium';
}

const HEADER_TAG_REGEX = /^\[(리뷰노트|레뷰|REVU|강남맛집|디너의여왕|포포몬|POPOMON|미블|포블로그|서울오빠|슈퍼멤버스|오마이블로그|클립|링블|체리뷰|Web발신|알림톡|안내|당첨|선정)\]/i;

/** 날짜(Date) 객체를 YYYY-MM-DD 문자열로 변환 */
export function toDateInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 한국어 금액 문자열(예: "50,000원", "5만원", "3만 5천원", "15,000P")에서 숫자 추출 */
export function parseKoreanMoney(text: string): number {
  if (!text) return 0;

  // 1) "3만 5천", "5만", "10만" 패턴
  const manCheonMatch = text.match(/(\d+)\s*만\s*(?:(\d+)\s*천)?\s*(?:원|포인트|P|p)?/);
  if (manCheonMatch) {
    const man = parseInt(manCheonMatch[1], 10) * 10000;
    const cheon = manCheonMatch[2] ? parseInt(manCheonMatch[2], 10) * 1000 : 0;
    return man + cheon;
  }

  // 2) 일반 "50,000원", "10,000P", "30000원" 패턴
  const commaNumberMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:원|포인트|P|p|상당)/);
  if (commaNumberMatch) {
    const num = parseInt(commaNumberMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(num) && num >= 1000 && num <= 10000000) {
      return num;
    }
  }

  // 3) "5천원" 패턴
  const cheonOnlyMatch = text.match(/(\d+)\s*천\s*(?:원|포인트|P|p)/);
  if (cheonOnlyMatch) {
    return parseInt(cheonOnlyMatch[1], 10) * 1000;
  }

  return 0;
}

/** 텍스트에서 날짜(YYYY-MM-DD) 추출 */
function extractDatesFromLine(line: string): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const results: string[] = [];

  // 1. YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD
  const fullDateRegex = /(20\d{2})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})\s*일?/g;
  let match: RegExpExecArray | null;
  while ((match = fullDateRegex.exec(line)) !== null) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      results.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  if (results.length > 0) return results;

  // 2. MM월 DD일, MM.DD, MM/DD (연도 생략형)
  const shortDateRegex = /(?:^|[^\d])(\d{1,2})\s*(?:월|[./])\s*(\d{1,2})\s*일?(?=$|[^\d])/g;
  while ((match = shortDateRegex.exec(line)) !== null) {
    const m = parseInt(match[1], 10);
    const d = parseInt(match[2], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      let y = currentYear;
      if (m < now.getMonth() + 1 - 3) {
        y = currentYear + 1;
      }
      results.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  if (results.length > 0) return results;

  // 3. D-N (예: D-7, 마감 5일 전, 7일 남음)
  const dDayMatch = line.match(/(?:D\s*-\s*(\d{1,2})|(\d{1,2})\s*일\s*남음)/i);
  if (dDayMatch) {
    const daysLeft = parseInt(dDayMatch[1] || dDayMatch[2], 10);
    if (!isNaN(daysLeft) && daysLeft >= 0 && daysLeft <= 90) {
      const target = new Date(now.getTime() + daysLeft * 86400000);
      results.push(toDateInputString(target));
    }
  }

  return results;
}

/** 텍스트에서 플랫폼 자동 감지 (리뷰노트, 강남맛집, 디너의여왕, 레뷰, 포포몬 등) */
export function detectPlatform(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('리뷰노트') || lower.includes('reviewnote')) return '리뷰노트';
  if (lower.includes('강남맛집') || lower.includes('gnm') || lower.includes('xn--9d0b90c26k95c')) return '강남맛집';
  if (lower.includes('디너의여왕') || lower.includes('디너의 여왕') || lower.includes('여왕의 선택') || lower.includes('dinnerqueen')) return '디너의여왕';
  if (lower.includes('레뷰') || lower.includes('revu')) return '레뷰';
  if (lower.includes('포포몬') || lower.includes('popomon')) return '포포몬';
  if (lower.includes('미블') || lower.includes('미스터블로그') || lower.includes('mrblog')) return '미블';
  if (lower.includes('포블로그') || lower.includes('4blog')) return '포블로그';
  if (lower.includes('서울오빠') || lower.includes('seoulouba')) return '서울오빠';
  if (lower.includes('슈퍼멤버스') || lower.includes('supermembers')) return '슈퍼멤버스';
  if (lower.includes('오마이블로그')) return '오마이블로그';
  if (lower.includes('클립') || lower.includes('체리뷰') || lower.includes('링블')) return '기타';
  if (lower.includes('인스타') || lower.includes('협찬') || lower.includes('dm')) return '인스타협찬';
  return '리뷰노트';
}

/** 단일 캠페인 알림톡/문자/마이페이지 텍스트 블록 파싱 */
export function parseSingleCampaignBlock(rawBlock: string): ParsedCampaign | null {
  const cleaned = rawBlock.trim();
  if (!cleaned) return null;

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const platform = detectPlatform(cleaned);

  // 1. 캠페인 제목(업체명) 추출
  let title = '';

  // (A) 명시적 라벨: "캠페인명 : ...", "매장명: ...", "체험단명 : ...", "상품명 : ..."
  for (const line of lines) {
    const labelMatch = line.match(
      /^(?:[■▶▷•*-]\s*)?(?:캠페인명|캠페인\s*제목|캠페인|체험단명|체험단|업체명|매장명|상호명|상품명|제품명)\s*[:：-]\s*(.+)$/i
    );
    if (labelMatch && labelMatch[1].trim().length >= 2) {
      title = labelMatch[1].trim();
      break;
    }
  }

  // (B) 따옴표/괄호 안 선정 문구: "'[강남] OO식당' 캠페인에 선정되셨습니다" 또는 "[디너의여왕] OO캠페인에 선정"
  if (!title) {
    const quoteMatch = cleaned.match(
      /['"「『]([^'"」』\n\r]{2,50})['"」』]\s*(?:캠페인|체험단|리뷰어)?(?:에|으로)?\s*(?:선정|당첨)/
    );
    if (quoteMatch) {
      title = quoteMatch[1].trim();
    }
  }

  // (C) 대괄호 지역/카테고리형 제목 줄: "[성수/맛집] OO식당" (단, [리뷰노트], [강남맛집], [포포몬] 등 플랫폼 헤더 제외)
  if (!title) {
    for (const line of lines) {
      const strippedBullet = line.replace(/^[■▶▷•*-]\s*/, '').trim();
      if (HEADER_TAG_REGEX.test(strippedBullet)) continue;
      const bracketTitle = strippedBullet.match(/^(\[[가-힣a-zA-Z0-9\s/·,-]{1,15}\]\s*[^\n\r]{2,45})$/);
      if (bracketTitle) {
        title = bracketTitle[1].trim();
        break;
      }
    }
  }

  // (D) 첫 번째 의미 있는 줄 fallback
  if (!title) {
    for (const line of lines) {
      const stripped = line.replace(HEADER_TAG_REGEX, '').replace(/^[■▶▷•*-]\s*/, '').trim();
      if (!stripped) continue;
      if (
        /^(축하합니다|안녕하세요|선정\s*안내|캠페인\s*선정|리뷰어\s*선정|인플루언서\s*선정|여왕의\s*선택|리뷰\s*마감|제공\s*내역|방문\s*기간|등록\s*기간|⚠️|※|http)/i.test(
          stripped
        )
      ) {
        continue;
      }
      if (stripped.length >= 2 && stripped.length <= 50) {
        title = stripped;
        break;
      }
    }
  }

  // 2. 마감일(deadlineDate) 및 방문일(visitDate) 추출
  let deadlineDate = '';
  let visitDate = '';

  for (const line of lines) {
    const isDeadlineLine = /(?:마감|등록\s*기간|작성\s*기간|제출\s*기한|리뷰\s*기간|콘텐츠\s*등록|기간|까지|D-\d)/i.test(line);
    const isVisitLine = /(?:방문\s*일|예약\s*일|방문\s*예정|체크인|체험\s*일)/i.test(line);

    const dates = extractDatesFromLine(line);
    if (dates.length > 0) {
      if (isVisitLine && !visitDate) {
        visitDate = dates[0];
      } else if (isDeadlineLine) {
        deadlineDate = dates[dates.length - 1];
      } else if (!deadlineDate) {
        deadlineDate = dates[dates.length - 1];
      }
    }
  }

  if (!deadlineDate) {
    const fallbackDate = new Date(Date.now() + 10 * 86400000);
    deadlineDate = toDateInputString(fallbackDate);
  }

  // 3. 제공 혜택(benefitAmount) 및 원고료/포인트(cashAmount) 추출
  let benefitAmount = 0;
  let cashAmount = 0;

  for (const line of lines) {
    const isCashLine = /(?:포인트|원고료|지원금|페이백|캐시|리워드|\d+\s*P\b)/i.test(line);
    const isBenefitLine = /(?:제공\s*내역|제공\s*혜택|제공\s*상품|혜택|식사권|이용권|상품권|상당|제공|지원\s*내역)/i.test(line);
    const isPenaltyLine = /(?:페널티|위약금|과태료|벌금)/i.test(line);
    if (isPenaltyLine) continue;

    // 한 줄에 "50,000원 이용권 + 10,000P" 처럼 혜택과 포인트가 같이 있는 경우 분리 추출
    if (isBenefitLine && isCashLine && line.includes('+')) {
      const parts = line.split('+');
      for (const part of parts) {
        const amt = parseKoreanMoney(part);
        if (amt > 0) {
          if (/(?:포인트|원고료|지원금|페이백|캐시|\d+\s*P\b)/i.test(part) && !cashAmount) {
            cashAmount = amt;
          } else if (!benefitAmount) {
            benefitAmount = amt;
          }
        }
      }
      continue;
    }

    const amount = parseKoreanMoney(line);
    if (amount > 0) {
      if (isCashLine && !cashAmount) {
        cashAmount = amount;
      } else if (isBenefitLine && !benefitAmount) {
        benefitAmount = amount;
      } else if (!benefitAmount) {
        benefitAmount = amount;
      }
    }
  }

  if (!title) {
    title = `${platform} 당첨 캠페인`;
  }

  return {
    title,
    platform,
    visitDate,
    deadlineDate,
    benefitAmount,
    cashAmount,
    confidence: title !== `${platform} 당첨 캠페인` ? 'high' : 'medium',
  };
}

/**
 * 카톡 알림톡 1건 또는 여러 플랫폼(리뷰노트, 강남맛집, 디너의여왕, 레뷰, 포포몬 등)의
 * 당첨 내역 여러 건을 한꺼번에 복사한 텍스트를 분석하여 배열로 반환
 */
export function parseCampaignsFromText(rawText: string): ParsedCampaign[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // 여러 건의 알림톡이나 빈 줄 2개 이상으로 구분된 블록 분리
  const blocks = trimmed
    .split(/(?=\[(?:리뷰노트|레뷰|REVU|강남맛집|디너의여왕|포포몬|POPOMON|미블|포블로그|서울오빠)\])|\n\s*\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length >= 6);

  if (blocks.length > 1) {
    const parsedList = blocks
      .map((b) => parseSingleCampaignBlock(b))
      .filter((item): item is ParsedCampaign => item !== null);
    if (parsedList.length > 0) return parsedList;
  }

  const single = parseSingleCampaignBlock(trimmed);
  return single ? [single] : [];
}

/** 플랫폼별 당첨 알림톡 예시 텍스트 반환 */
export function getSampleCampaignText(platform = 'all'): string {
  switch (platform) {
    case '리뷰노트':
      return `[리뷰노트] 캠페인 선정 안내
축하합니다! 신청하신 캠페인에 선정되셨습니다.
■ 캠페인명 : [성수/맛집] 성수동 화덕피자 & 파스타 2인 식사권
■ 제공내역 : 50,000원 자유 이용권 + 리뷰 포인트 10,000P
■ 방문예약일 : 2026.10.28
■ 리뷰 마감일 : 2026.11.05 까지`;
    case '강남맛집':
      return `[강남맛집] 리뷰어 선정 안내
안녕하세요! 신청하신 캠페인 리뷰어로 선정되셨습니다.
▶ 매장명 : [강남/역삼] 프리미엄 숙성 한우 오마카세
▶ 제공내역 : 80,000원 식사권 제공
▶ 방문 및 리뷰마감일 : 2026.10.25 ~ 2026.11.07`;
    case '디너의여왕':
      return `[디너의여왕] 여왕의 선택! 캠페인 선정 안내
축하합니다! '[잠실/송리단길] 수제 버거 & 감자튀김 2인 세트' 캠페인에 선정되셨습니다.
- 제공내역 : 35,000원 상당 식사권
- 콘텐츠 등록기간 : 10월 25일 ~ 11월 6일`;
    case '레뷰':
      return `[레뷰] 인플루언서 선정 안내
신청하신 캠페인의 인플루언서로 선정되었습니다.
• 캠페인 : [홍대/연남] 감성 브런치 카페 & 디저트
• 제공내역 : 4만원 이용권 + 5,000P
• 콘텐츠 등록기간 : 2026.10.26 ~ 2026.11.08`;
    case '포포몬':
      return `[포포몬] 체험단 선정 안내
축하합니다! 포포몬 캠페인에 당첨되셨습니다.
■ 캠페인명 : [종로/익선동] 전통 한옥 다이닝 2인 코스
■ 제공내역 : 60,000원 상당 식사권 + 포인트 15,000원
■ 리뷰 등록기간 : 2026-10-25 ~ 2026-11-09`;
    default:
      return `[리뷰노트] 캠페인 선정 안내
■ 캠페인명 : [성수/맛집] 성수동 화덕피자 2인 식사권
■ 제공내역 : 50,000원 이용권 + 10,000P
■ 리뷰 마감일 : 2026.11.05

[강남맛집] 리뷰어 선정 안내
▶ 매장명 : [강남] 숙성 삼겹살 스페셜 세트
▶ 제공내역 : 45,000원 식사권
▶ 리뷰마감일 : 2026.11.08

[포포몬] 체험단 선정 안내
■ 캠페인명 : [연남동] 수제 디저트 & 커피 2인 세트
■ 제공내역 : 30,000원 이용권 + 포인트 5,000P
■ 리뷰 등록기간 : 2026.10.25 ~ 2026.11.10`;
  }
}

/**
 * PC 브라우저 즐겨찾기 바에 등록해 리뷰노트·강남맛집·디너의여왕·레뷰·포포몬 등
 * 모든 체험단 사이트에서 1클릭으로 당첨 내역을 Gifty 다이어리로 보내는 북마클릿 생성
 */
export function getQuickImportBookmarklet(siteOrigin = 'https://gifty.run'): string {
  const code = `(function(){var h=location.hostname.toLowerCase();var p='리뷰노트';if(h.indexOf('revu')>-1)p='레뷰';else if(h.indexOf('dinnerqueen')>-1)p='디너의여왕';else if(h.indexOf('popomon')>-1)p='포포몬';else if(h.indexOf('seoulouba')>-1)p='서울오빠';else if(h.indexOf('mrblog')>-1)p='미블';else if(h.indexOf('4blog')>-1)p='포블로그';else if(h.indexOf('gnm')>-1||h.indexOf('xn--9d0b90c26k95c')>-1||document.title.indexOf('강남맛집')>-1)p='강남맛집';var s=window.getSelection?window.getSelection().toString().trim():'';if(!s){var els=document.querySelectorAll('h1,h2,h3,h4,[class*="title"],[class*="campaign"],[class*="item"],[class*="subject"]');var arr=[];for(var i=0;i<Math.min(els.length,15);i++){var t=(els[i].innerText||'').trim();if(t.length>4&&t.length<120)arr.push(t);}s=arr.slice(0,5).join('\\n');}if(!s){s=document.title;}window.open('${siteOrigin}/experience-diary?autoImport='+encodeURIComponent('['+p+']\\n'+s),'_blank');})();`;
  return `javascript:${code}`;
}
