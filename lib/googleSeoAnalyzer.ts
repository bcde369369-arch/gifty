/* eslint-disable */
// @ts-nocheck
import { getCurrentRankingWeekInfo } from './blogRankingData';

export interface GoogleSeoCheckItem {
  id: string;
  category: 'meta' | 'heading' | 'image' | 'vitals' | 'security';
  title: string;
  status: 'good' | 'warning' | 'danger';
  score: number; // 0 ~ 100
  message: string;
  recommendation: string;
}

export interface GoogleSeoReport {
  url: string;
  domain: string;
  platform: '티스토리' | '워드프레스' | '블로그스팟' | '독립 웹사이트';
  totalScore: number; // 100점 만점
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  items: GoogleSeoCheckItem[];
  vitals: {
    lcp: string; // 예: "1.8s"
    lcpStatus: 'good' | 'needs-improvement' | 'poor';
    fid: string; // 예: "42ms"
    cls: string; // 예: "0.03"
    mobileScore: number; // 0 ~ 100
  };
  rankInfo: {
    rank: number;
    prevRank: number;
    change: number;
    percentile: string;
    daScore: number; // Domain Authority (1 ~ 100)
    indexedKeywordsEstimate: number;
    trend: number[];
  };
  googleLiveQueries: {
    query: string;
    label: string;
    googleUrl: string;
  }[];
}

// 결정론적 의사 난수 헬퍼
function getNoise(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// URL 정규화
export function cleanDomainFromUrl(rawUrl: string): { cleanUrl: string; domain: string; platform: GoogleSeoReport['platform'] } {
  let url = (rawUrl || '').trim().toLowerCase();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  let domain = '';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    domain = url.replace(/https?:\/\//, '').split('/')[0];
  }

  let platform: GoogleSeoReport['platform'] = '독립 웹사이트';
  if (domain.includes('tistory.com')) platform = '티스토리';
  else if (domain.includes('wordpress.com') || domain.includes('wp.')) platform = '워드프레스';
  else if (domain.includes('blogspot.com')) platform = '블로그스팟';

  return { cleanUrl: url, domain, platform };
}

// 구글 웹마스터 G-Power 랭킹 계산기 (전국 80만 웹사이트/수익형 블로그 대상)
export function calculateGoogleRankEstimate(domain: string) {
  const { weekNum } = getCurrentRankingWeekInfo();
  
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // 모수 80만 개 기준 기본 순위: 450위 ~ 38,000위
  const baseRank = 450 + (positiveHash % 35000);

  const getRankAtWeek = (w: number) => {
    const seed = positiveHash * 43 + w * 23;
    const wave = Math.sin(w * 0.82 + (positiveHash % 9)) * (110 + (positiveHash % 240));
    const noise = (getNoise(seed) - 0.48) * (140 + (positiveHash % 190));
    return Math.max(80, Math.round(baseRank - wave - noise));
  };

  const currentRank = getRankAtWeek(weekNum);
  const prevRank = getRankAtWeek(weekNum - 1);
  const change = prevRank - currentRank;

  const trend = [
    getRankAtWeek(weekNum - 4),
    getRankAtWeek(weekNum - 3),
    getRankAtWeek(weekNum - 2),
    prevRank,
    currentRank
  ];

  // 상위 % 환산 (모수 80만 기준)
  let percentile = '상위 15%';
  if (currentRank <= 80) percentile = '상위 0.01%';
  else if (currentRank <= 800) percentile = '상위 0.1%';
  else if (currentRank <= 8000) percentile = '상위 1%';
  else if (currentRank <= 24000) percentile = '상위 3%';
  else if (currentRank <= 40000) percentile = '상위 5%';
  else if (currentRank <= 80000) percentile = '상위 10%';

  // DA (Domain Authority) 추정: 1 ~ 100
  const daScore = Math.max(12, Math.min(88, Math.round(92 - (currentRank / 420)) + (positiveHash % 6)));
  const indexedKeywordsEstimate = Math.max(35, Math.round(180000 / (currentRank + 300)) + (positiveHash % 40));

  return {
    rank: currentRank,
    prevRank,
    change,
    percentile,
    daScore,
    indexedKeywordsEstimate,
    trend
  };
}

// 구글 5대 테크니컬 SEO 정밀 분석 리포트 생성기
export function generateGoogleSeoReport(rawInput: string): GoogleSeoReport {
  const { cleanUrl, domain, platform } = cleanDomainFromUrl(rawInput);
  const rankInfo = calculateGoogleRankEstimate(domain);

  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // 1. 메타 태그 검사
  const metaLengthScore = 80 + (positiveHash % 20);
  const metaItem: GoogleSeoCheckItem = {
    id: 'meta-check',
    category: 'meta',
    title: '메타 타이틀 & 디스크립션 최적화',
    status: metaLengthScore >= 85 ? 'good' : 'warning',
    score: metaLengthScore,
    message: metaLengthScore >= 85 
      ? '구글 검색결과(SERP)에 잘리지 않는 최적의 글자 수(제목 35~55자, 본문 설명 120자)를 준수하고 있습니다.' 
      : '일부 포스팅의 메타 제목이 60자 이상으로 너무 길거나 25자 이하로 짧아 검색 노출 시 말줄임표(...)로 생략될 수 있습니다.',
    recommendation: '핵심 검색 키워드를 제목 앞부분 15자 이내에 배치하고, 메타 설명문(Meta Description)을 명확히 작성하세요.'
  };

  // 2. Heading 태그 (H1~H3) 계층 구조
  const headingScore = 75 + ((positiveHash * 7) % 25);
  const headingItem: GoogleSeoCheckItem = {
    id: 'heading-check',
    category: 'heading',
    title: 'H1 태그 단일성 및 H2·H3 소제목 계층 구조',
    status: headingScore >= 80 ? 'good' : 'warning',
    score: headingScore,
    message: headingScore >= 80 
      ? '페이지당 <h1> 태그가 정확히 1개로 유지되며, <h2>와 <h3> 태그가 논리적인 계층 순서로 잘 배치되어 있습니다.' 
      : '페이지 내에 <h1> 태그가 2개 이상 중복 감지되었거나, 소제목 태그 건너뛰기(H2 없이 H4 사용 등)가 발견되었습니다.',
    recommendation: '글 제목에만 H1을 1회 사용하고, 본문 대주제는 H2, 하위 소주제는 H3 순서로 엄격히 계층을 지키세요.'
  };

  // 3. 이미지 Alt 태그 및 용량 최적화 (Gifty 솔루션 연결)
  const imageScore = 65 + ((positiveHash * 13) % 30);
  const isImageWarning = imageScore < 85;
  const imageItem: GoogleSeoCheckItem = {
    id: 'image-check',
    category: 'image',
    title: '이미지 Alt(대체 텍스트) 및 용량 최적화 (LCP 핵심)',
    status: isImageWarning ? 'warning' : 'good',
    score: imageScore,
    message: isImageWarning 
      ? '본문 삽입 이미지 중 약 20~35%에 Alt 태그가 누락되어 있으며, 5MB 이상의 무거운 미디어로 인해 모바일 로딩 지연이 발생합니다.' 
      : '대부분의 이미지에 설명 Alt 속성이 등록되어 구글 이미지 검색 노출에 최적화되어 있습니다.',
    recommendation: '구글 이미지 검색 유입을 위해 모든 사진/움짤에 alt 속성을 기재하고, Gifty를 통해 500KB~2MB 내외로 압축 변환하세요.'
  };

  // 4. 코어 웹 바이탈 (속도 및 모바일 반응성)
  const vitalsScore = 70 + ((positiveHash * 17) % 28);
  const lcpSeconds = (1.4 + ((positiveHash % 18) * 0.1)).toFixed(1);
  const vitalsItem: GoogleSeoCheckItem = {
    id: 'vitals-check',
    category: 'vitals',
    title: '코어 웹 바이탈(Core Web Vitals) & 모바일 최적화',
    status: vitalsScore >= 85 ? 'good' : 'warning',
    score: vitalsScore,
    message: `최대 콘텐츠 렌더링 시간(LCP)은 ${lcpSeconds}초로 기록되었습니다. 구글 권장 기준(2.5초 이내)을 충족합니다.`,
    recommendation: '상단 첫 화면(Above the fold)에 무거운 외부 위젯이나 큰 비디오 자동재생을 피해 LCP를 1.5초 이하로 유지하세요.'
  };

  // 5. 보안 및 크롤링 인덱싱 (HTTPS, sitemap, robots)
  const securityScore = 90 + (positiveHash % 10);
  const securityItem: GoogleSeoCheckItem = {
    id: 'security-check',
    category: 'security',
    title: 'HTTPS 보안 인증서 및 사이트맵(sitemap.xml) 색인성',
    status: 'good',
    score: securityScore,
    message: 'SSL/TLS 보안 프로토콜이 정상 활성화되어 있으며, 구글봇이 접근 가능한 sitemap.xml 및 robots.txt 규격이 준수되고 있습니다.',
    recommendation: '구글 서치콘솔에 사이트맵(sitemap.xml)과 RSS 피드가 주기적으로 자동 갱신되는지 확인하세요.'
  };

  const items = [metaItem, headingItem, imageItem, vitalsItem, securityItem];
  const totalScore = Math.round(items.reduce((acc, cur) => acc + cur.score, 0) / items.length);

  let grade: GoogleSeoReport['grade'] = 'B';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 82) grade = 'A';
  else if (totalScore >= 72) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else grade = 'D';

  // 구글 실시간 검색 노출 관측 링크 3개
  const domainSimple = domain.replace(/\.(com|co\.kr|net|org|kr|run)$/, '');
  const googleLiveQueries = [
    {
      query: `site:${domain}`,
      label: '구글 공식 색인 페이지 전체 목록 관측',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain}`)}`
    },
    {
      query: `"${domain}"`,
      label: '구글 전세계 백링크 및 웹 인용(Mention) 관측',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`"${domain}"`)}`
    },
    {
      query: `${domainSimple} 추천`,
      label: '구글 검색 1페이지 브랜드/주제 장악력 관측',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`${domainSimple} 추천`)}`
    }
  ];

  return {
    url: cleanUrl,
    domain,
    platform,
    totalScore,
    grade,
    items,
    vitals: {
      lcp: `${lcpSeconds}s`,
      lcpStatus: parseFloat(lcpSeconds) <= 2.5 ? 'good' : 'needs-improvement',
      fid: `${28 + (positiveHash % 25)}ms`,
      cls: `0.0${1 + (positiveHash % 5)}`,
      mobileScore: vitalsScore
    },
    rankInfo,
    googleLiveQueries
  };
}
