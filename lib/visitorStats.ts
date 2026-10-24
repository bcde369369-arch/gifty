const NAMESPACE = 'gifty_run_prod_v1';
const BASE_URL = `https://api.counterapi.dev/v1/${NAMESPACE}`;
const LOCAL_CACHE_KEY = 'gifty_visitor_stats_cache_v2';

export interface DailyStatItem {
  date: string;      // YYYY-MM-DD
  label: string;     // MM/DD (요일)
  visitors: number;
}

export interface PageStatItem {
  id: string;
  path: string;
  name: string;
  emoji: string;
  color: string;
  badgeBg: string;
  todayViews: number;
  totalViews: number;
  todayPercent: number;
  totalPercent: number;
}

export interface VisitorStatsSummary {
  todayVisitors: number;
  yesterdayVisitors: number;
  totalVisitors: number;
  todayPageviews: number;
  totalPageviews: number;
  last7Days: DailyStatItem[];
  pageStats: PageStatItem[];
  updatedAt: string;
}

export const TRACKED_PAGES: Omit<PageStatItem, 'todayViews' | 'totalViews' | 'todayPercent' | 'totalPercent'>[] = [
  {
    id: 'home',
    path: '/',
    name: '홈 (GIF 움짤 변환기)',
    emoji: '🎬',
    color: 'from-indigo-500 to-blue-500',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'community',
    path: '/community',
    name: '블로그 커뮤니티',
    emoji: '💬',
    color: 'from-violet-500 to-indigo-500',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'diary',
    path: '/experience-diary',
    name: '체험단 다이어리',
    emoji: '📓',
    color: 'from-blue-500 to-cyan-500',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'sticker',
    path: '/sticker',
    name: '블로그 스티커 제작',
    emoji: '🎨',
    color: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    id: 'removebg',
    path: '/remove-bg',
    name: 'AI 무료 누끼따기',
    emoji: '✂️',
    color: 'from-purple-500 to-fuchsia-500',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'guide',
    path: '/guide',
    name: '움짤 꿀팁 가이드',
    emoji: '📚',
    color: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

/** 현재 경로(pathname)를 추적 대상 페이지 ID로 매핑 */
export function resolvePageId(pathname: string): string | null {
  if (!pathname || pathname.startsWith('/admin')) return null;
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/experience-diary')) return 'diary';
  if (pathname.startsWith('/sticker')) return 'sticker';
  if (pathname.startsWith('/remove-bg')) return 'removebg';
  if (pathname.startsWith('/guide')) return 'guide';
  return 'home';
}

/** 한국 시간(KST) 기준 YYYY-MM-DD 문자열 반환 */
export function getKstDateString(daysOffset = 0): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000 + daysOffset * 86400000);
  return kstTime.toISOString().slice(0, 10);
}

/** MM/DD (요일) 포맷 반환 */
export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}/${d}(${weekDays[dateObj.getDay()]})`;
}

async function fetchCounterValue(key: string, increment = false): Promise<number> {
  try {
    const endpoint = increment ? `${BASE_URL}/${key}/up` : `${BASE_URL}/${key}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data?.count === 'number' ? data.count : 0;
  } catch {
    return 0;
  }
}

/**
 * 일반 페이지 접속/이동 시 일방문자(UV), 전체 페이지뷰(PV), 카테고리별 페이지뷰 카운트 증가
 * (관리자 페이지 /admin 접속은 제외)
 */
export async function trackSiteVisit(customPathname?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const pathname = customPathname || window.location.pathname;
  const pageId = resolvePageId(pathname);
  if (!pageId) return;

  const todayStr = getKstDateString(0);
  const lastVisitDate = localStorage.getItem('gifty_last_uv_date');

  // 동일 페이지에서 15초 이내 연속 새로고침 중복 카운트 방지 (다른 카테고리 클릭 시에는 즉시 카운트)
  const cooldownKey = `gifty_pv_ts_${pageId}`;
  const lastPageTs = Number(sessionStorage.getItem(cooldownKey) || '0');
  const nowTs = Date.now();
  const shouldCountPageview = nowTs - lastPageTs > 15000;

  try {
    const tasks: Promise<number>[] = [];

    // 1. 오늘 첫 방문인 경우 -> 일방문자(UV) & 누적 방문자(Total UV) +1
    if (lastVisitDate !== todayStr) {
      localStorage.setItem('gifty_last_uv_date', todayStr);
      tasks.push(
        fetchCounterValue(`uv_${todayStr}`, true),
        fetchCounterValue('total_uv', true)
      );
    }

    // 2. 페이지 클릭/이동 시 -> 전체 오늘/누적 PV 및 해당 카테고리 오늘/누적 PV +1
    if (shouldCountPageview) {
      sessionStorage.setItem(cooldownKey, String(nowTs));
      tasks.push(
        fetchCounterValue(`pv_${todayStr}`, true),
        fetchCounterValue('total_pv', true),
        fetchCounterValue(`pv_page_${pageId}_${todayStr}`, true),
        fetchCounterValue(`total_pv_page_${pageId}`, true)
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  } catch {
    // 네트워크 차단(애드블록 등) 시 무시
  }
}

/**
 * 관리자 대시보드용 전체 통계 조회 (최근 7일 일별 방문자 + 오늘/어제/누적 + 페이지별 클릭 순위)
 */
export async function getAdminVisitorStats(): Promise<VisitorStatsSummary> {
  const todayStr = getKstDateString(0);

  // 최근 7일 날짜 배열 (6일 전 ~ 오늘)
  const dateList: string[] = [];
  for (let i = -6; i <= 0; i++) {
    dateList.push(getKstDateString(i));
  }

  try {
    const [
      totalUv,
      totalPv,
      todayPv,
      dailyUvCounts,
      todayPageCounts,
      totalPageCounts,
    ] = await Promise.all([
      fetchCounterValue('total_uv', false),
      fetchCounterValue('total_pv', false),
      fetchCounterValue(`pv_${todayStr}`, false),
      Promise.all(dateList.map((d) => fetchCounterValue(`uv_${d}`, false))),
      Promise.all(TRACKED_PAGES.map((p) => fetchCounterValue(`pv_page_${p.id}_${todayStr}`, false))),
      Promise.all(TRACKED_PAGES.map((p) => fetchCounterValue(`total_pv_page_${p.id}`, false))),
    ]);

    const last7Days: DailyStatItem[] = dateList.map((d, idx) => ({
      date: d,
      label: d === todayStr ? '오늘' : formatDateLabel(d),
      visitors: dailyUvCounts[idx] || 0,
    }));

    const todayVisitors = dailyUvCounts[dailyUvCounts.length - 1] || 0;
    const yesterdayVisitors = dailyUvCounts[dailyUvCounts.length - 2] || 0;

    const sumTodayPages = todayPageCounts.reduce((a, b) => a + b, 0);
    const sumTotalPages = totalPageCounts.reduce((a, b) => a + b, 0);

    const sum7Days = dailyUvCounts.reduce((a, b) => a + b, 0);
    const safeTotalVisitors = Math.max(totalUv, sum7Days, todayVisitors);
    const safeTodayPageviews = Math.max(todayPv, sumTodayPages, todayVisitors);
    const safeTotalPageviews = Math.max(totalPv, sumTotalPages, safeTotalVisitors, safeTodayPageviews);

    // 페이지별 통계 및 점유율(%) 계산
    const denomToday = Math.max(1, sumTodayPages);
    const denomTotal = Math.max(1, sumTotalPages);

    const pageStats: PageStatItem[] = TRACKED_PAGES.map((p, idx) => {
      const tViews = todayPageCounts[idx] || 0;
      const totViews = Math.max(totalPageCounts[idx] || 0, tViews);
      return {
        ...p,
        todayViews: tViews,
        totalViews: totViews,
        todayPercent: sumTodayPages > 0 ? Math.round((tViews / denomToday) * 100) : 0,
        totalPercent: sumTotalPages > 0 ? Math.round((totViews / denomTotal) * 100) : 0,
      };
    });

    const now = new Date();
    const updatedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const summary: VisitorStatsSummary = {
      todayVisitors,
      yesterdayVisitors,
      totalVisitors: safeTotalVisitors,
      todayPageviews: safeTodayPageviews,
      totalPageviews: safeTotalPageviews,
      last7Days,
      pageStats,
      updatedAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(summary));
    }

    return summary;
  } catch {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // ignore
        }
      }
    }
    return {
      todayVisitors: 0,
      yesterdayVisitors: 0,
      totalVisitors: 0,
      todayPageviews: 0,
      totalPageviews: 0,
      last7Days: dateList.map((d) => ({
        date: d,
        label: d === todayStr ? '오늘' : formatDateLabel(d),
        visitors: 0,
      })),
      pageStats: TRACKED_PAGES.map((p) => ({
        ...p,
        todayViews: 0,
        totalViews: 0,
        todayPercent: 0,
        totalPercent: 0,
      })),
      updatedAt: '-',
    };
  }
}
