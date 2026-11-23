/**
 * Cloudflare Pages Edge Function: 실시간 웹사이트 / 블로그 RSS 및 사이트맵 범용 수집기
 * (네이버 블로그, 티스토리, 워드프레스, infonavi.vip 등 독립 도메인 전체 지원)
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
  const rawTarget = url.searchParams.get('target') || url.searchParams.get('url') || url.searchParams.get('domain') || '';
  let target = rawTarget.trim();

  if (!target) {
    return new Response(
      JSON.stringify({ success: false, message: '유효한 도메인 또는 블로그 주소를 입력해주세요.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // http/https 제거 및 도메인 정규화
  target = target.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

  const candidateUrls: string[] = [
    `https://${target}/rss.xml`,
    `https://${target}/feed.xml`,
    `https://${target}/feed`,
    `https://${target}/rss`,
    `https://${target}/feed/`,
    `https://${target}/?feed=rss2`,
    `https://${target}/atom.xml`,
    `http://${target}/rss.xml`,
    `http://${target}/rss`,
    `https://${target}/sitemap.xml`
  ];

  // 네이버 블로그 ID 단독 입력인 경우
  if (/^[a-zA-Z0-9_-]{3,30}$/.test(target) && !target.includes('.')) {
    candidateUrls.unshift(`https://rss.blog.naver.com/${target}.xml`);
  }

  try {
    // 1. 후보 RSS 피드 병렬 탐색
    const fetchPromises = candidateUrls.map(async (testUrl) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(testUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const text = await res.text();
          // 유효한 XML 피드인지 확인 (HTML 에러 페이지 배제)
          const isXml = text.includes('<?xml') || text.includes('<rss') || text.includes('<feed') || text.includes('<channel') || text.includes('<urlset');
          const isHtmlDoc = text.trim().startsWith('<!doctype html') || text.trim().startsWith('<html');
          
          if (isXml && (!isHtmlDoc || text.includes('<rss') || text.includes('<item'))) {
            return { xml: text, matchedUrl: testUrl };
          }
        }
      } catch {
        // Continue
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    const validResult = results.find(r => r !== null);

    if (validResult) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            domain: target,
            feedUrl: validResult.matchedUrl,
            xml: validResult.xml
          }
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. 만약 직접 경로에서 못 찾았다면, 메인 홈페이지 HTML에서 <link rel="alternate" type="application/rss+xml"> 탐색
    try {
      const homeRes = await fetch(`https://${target}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      if (homeRes.ok) {
        const html = await homeRes.text();
        const rssMatch = html.match(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i)
          || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["']/i);

        if (rssMatch && rssMatch[1]) {
          let discoveredFeed = rssMatch[1];
          if (discoveredFeed.startsWith('/')) {
            discoveredFeed = `https://${target}${discoveredFeed}`;
          }
          const feedRes = await fetch(discoveredFeed);
          if (feedRes.ok) {
            const xml = await feedRes.text();
            if (xml.includes('<rss') || xml.includes('<channel') || xml.includes('<feed') || xml.includes('<?xml')) {
              return new Response(
                JSON.stringify({
                  success: true,
                  data: {
                    domain: target,
                    feedUrl: discoveredFeed,
                    xml
                  }
                }),
                { status: 200, headers: corsHeaders }
              );
            }
          }
        }
      }
    } catch {}

    return new Response(
      JSON.stringify({
        success: false,
        message: '해당 사이트에서 RSS 피드 또는 포스팅 목록을 찾을 수 없습니다.'
      }),
      { status: 404, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
