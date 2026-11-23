/**
 * Cloudflare Pages Edge Function: 구글 실제 색인(site:URL) 상태 검증 엔드포인트
 * (Google Custom Search API 연동 및 공식 SERP 팩트체크 데이터 제공)
 */

interface Env {
  GOOGLE_SEARCH_API_KEY?: string;
  GOOGLE_SEARCH_CX?: string;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=1800',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url') || '';
  const title = url.searchParams.get('title') || '';

  if (!targetUrl) {
    return new Response(
      JSON.stringify({ success: false, message: '검사할 URL을 전달해주세요.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const siteQuery = `site:${targetUrl}`;
  const googleSerpUrl = `https://www.google.com/search?q=${encodeURIComponent(siteQuery)}`;
  const titleSearchUrl = title ? `https://www.google.com/search?q=${encodeURIComponent(`"${title}"`)}` : '';

  const apiKey = context.env.GOOGLE_SEARCH_API_KEY;
  const cx = context.env.GOOGLE_SEARCH_CX;

  // 1. Google Custom Search JSON API가 환경변수로 설정되어 있는 경우 실제 쿼리 실행
  if (apiKey && cx) {
    try {
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(siteQuery)}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const json = await res.json() as any;
        const totalResults = parseInt(json.searchInformation?.totalResults || '0', 10);
        const isIndexed = totalResults > 0;
        const firstItem = json.items?.[0];

        return new Response(
          JSON.stringify({
            success: true,
            isOfficialApi: true,
            isIndexed,
            totalResults,
            indexedTitle: firstItem?.title || null,
            indexedSnippet: firstItem?.snippet || null,
            indexedLink: firstItem?.link || null,
            googleSerpUrl,
            titleSearchUrl
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch {}
  }

  // 2. API 키 미설정 시: 1-Click 구글 SERP 직통 팩트체크 데이터 반환
  return new Response(
    JSON.stringify({
      success: true,
      isOfficialApi: false,
      isIndexed: null, // 직접 팩트체크 링크로 검증 안내
      message: '공식 SERP 팩트체크 링크를 통해 구글 실시간 검색결과를 직접 대조할 수 있습니다.',
      googleSerpUrl,
      titleSearchUrl,
      searchConsoleInspectUrl: `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(targetUrl)}&id=${encodeURIComponent(targetUrl)}`
    }),
    { status: 200, headers: corsHeaders }
  );
}
