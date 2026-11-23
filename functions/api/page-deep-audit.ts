/**
 * Cloudflare Pages Edge Function: 단일 포스팅 실제 웹페이지 전체 DOM 초정밀 크롤링 엔진
 * (RSS 요약문 대신 실제 웹페이지 HTML을 직접 방문하여 H1~H3 계층, Alt 누락 이미지, 캐노니컬, 글자수 정밀 파싱)
 */

interface Env {}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=120, s-maxage=600',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url') || '';

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return new Response(
      JSON.stringify({ success: false, message: '올바른 포스팅 URL을 입력해주세요.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, message: `페이지 응답 오류 (HTTP ${res.status})` }),
        { status: res.status, headers: corsHeaders }
      );
    }

    const html = await res.text();

    // 1. Title & Meta Description
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim() : '';

    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : '';

    // 2. Canonical URL 검사 (구글 중복 색인 방지 핵심)
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
      || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';
    const hasCanonical = Boolean(canonicalUrl);
    const isCanonicalSelf = hasCanonical && (canonicalUrl === targetUrl || targetUrl.startsWith(canonicalUrl));

    // 3. Robots Meta (noindex 검사)
    const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const robotsContent = robotsMatch ? robotsMatch[1].toLowerCase() : '';
    const isNoIndex = robotsContent.includes('noindex');

    // 4. 헤딩 태그 H1~H3 계층 구조 추출
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];

    const h1Count = h1Matches.length;
    const h2Count = h2Matches.length;
    const h3Count = h3Matches.length;

    const h2List = h2Matches.map(m => m.replace(/<\/?[^>]+(>|$)/g, '').trim()).filter(Boolean);
    const h3List = h3Matches.map(m => m.replace(/<\/?[^>]+(>|$)/g, '').trim()).filter(Boolean);

    // 5. 이미지 및 Alt 속성 전수 조사
    const imgMatches = html.match(/<img[^>]+>/gi) || [];
    const totalImages = imgMatches.length;
    let missingAltCount = 0;
    const missingAltSampleImages: string[] = [];

    for (const imgTag of imgMatches) {
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
      const src = srcMatch ? srcMatch[1] : '';

      const altValue = altMatch ? altMatch[1].trim() : '';
      if (!altValue) {
        missingAltCount++;
        if (src && missingAltSampleImages.length < 3) {
          const fileName = src.split('/').pop()?.split('?')[0] || src.slice(0, 30);
          missingAltSampleImages.push(fileName);
        }
      }
    }

    // 6. 순수 본문 텍스트 및 글자수 파싱
    // script, style, nav, footer, header 제거
    let cleanTextHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

    const plainText = cleanTextHtml.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
    const charCountWithSpaces = plainText.length;
    const charCountNoSpaces = plainText.replace(/\s/g, '').length;

    // 7. 내부/외부 링크 분석
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    const currentDomain = new URL(targetUrl).hostname;

    for (const linkTag of linkMatches) {
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1];
        if (href.startsWith('#') || href.startsWith('javascript:')) continue;
        if (href.startsWith('/') || href.includes(currentDomain)) {
          internalLinksCount++;
        } else if (href.startsWith('http')) {
          externalLinksCount++;
        }
      }
    }

    // 8. OpenGraph & 소셜 태그
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: targetUrl,
          title,
          metaDescription,
          canonical: {
            hasCanonical,
            canonicalUrl,
            isCanonicalSelf
          },
          isNoIndex,
          charCount: {
            withSpaces: charCountWithSpaces,
            withoutSpaces: charCountNoSpaces,
            isThinContent: charCountWithSpaces < 600,
            status: charCountWithSpaces >= 1200 ? 'good' : charCountWithSpaces >= 700 ? 'warning' : 'danger'
          },
          headings: {
            h1Count,
            h2Count,
            h3Count,
            hasH1: h1Count >= 1,
            isH1Single: h1Count === 1,
            hasSubheadings: h2Count + h3Count >= 2,
            h2List: h2List.slice(0, 5),
            h3List: h3List.slice(0, 5)
          },
          images: {
            totalImages,
            missingAltCount,
            altCoverageRate: totalImages > 0 ? Math.round(((totalImages - missingAltCount) / totalImages) * 100) : 100,
            missingAltSampleImages
          },
          links: {
            internalLinksCount,
            externalLinksCount,
            hasOutboundReference: externalLinksCount > 0
          },
          social: {
            hasOgTitle: Boolean(ogTitleMatch),
            hasOgImage: Boolean(ogImageMatch),
            ogImageUrl: ogImageMatch ? ogImageMatch[1] : null
          }
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '페이지 크롤링 실패';
    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
