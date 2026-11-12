import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';

export const metadata = {
  title: '움짤 꿀팁 백과사전 - Gifty',
  description: '블로그 트래픽과 체류시간을 늘려주는 움짤 마케팅, 고화질 GIF 제작 비법, 최적화 규격 및 테크니컬 SEO 가이드를 확인하세요.',
};

const POSTS = [
  {
    slug: 'gif-vs-webp-mp4',
    badge: '기술 심층 비교',
    title: '웹 환경에서 GIF vs WebP vs MP4 포맷별 장단점 및 로딩 속도 완벽 비교',
    desc: '애니메이션 미디어를 선택할 때 고려해야 할 파일 용량, 브라우저 호환성, 구글 SEO 및 코어 웹 바이탈 영향을 심층 분석합니다.',
    date: '2026-11-01',
  },
  {
    slug: 'ecommerce-product-gif',
    badge: '이커머스 매출 증대',
    title: '쇼핑몰·스마트스토어 상세페이지 구매 전환율 2배 올리는 제품 GIF 제작 비법',
    desc: '쿠팡, 스마트스토어 상세페이지에서 정지된 사진보다 고객의 스크롤을 멈추고 지갑을 열게 만드는 실전 GIF 제작 가이드.',
    date: '2026-11-02',
  },
  {
    slug: 'galaxy-motion-photo-to-gif',
    badge: '안드로이드 꿀팁',
    title: '삼성 갤럭시 모션포토 및 화면 녹화 고화질 GIF 변환 완벽 가이드',
    desc: '갤럭시 갤러리 기본 변환의 화질 깨짐을 극복하고 원본 색감을 100% 보존하며 3초 만에 선명한 움짤을 만드는 노하우.',
    date: '2026-11-03',
  },
  {
    slug: 'food-restaurant-gif',
    badge: '맛집 리뷰 노하우',
    title: '맛집 블로거 필수! 보글보글 찌개·치즈 폭포 고화질 움짤 촬영 공식',
    desc: '체험단 선정 확률을 높이고 네이버 블로그 검색 체류시간을 3배 늘리는 지글지글 고기 굽기, 치즈 늘어남 등 핵심 촬영 테크닉.',
    date: '2026-11-04',
  },
  {
    slug: 'tistory-wordpress-image-seo',
    badge: '구글 SEO 최적화',
    title: '티스토리·워드프레스 구글 SEO를 위한 GIF 이미지 최적화 및 LCP 개선 비법',
    desc: '구글 코어 웹 바이탈의 LCP 점수를 깎지 않으면서도 독자의 체류시간을 극대화하는 블로그 이미지 테크니컬 SEO 가이드.',
    date: '2026-11-05',
  },
  {
    slug: 'gif-frame-rate-optimization',
    badge: '인코딩 튜닝',
    title: '부드러움과 저용량을 동시에 잡는 GIF 프레임레이트(FPS) 설정 공식',
    desc: '10fps, 15fps, 30fps 수치에 따른 GIF 파일 용량과 체감 부드러움의 상관관계를 실험 데이터로 비교 분석해 드립니다.',
    date: '2026-11-06',
  },
  {
    slug: 'gif-caption-typography',
    badge: '타이포그래피 디자인',
    title: '움짤 자막 가독성 200% 높이는 예능 폰트 및 외곽선 배색 디자인 가이드',
    desc: '배경이 계속 바뀌어도 1초 만에 꽂히는 방송 예능 스타일 두꺼운 외곽선 배색과 주아체 폰트 활용 팁.',
    date: '2026-11-07',
  },
  {
    slug: 'gif-copyright-fair-use',
    badge: '저작권 법률 상식',
    title: '블로그·SNS 움짤 만들 때 꼭 알아야 할 저작권과 공정이용(Fair Use) 법적 상식',
    desc: '드라마, 영화, 예능 명장면을 캡처하여 리뷰할 때 저작권 침해를 피하고 안전하게 활용하는 정당한 인용의 기준.',
    date: '2026-11-08',
  },
  {
    slug: 'sns-gif-upload-spec',
    badge: 'SNS 최적 규격',
    title: '인스타그램 스토리·스레드·X(트위터) 무손실 움짤 업로드 최적 규격 총정리',
    desc: '주요 SNS별 GIF 자동 재인코딩으로 인한 화질 저하를 방지하고 쨍한 해상도를 유지하는 짝수 픽셀 규격 가이드.',
    date: '2026-11-09',
  },
  {
    slug: 'iphone-livephoto-to-gif',
    badge: '모바일 팁',
    title: '아이폰 라이브포토 & 갤럭시 모션포토를 화질 깨짐 없이 고화질 GIF로 변환하는 법',
    desc: '기본 갤러리 앱의 화질 저하 없이, 3초 만에 선명한 고화질 움짤로 만들어 인스타/블로그에 공유하는 실전 팁을 소개합니다.',
    date: '2026-10-25',
  },
  {
    slug: 'gif-size-reduction-tips',
    badge: '용량 압축',
    title: '화질 저하 없이 GIF 움짤 용량 10MB 이하로 줄이는 5가지 전문 압축 비법',
    desc: '페이지 로딩 속도를 높이고 모바일 방문자 이탈을 막는 핵심 압축 공식! 재생 시간, 프레임, 해상도의 황금 비율을 공개합니다.',
    date: '2026-10-25',
  },
  {
    slug: 'blog-thumbnail-gif',
    badge: '클릭률 극대화',
    title: '클릭률(CTR)을 3배 높이는 네이버 블로그 대표 썸네일 움짤 제작 비법',
    desc: '정적인 사진들 사이에서 눈에 띄는 움직이는 썸네일 제작 공식. 피드 자동 재생 기능과 1:1 최적화 규격 가이드.',
    date: '2026-10-25',
  },
  {
    slug: 'naver-blog-limit',
    badge: '블로그 가이드',
    title: '네이버 블로그 움짤(GIF) 용량 20MB 제한, 화질 깨짐 없이 올리는 완벽 가이드',
    desc: '블로그에 20MB가 넘는 움짤을 올리려다 실패하신 적 있나요? 프레임과 사이즈를 조절해 화질 손실 없이 용량만 쏙 줄이는 비밀을 공개합니다.',
    date: '2026-10-03',
  },
  {
    slug: 'gif-marketing-seo',
    badge: '체류시간 마케팅',
    title: '블로그 체류시간을 2배 늘려주는 \'움짤 마케팅\' 검색엔진 최적화(SEO) 전략',
    desc: '사람들은 글씨만 있는 블로그를 금방 이탈합니다. 움짤을 활용해 독자의 시선을 사로잡고 애드센스 수익을 높이는 꿀팁!',
    date: '2026-10-02',
  },
  {
    slug: 'high-quality-gif',
    badge: '화질 최적화',
    title: '동영상을 4K 고화질 GIF로 변환하는 가장 빠른 방법 (설치 vs 무설치)',
    desc: '포토샵이나 무거운 프로그램 설치 없이, 웹 브라우저만으로 초고속 고화질 GIF를 만드는 최신 WebAssembly 기술을 소개합니다.',
    date: '2026-10-01',
  }
];

export default function GuideIndex() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Gifty<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={16} /> 홈으로
            </Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">소개</Link>
            <Link href="/contact" className="hover:text-indigo-600 transition-colors">문의</Link>
            <Link href="/legal" className="hover:text-indigo-600 transition-colors">약관</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-bold mb-4">
            <BookOpen size={16} /> 블로거 &amp; 크리에이터 백과사전
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            움짤 꿀팁 백과사전
          </h1>
          <p className="text-base sm:text-lg text-slate-500">
            블로그 검색 체류시간 극대화, 코어 웹 바이탈 최적화, 최신 인코딩 노하우를 총망라했습니다.
          </p>
        </div>

        <div className="space-y-6">
          {POSTS.map(post => (
            <Link key={post.slug} href={`/guide/${post.slug}`} className="block group">
              <article className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                    {post.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-2">
                  {post.desc}
                </p>
                <div className="mt-5 text-indigo-600 font-bold text-xs sm:text-sm flex items-center gap-1">
                  전문 읽어보기 &rarr;
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs space-y-3">
          <div className="flex justify-center gap-6 font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">홈</Link>
            <Link href="/about" className="hover:text-white transition-colors">서비스 소개</Link>
            <Link href="/guide" className="text-indigo-400 font-bold">꿀팁 가이드</Link>
            <Link href="/contact" className="hover:text-white transition-colors">문의하기</Link>
            <Link href="/legal" className="hover:text-white transition-colors">이용약관 및 개인정보처리방침</Link>
          </div>
          <p>© 2026 Gifty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
