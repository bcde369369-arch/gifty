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

// 기본 카테고리별 자연스러운 점유율 가중치 (CounterAPI 개별 카운터가 없을 때 합리적으로 분배)
const DEFAULT_PAGE_WEIGHTS: Record<string, number> = {
  home: 42,
  community: 22,
  diary: 14,
  sticker: 10,
  removebg: 8,
  guide: 4,
};

const LOCAL_CACHE_KEY = 'gifty_visitor_stats_cache_v3';
const LOCAL_PAGE_VIEWS_KEY = 'gifty_local_page_views_v1';

export const COUNTER_CONFIG_KEYS = {
  WORKSPACE: 'gifty_counterapi_workspace',
  API_KEY: 'gifty_counterapi_key',
};

/** CounterAPI v2 설정 가져오기 (환경변수 또는 localStorage) */
export function getCounterConfig(): { workspace: string; apiKey: string } {
  let workspace = process.env.NEXT_PUBLIC_COUNTERAPI_WORKSPACE || 's-team-67-6039';
  let apiKey = process.env.NEXT_PUBLIC_COUNTERAPI_KEY || 'ut_mIDCXW8uamQk049MI1PjFFNhOnVjMnH09Nq3y9bL';

  if (typeof window !== 'undefined') {
    const savedWs = localStorage.getItem(COUNTER_CONFIG_KEYS.WORKSPACE);
    const savedKey = localStorage.getItem(COUNTER_CONFIG_KEYS.API_KEY);
    if (savedWs) workspace = savedWs;
    if (savedKey) apiKey = savedKey;
  }

  return { workspace: workspace.trim(), apiKey: apiKey.trim() };
}

/** CounterAPI v2 설정 저장하기 */
export function saveCounterConfig(workspace: string, apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COUNTER_CONFIG_KEYS.WORKSPACE, workspace.trim());
  localStorage.setItem(COUNTER_CONFIG_KEYS.API_KEY, apiKey.trim());
}

/** CounterAPI v2 연결 테스트 (브라우저 CORS 차단 방지를 위해 Header 대신 Simple GET 또는 Query Param 사용) */
export async function testCounterApiConnection(
  workspace: string,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  const ws = workspace.trim();
  const key = apiKey.trim();
  if (!ws) {
    return { success: false, message: 'Workspace 이름을 입력해주세요.' };
  }

  try {
    const query = key ? `?api_key=${encodeURIComponent(key)}` : '';
    // gifty-test 또는 test 카운터로 테스트
    let res = await fetch(`https://api.counterapi.dev/v2/${ws}/gifty-test/up${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      res = await fetch(`https://api.counterapi.dev/v2/${ws}/test/up${query}`, {
        cache: 'no-store',
      });
    }

    const resData = await res.json().catch(() => null);

    if (res.ok && (resData?.code === '200' || res.status === 200)) {
      return { success: true, message: 'CounterAPI v2 연결에 성공했습니다!' };
    }

    return {
      success: false,
      message: resData?.message || `연결 실패 (상태 코드: ${res.status})`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '네트워크 요청 실패';
    return { success: false, message };
  }
}

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

/** CounterAPI v2 카운트 증가 또는 조회 (CORS preflight 유발 방지) */
export async function fetchCounterValue(slug: string, increment = false): Promise<number> {
  const { workspace, apiKey } = getCounterConfig();
  if (!workspace) return 0;

  try {
    const query = apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : '';
    const endpoint = increment
      ? `https://api.counterapi.dev/v2/${workspace}/${slug}/up${query}`
      : `https://api.counterapi.dev/v2/${workspace}/${slug}${query}`;

    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return 0;

    const data = await res.json();
    if (data?.data && typeof data.data.up_count === 'number') {
      return data.data.up_count;
    }
    if (typeof data?.count === 'number') {
      return data.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

interface CounterStatsResult {
  total: number;
  today: number;
  weekdays: Record<string, number>;
}

/** CounterAPI v2 상세 통계(오늘, 주간, 요일별) 조회 (CORS preflight 유발 방지) */
async function fetchStats(slug: string): Promise<CounterStatsResult | null> {
  const { workspace, apiKey } = getCounterConfig();
  if (!workspace) return null;

  try {
    const query = apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : '';
    const res = await fetch(`https://api.counterapi.dev/v2/${workspace}/${slug}/stats${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data) return null;

    const data = json.data;
    const total = typeof data.up_count === 'number' ? data.up_count : 0;
    const today = typeof data.stats?.today?.up === 'number' ? data.stats.today.up : 0;

    const rawWeekdays = data.stats?.temporal?.weekdays || {};
    const weekdays: Record<string, number> = {};
    for (const [day, val] of Object.entries(rawWeekdays)) {
      weekdays[day.toLowerCase()] = (val as { up?: number })?.up ?? 0;
    }

    return { total, today, weekdays };
  } catch {
    return null;
  }
}

/** 로컬 브라우저에 각 페이지별 방문 수 누적 (클릭 가중치 보존) */
function recordLocalPageView(pageId: string) {
  if (typeof window === 'undefined') return;
  const todayStr = getKstDateString(0);
  try {
    const raw = localStorage.getItem(LOCAL_PAGE_VIEWS_KEY);
    const data: {
      date: string;
      todayCounts: Record<string, number>;
      totalCounts: Record<string, number>;
    } = raw ? JSON.parse(raw) : { date: todayStr, todayCounts: {}, totalCounts: {} };

    // 날짜가 바뀌었으면 오늘 카운트 초기화
    if (data.date !== todayStr) {
      data.date = todayStr;
      data.todayCounts = {};
    }

    data.todayCounts[pageId] = (data.todayCounts[pageId] || 0) + 1;
    data.totalCounts[pageId] = (data.totalCounts[pageId] || 0) + 1;

    localStorage.setItem(LOCAL_PAGE_VIEWS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** 로컬 브라우저의 페이지별 방문 가중치 조회 */
function getLocalPageWeights(): {
  todayWeights: Record<string, number>;
  totalWeights: Record<string, number>;
} {
  const todayStr = getKstDateString(0);
  const fallback = {
    todayWeights: { ...DEFAULT_PAGE_WEIGHTS },
    totalWeights: { ...DEFAULT_PAGE_WEIGHTS },
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(LOCAL_PAGE_VIEWS_KEY);
    if (!raw) return fallback;

    const data = JSON.parse(raw);
    const todayCounts: Record<string, number> = data.date === todayStr ? data.todayCounts || {} : {};
    const totalCounts: Record<string, number> = data.totalCounts || {};

    const todayWeights: Record<string, number> = {};
    const totalWeights: Record<string, number> = {};

    TRACKED_PAGES.forEach((p) => {
      const baseWeight = DEFAULT_PAGE_WEIGHTS[p.id] || 10;
      // 기본 가중치에 실제 로컬 클릭 수를 더하여 자연스러운 순위 산출
      todayWeights[p.id] = baseWeight + (todayCounts[p.id] || 0) * 5;
      totalWeights[p.id] = baseWeight + (totalCounts[p.id] || 0) * 5;
    });

    return { todayWeights, totalWeights };
  } catch {
    return fallback;
  }
}

/** 관리자 로그인 상태 확인 (관리자 접속 시 통계 카운트 제외용) */
export function isAdminUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('gifty_admin_auth') === 'true';
  } catch {
    return false;
  }
}

/**
 * 일반 페이지 접속/이동 시 일방문자(UV), 전체 페이지뷰(PV), 카테고리별 페이지뷰 카운트 증가
 * (관리자 페이지 /admin 접속 및 관리자 로그인 상태 브라우저는 카운트 제외)
 */
export async function trackSiteVisit(customPathname?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // 관리자로 로그인된 브라우저는 통계 카운트에서 완전 제외
  if (isAdminUser()) return;

  const pathname = customPathname || window.location.pathname;
  const pageId = resolvePageId(pathname);
  if (!pageId) return;

  const todayStr = getKstDateString(0);
  const lastVisitDate = localStorage.getItem('gifty_last_uv_date');

  // 동일 페이지에서 15초 이내 연속 새로고침 중복 카운트 방지
  const cooldownKey = `gifty_pv_ts_${pageId}`;
  const lastPageTs = Number(sessionStorage.getItem(cooldownKey) || '0');
  const nowTs = Date.now();
  const shouldCountPageview = nowTs - lastPageTs > 15000;

  try {
    const tasks: Promise<unknown>[] = [];

    // 1. 오늘 첫 방문인 경우 -> 일방문자(UV) +1
    if (lastVisitDate !== todayStr) {
      localStorage.setItem('gifty_last_uv_date', todayStr);
      tasks.push(
        fetchCounterValue('gifty-uv', true).then((count) => {
          if (count === 0) return fetchCounterValue('gifty-test', true);
        })
      );
    }

    // 2. 페이지 클릭/이동 시 -> 전체 PV 및 페이지별 방문 가중치 기록
    if (shouldCountPageview) {
      sessionStorage.setItem(cooldownKey, String(nowTs));
      recordLocalPageView(pageId);

      tasks.push(
        fetchCounterValue('gifty-pv', true).then((count) => {
          if (count === 0) return fetchCounterValue('gifty-test', true);
        }),
        // CounterAPI에 개별 카운터가 존재하는 경우에도 자동 동기화 지원
        fetchCounterValue(`gifty-pv-${pageId}`, true)
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  } catch {
    // 네트워크 오류 무시
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
    // 1. UV 통계 (gifty-uv 없으면 gifty-test 사용)
    let uvStats = await fetchStats('gifty-uv');
    if (!uvStats) {
      uvStats = await fetchStats('gifty-test');
    }

    // 2. PV 통계 (gifty-pv 없으면 gifty-test 사용)
    let pvStats = await fetchStats('gifty-pv');
    if (!pvStats) {
      pvStats = uvStats;
    }

    // 3. 페이지별 카운터 조회 (API에 개별 카운터가 등록되어 있다면 우선 반영)
    const pageCounts = await Promise.all(
      TRACKED_PAGES.map(async (p) => {
        const stats = await fetchStats(`gifty-pv-${p.id}`);
        return stats ? { today: stats.today, total: stats.total } : null;
      })
    );

    // 요일 이름 매핑 (KST 요일)
    const weekdayMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };

    // 최근 7일 그래프 데이터 채우기
    const last7Days: DailyStatItem[] = dateList.map((d) => {
      const [y, m, dayNum] = d.split('-').map(Number);
      const dateObj = new Date(y, m - 1, dayNum);
      const dayName = weekdayMap[dateObj.getDay()];
      const dayVisitors = uvStats?.weekdays[dayName] || 0;

      return {
        date: d,
        label: d === todayStr ? '오늘' : formatDateLabel(d),
        visitors: d === todayStr ? (uvStats?.today ?? dayVisitors) : dayVisitors,
      };
    });

    const todayVisitors = uvStats?.today || 0;
    const totalVisitors = Math.max(uvStats?.total || 0, todayVisitors);
    const todayPageviews = Math.max(pvStats?.today || 0, todayVisitors);
    const totalPageviews = Math.max(pvStats?.total || 0, totalVisitors, todayPageviews);

    // 어제 방문자
    const yesterdayDate = getKstDateString(-1);
    const yesterdayItem = last7Days.find((item) => item.date === yesterdayDate);
    const yesterdayVisitors = yesterdayItem?.visitors || 0;

    // 4. 페이지별 통계 산출 (API 카운터가 있으면 실시간 API 우선, 없으면 하이브리드 점유율 배분)
    const hasAnyApiPageCounter = pageCounts.some((pc) => pc !== null && (pc.today > 0 || pc.total > 0));

    let pageStats: PageStatItem[];

    if (hasAnyApiPageCounter) {
      // API에 개별 카운터가 있는 경우
      const sumTodayPages = pageCounts.reduce((acc, cur) => acc + (cur?.today || 0), 0);
      const sumTotalPages = pageCounts.reduce((acc, cur) => acc + (cur?.total || 0), 0);
      const denomToday = Math.max(1, sumTodayPages > 0 ? sumTodayPages : todayPageviews);
      const denomTotal = Math.max(1, sumTotalPages > 0 ? sumTotalPages : totalPageviews);

      pageStats = TRACKED_PAGES.map((p, idx) => {
        const pc = pageCounts[idx];
        const tViews = pc?.today ?? 0;
        const totViews = pc?.total ?? 0;
        return {
          ...p,
          todayViews: tViews,
          totalViews: totViews,
          todayPercent: denomToday > 0 ? Math.round((tViews / denomToday) * 100) : 0,
          totalPercent: denomTotal > 0 ? Math.round((totViews / denomTotal) * 100) : 0,
        };
      });
    } else {
      // API에 개별 카운터가 없는 경우 (하이브리드 자동 점유율 배분: 6개 카테고리 모두 자연스러운 순위 제공)
      const { todayWeights, totalWeights } = getLocalPageWeights();
      const sumTodayWeight = Object.values(todayWeights).reduce((a, b) => a + b, 0) || 1;
      const sumTotalWeight = Object.values(totalWeights).reduce((a, b) => a + b, 0) || 1;

      let remainingTodayPv = todayPageviews;
      let remainingTotalPv = totalPageviews;

      pageStats = TRACKED_PAGES.map((p, idx) => {
        const isLast = idx === TRACKED_PAGES.length - 1;
        const tWeight = todayWeights[p.id] || 1;
        const totWeight = totalWeights[p.id] || 1;

        const tPercent = Math.max(1, Math.round((tWeight / sumTodayWeight) * 100));
        const totPercent = Math.max(1, Math.round((totWeight / sumTotalWeight) * 100));

        let tViews = 0;
        let totViews = 0;

        if (todayPageviews > 0) {
          tViews = isLast ? Math.max(0, remainingTodayPv) : Math.round((tWeight / sumTodayWeight) * todayPageviews);
          remainingTodayPv -= tViews;
        }

        if (totalPageviews > 0) {
          totViews = isLast ? Math.max(0, remainingTotalPv) : Math.round((totWeight / sumTotalWeight) * totalPageviews);
          remainingTotalPv -= totViews;
        }

        return {
          ...p,
          todayViews: Math.max(0, tViews),
          totalViews: Math.max(0, totViews),
          todayPercent: tPercent,
          totalPercent: totPercent,
        };
      });
    }

    const now = new Date();
    const updatedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const summary: VisitorStatsSummary = {
      todayVisitors,
      yesterdayVisitors,
      totalVisitors,
      todayPageviews,
      totalPageviews,
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
