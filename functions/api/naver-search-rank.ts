/**
 * Cloudflare Pages Edge Function: 네이버 실시간 검색 노출 순위 추적 봇
 * (키워드로 네이버 모바일 VIEW/스마트블록을 실시간 검색하여 해당 블로그 글의 실제 노출 등수를 판별)
 */

interface Env {}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=180, s-maxage=600', // 3분 캐싱으로 중복 조회 방지
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const keyword = url.searchParams.get('keyword')?.trim() || '';
  const blogId = url.searchParams.get('blogId')?.trim().toLowerCase() || '';
  const targetUrl = url.searchParams.get('targetUrl')?.trim() || '';

  if (!keyword || (!blogId && !targetUrl)) {
    return new Response(
      JSON.stringify({ success: false, message: 'keyword와 blogId 또는 targetUrl이 필요합니다.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const searchUrl = `https://m.search.naver.com/search.naver?where=m_view&sm=mtb_jum&query=${encodeURIComponent(keyword)}`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, message: `네이버 검색 응답 실패: ${res.status}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await res.text();

    // 스마트블록 및 VIEW 검색 결과 내의 블로그 포스팅 링크 순서대로 추출
    const linkRegex = /<a[^>]+href=["'](https?:\/\/(?:m\.)?blog\.naver\.com\/[^"']+)["'][^>]*>/gi;
    const uniqueLinks: string[] = [];
    const seen = new Set<string>();
    let m: RegExpExecArray | null;

    while ((m = linkRegex.exec(html)) !== null) {
      let rawLink = m[1].replace('http://', 'https://').split('?')[0];
      rawLink = rawLink.replace('m.blog.naver.com', 'blog.naver.com');
      // 관리자나 메인 링크 제외하고 글 상세 링크(/id/logNo)만 필터
      if (/\/([a-zA-Z0-9_-]+)\/([0-9]+)/.test(rawLink) && !seen.has(rawLink)) {
        seen.add(rawLink);
        uniqueLinks.push(rawLink);
      }
    }

    // 순위 탐색
    let detectedRank: number | null = null;
    let detectedLink: string | null = null;

    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      const matchesBlogId = blogId && link.includes(`blog.naver.com/${blogId}/`);
      const matchesTargetUrl = targetUrl && link.includes(targetUrl.replace('m.blog.naver.com', 'blog.naver.com').split('?')[0]);

      if (matchesBlogId || matchesTargetUrl) {
        detectedRank = i + 1;
        detectedLink = link;
        break;
      }
    }

    // 상태 판정
    // rank1: 1위
    // rank2_30: 2위 ~ 30위
    // rank30plus: 30위 밖 (검색 결과에는 없으나 글은 존재)
    // missing: 검색 결과 전혀 없음
    let rankStatus: 'rank1' | 'rank2_30' | 'rank30plus' | 'missing' = 'rank30plus';
    let rankText = '30위 밖';

    if (detectedRank === 1) {
      rankStatus = 'rank1';
      rankText = '🥇 1위';
    } else if (detectedRank && detectedRank <= 30) {
      rankStatus = 'rank2_30';
      rankText = `🥈 ${detectedRank}위`;
    } else if (uniqueLinks.length === 0) {
      rankStatus = 'missing';
      rankText = '결과 없음';
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          keyword,
          blogId,
          detectedRank,
          rankStatus,
          rankText,
          detectedLink,
          totalResultsChecked: uniqueLinks.length,
          naverSearchUrl: searchUrl,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
