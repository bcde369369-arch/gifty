/**
 * Cloudflare Pages Edge Function: G-Inspect™ 차세대 3단계 네이버 정밀 진단 엔진
 * 1단계: 네이버 공식 블로그 탭(ssc=tab.blog.all) 문서 색인(인덱싱) 검사
 * 2단계: 네이버 모바일 스마트블록/VIEW(where=m_view) 실시간 키워드 순위 검사
 * 3단계: 색인 완료 여부 vs 스마트블록 미반영(블라이식 누락) 정밀 분리 판정
 */

interface Env {}

export interface DetailedRankResult {
  keyword: string;
  searchTitle?: string;
  blogId: string;
  targetUrl: string;
  isIndexed: boolean; // 네이버에 문서 자체가 수집/색인되었는가
  indexedRank: number | null; // 제목 검색 시 블로그탭 순위
  detectedRank: number | null; // 키워드 검색 시 스마트블록/VIEW 순위
  rankStatus: 'rank1' | 'rank2_5' | 'rank6_30' | 'smartblock_miss' | 'total_missing' | 'pending';
  rankText: string;
  statusBadge: string;
  diagnosticNote: string;
  naverBlogSearchUrl: string; // 블로그탭 제목 색인 검사 링크
  naverSmartblockSearchUrl: string; // 스마트블록 키워드 순위 검사 링크
}

const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

/** HTML에서 네이버 블로그 포스팅 상세 링크(/id/logNo) 순서대로 추출 */
function extractNaverBlogLinks(html: string): string[] {
  const linkRegex = /<a[^>]+href=["'](https?:\/\/(?:m\.)?blog\.naver\.com\/[^"']+)["'][^>]*>/gi;
  const uniqueLinks: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = linkRegex.exec(html)) !== null) {
    let rawLink = m[1].replace('http://', 'https://').split('?')[0];
    rawLink = rawLink.replace('m.blog.naver.com', 'blog.naver.com');
    // 아이디/글번호 상세 글 링크만 추출
    if (/\/([a-zA-Z0-9_-]+)\/([0-9]+)/.test(rawLink) && !seen.has(rawLink)) {
      seen.add(rawLink);
      uniqueLinks.push(rawLink);
    }
  }
  return uniqueLinks;
}

/** 링크 목록에서 내 블로그 포스팅 링크 인덱스 탐색 */
function findPostRank(links: string[], blogId: string, targetUrl: string): number | null {
  const cleanTarget = targetUrl ? targetUrl.replace('m.blog.naver.com', 'blog.naver.com').split('?')[0] : '';
  const cleanBlogId = blogId.toLowerCase();

  for (let i = 0; i < links.length; i++) {
    const l = links[i].toLowerCase();
    if (cleanTarget && l.includes(cleanTarget.toLowerCase())) {
      return i + 1;
    }
    if (cleanBlogId && l.includes(`blog.naver.com/${cleanBlogId}/`)) {
      return i + 1;
    }
  }
  return null;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=180, s-maxage=600',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const keyword = url.searchParams.get('keyword')?.trim() || '';
  const title = url.searchParams.get('title')?.trim() || '';
  const blogId = url.searchParams.get('blogId')?.trim().toLowerCase() || '';
  const targetUrl = url.searchParams.get('targetUrl')?.trim() || '';

  if ((!keyword && !title) || (!blogId && !targetUrl)) {
    return new Response(
      JSON.stringify({ success: false, message: '키워드/제목 및 블로그 정보가 필요합니다.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const searchKeyword = keyword || title;
    const searchTitle = title || keyword;

    const blogTabSearchUrl = `https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query=${encodeURIComponent(searchTitle)}`;
    const smartblockSearchUrl = `https://m.search.naver.com/search.naver?where=m_view&sm=mtb_jum&query=${encodeURIComponent(searchKeyword)}`;

    // 1단계: 제목으로 네이버 블로그탭 공식 색인 검사 (출처 인덱싱 확인)
    let isIndexed = false;
    let indexedRank: number | null = null;

    try {
      const blogTabRes = await fetch(blogTabSearchUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
      });

      if (blogTabRes.ok) {
        const blogTabHtml = await blogTabRes.text();
        const indexedLinks = extractNaverBlogLinks(blogTabHtml);
        indexedRank = findPostRank(indexedLinks, blogId, targetUrl);
        isIndexed = indexedRank !== null;
      }
    } catch (e) {
      console.warn('Index check fetch failed:', e);
    }

    // 2단계: 핵심 키워드로 모바일 스마트블록/VIEW 실시간 순위 검사
    let detectedRank: number | null = null;
    let viewLinksCount = 0;

    try {
      const viewRes = await fetch(smartblockSearchUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
      });

      if (viewRes.ok) {
        const viewHtml = await viewRes.text();
        const viewLinks = extractNaverBlogLinks(viewHtml);
        viewLinksCount = viewLinks.length;
        detectedRank = findPostRank(viewLinks, blogId, targetUrl);
      }
    } catch (e) {
      console.warn('SmartBlock rank check failed:', e);
    }

    // 3단계: 정밀 융합 판정 (G-Inspect™ 3단계 엔진)
    let rankStatus: 'rank1' | 'rank2_5' | 'rank6_30' | 'smartblock_miss' | 'total_missing' = 'smartblock_miss';
    let rankText = '30위 밖';
    let statusBadge = '스마트블록 미반영';
    let diagnosticNote = '';

    if (detectedRank === 1) {
      rankStatus = 'rank1';
      rankText = '🥇 1위';
      statusBadge = '최상단 1위';
      diagnosticNote = '키워드 검색 시 스마트블록/인기글 최상단 1위에 정상 노출되고 있습니다.';
    } else if (detectedRank && detectedRank <= 5) {
      rankStatus = 'rank2_5';
      rankText = `🏆 ${detectedRank}위`;
      statusBadge = '상위 1페이지';
      diagnosticNote = `키워드 검색 시 1페이지 상단(${detectedRank}위)에 안정적으로 노출 중입니다.`;
    } else if (detectedRank && detectedRank <= 30) {
      rankStatus = 'rank6_30';
      rankText = `🥈 ${detectedRank}위`;
      statusBadge = '노출권 진입';
      diagnosticNote = `스마트블록 ${detectedRank}위에 노출 중입니다. 체류시간 보강 시 상위 1페이지 도약이 가능합니다.`;
    } else {
      // 키워드로 스마트블록 30위 안에 없는 경우
      if (isIndexed) {
        // 색인은 정상인데 키워드 순위가 밀린 경우 -> 타사 사이트(블라이)에서 흔히 '누락'으로 잘못 판정하는 상태!
        rankStatus = 'smartblock_miss';
        rankText = '스마트블록 미반영';
        statusBadge = '색인 정상 / 순위 밖';
        diagnosticNote =
          '네이버에 정상 색인(수집)되었으나, 해당 키워드 경쟁 밀림 또는 스마트블록 알고리즘 미반영 상태입니다. (제목 전체 검색 시 정상 노출됨)';
      } else {
        // 제목 전체로 검색해도 네이버 블로그탭에 안 나오는 경우 -> 진짜 완전 누락/미색인
        rankStatus = 'total_missing';
        rankText = '완전 누락';
        statusBadge = '네이버 미색인';
        diagnosticNote =
          '글 제목 전체로 검색해도 네이버 블로그탭에 나오지 않는 완전 누락(미색인/저품질/72시간 누락) 상태입니다.';
      }
    }

    const result: DetailedRankResult = {
      keyword: searchKeyword,
      searchTitle,
      blogId,
      targetUrl,
      isIndexed,
      indexedRank,
      detectedRank,
      rankStatus,
      rankText,
      statusBadge,
      diagnosticNote,
      naverBlogSearchUrl: blogTabSearchUrl,
      naverSmartblockSearchUrl: smartblockSearchUrl,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 진단 오류';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
