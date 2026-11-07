/**
 * Cloudflare Pages Edge Function: 네이버 블로그 RSS 및 프로필 실시간 프록시
 * (CORS 제약 없이 네이버 공식 RSS 및 모바일 프로필 데이터를 100% 실제 데이터로 추출)
 */

interface Env {}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const rawId = url.searchParams.get('blogId') || '';
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').trim();

  if (!cleanId) {
    return new Response(
      JSON.stringify({ success: false, message: '유효한 네이버 블로그 ID를 입력해주세요.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // 1. 네이버 공식 RSS 피드 및 모바일 프로필 병렬 요청
    const rssPromise = fetch(`https://rss.blog.naver.com/${cleanId}.xml`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    }).then(async (r) => (r.ok ? await r.text() : null)).catch(() => null);

    const mobilePromise = fetch(`https://m.blog.naver.com/${cleanId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }).then(async (r) => (r.ok ? await r.text() : null)).catch(() => null);

    const [xml, html] = await Promise.all([rssPromise, mobilePromise]);

    if (!xml && !html) {
      return new Response(
        JSON.stringify({ success: false, message: '네이버 블로그를 찾을 수 없거나 비공개 상태입니다.' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 모바일 프로필 파싱 (실제 닉네임, 블로그명, 이웃수, 방문자수)
    let nickname = cleanId;
    let blogTitle = cleanId;
    let neighborCount = 0;
    let totalVisitors = 0;
    let todayVisitors = 0;

    if (html) {
      const nickMatch = html.match(/"nickName"\s*:\s*"([^"]+)"/) || html.match(/<meta property="og:title" content="([^"]+)"/);
      if (nickMatch) nickname = nickMatch[1];

      const blogNameMatch = html.match(/"blogName"\s*:\s*"([^"]+)"/);
      if (blogNameMatch) blogTitle = blogNameMatch[1];

      const countMatch = html.match(/"subscriberCount"\s*:\s*([0-9]+)/) || html.match(/이웃\s*<em>([0-9,]+)<\/em>/);
      if (countMatch) neighborCount = parseInt(countMatch[1].replace(/,/g, ''), 10) || 0;

      const totalMatch = html.match(/전체\s*<em>([0-9,]+)<\/em>/);
      if (totalMatch) totalVisitors = parseInt(totalMatch[1].replace(/,/g, ''), 10) || 0;

      const todayMatch = html.match(/오늘\s*<em>([0-9,]+)<\/em>/);
      if (todayMatch) todayVisitors = parseInt(todayMatch[1].replace(/,/g, ''), 10) || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          blogId: cleanId,
          nickname,
          blogTitle,
          neighborCount,
          totalVisitors,
          todayVisitors,
          xml: xml || ''
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
