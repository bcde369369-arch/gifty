const NAMESPACE = 'gifty_run_prod_v1';
const BASE_URL = `https://api.counterapi.dev/v1/${NAMESPACE}`;
const LOCAL_CACHE_KEY = 'gifty_visitor_stats_cache_v1';

export interface DailyStatItem {
  date: string;      // YYYY-MM-DD
  label: string;     // MM/DD (요일)
  visitors: number;
}

export interface VisitorStatsSummary {
  todayVisitors: number;
  yesterdayVisitors: number;
  totalVisitors: number;
  todayPageviews: number;
  totalPageviews: number;
  last7Days: DailyStatItem[];
  updatedAt: string;
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
 * 일반 페이지 접속 시 일방문자(UV) 및 페이지뷰(PV) 카운트 증가
 * (관리자 페이지 /admin 접속은 제외)
 */
export async function trackSiteVisit(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/admin')) return;

  const todayStr = getKstDateString(0);
  const lastVisitDate = localStorage.getItem('gifty_last_uv_date');
  const sessionPvCounted = sessionStorage.getItem('gifty_session_pv_counted');

  try {
    // 1. 오늘 첫 방문인 경우 -> 일방문자(UV) & 누적 방문자(Total UV) +1
    if (lastVisitDate !== todayStr) {
      localStorage.setItem('gifty_last_uv_date', todayStr);
      await Promise.all([
        fetchCounterValue(`uv_${todayStr}`, true),
        fetchCounterValue('total_uv', true),
      ]);
    }

    // 2. 이번 세션 첫 접속인 경우 -> 오늘 페이지뷰(PV) & 누적 페이지뷰(Total PV) +1
    if (sessionPvCounted !== '1') {
      sessionStorage.setItem('gifty_session_pv_counted', '1');
      await Promise.all([
        fetchCounterValue(`pv_${todayStr}`, true),
        fetchCounterValue('total_pv', true),
      ]);
    }
  } catch {
    // 네트워크 차단(애드블록 등) 시 무시
  }
}

/**
 * 관리자 대시보드용 전체 통계 조회 (최근 7일 일별 방문자 + 오늘/어제/누적)
 */
export async function getAdminVisitorStats(): Promise<VisitorStatsSummary> {
  const todayStr = getKstDateString(0);

  // 최근 7일 날짜 배열 (6일 전 ~ 오늘)
  const dateList: string[] = [];
  for (let i = -6; i <= 0; i++) {
    dateList.push(getKstDateString(i));
  }

  try {
    const [totalUv, totalPv, todayPv, ...dailyUvCounts] = await Promise.all([
      fetchCounterValue('total_uv', false),
      fetchCounterValue('total_pv', false),
      fetchCounterValue(`pv_${todayStr}`, false),
      ...dateList.map((d) => fetchCounterValue(`uv_${d}`, false)),
    ]);

    const last7Days: DailyStatItem[] = dateList.map((d, idx) => ({
      date: d,
      label: d === todayStr ? '오늘' : formatDateLabel(d),
      visitors: dailyUvCounts[idx] || 0,
    }));

    const todayVisitors = dailyUvCounts[dailyUvCounts.length - 1] || 0;
    const yesterdayVisitors = dailyUvCounts[dailyUvCounts.length - 2] || 0;

    // 누적 방문자가 오늘 방문자보다 작게 나오는 초기 상태 보정
    const sum7Days = dailyUvCounts.reduce((a, b) => a + b, 0);
    const safeTotalVisitors = Math.max(totalUv, sum7Days, todayVisitors);
    const safeTotalPageviews = Math.max(totalPv, safeTotalVisitors, todayPv);

    const now = new Date();
    const updatedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const summary: VisitorStatsSummary = {
      todayVisitors,
      yesterdayVisitors,
      totalVisitors: safeTotalVisitors,
      todayPageviews: Math.max(todayPv, todayVisitors),
      totalPageviews: safeTotalPageviews,
      last7Days,
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
      updatedAt: '-',
    };
  }
}
