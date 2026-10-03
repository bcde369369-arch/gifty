import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '네이버 블로그 움짤(GIF) 용량 20MB 제한, 화질 깨짐 없이 올리는 완벽 가이드',
  description: '블로그에 20MB가 넘는 움짤을 올리려다 실패하신 적 있나요? 프레임과 사이즈를 조절해 화질 손실 없이 용량만 쏙 줄이는 비밀을 공개합니다.',
};

export default function Post() {
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
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/guide" className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} /> 목록으로
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-3xl mx-auto px-6 py-16 w-full">
        <article className="prose prose-lg prose-indigo w-full max-w-none">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            {metadata.title}
          </h1>
          <p className="text-slate-500 mb-12">작성일: 2026-10-03 | 작성자: Gifty 에디터</p>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-slate-700 leading-loose space-y-6">
            <p>네이버 블로그를 운영하다 보면 가장 짜증 나는 순간이 언제일까요? 바로 정성껏 만든 움짤(GIF)을 올리려는데 <strong>&quot;20MB를 초과하여 업로드할 수 없습니다.&quot;</strong>라는 팝업이 뜰 때입니다. </p>
            
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">왜 네이버 블로그는 20MB로 제한할까요?</h2>
            <p>네이버 블로그뿐만 아니라 대부분의 커뮤니티(디시인사이드, 에펨코리아, 루리웹 등)는 서버 트래픽 비용을 절감하기 위해 GIF 파일 용량을 엄격하게 제한합니다. GIF 형식 자체가 1987년에 만들어진 아주 오래된 기술이기 때문에, 영상을 압축하는 효율이 최신 MP4 영상보다 현저히 떨어집니다. 즉, 똑같은 5초짜리 영상이라도 MP4는 1MB면 충분한데, GIF로 만들면 20MB를 훌쩍 넘어버리는 것이죠.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">화질을 유지하면서 용량을 줄이는 3가지 마법</h2>
            
            <h3 className="text-xl font-bold text-indigo-600 mt-6 mb-3">1. 프레임 레이트(FPS) 최적화</h3>
            <p>일반적인 동영상은 1초에 30장 혹은 60장의 사진(프레임)이 지나갑니다. 하지만 블로그에 올리는 움짤은 1초에 10~15장(10fps~15fps)만 지나가도 시각적으로 충분히 부드럽게 보입니다. 프레임을 절반으로 줄이면 용량도 정확히 절반으로 줄어듭니다!</p>

            <h3 className="text-xl font-bold text-indigo-600 mt-6 mb-3">2. 화면 크기(해상도) 리사이징</h3>
            <p>원본 영상이 4K 혹은 1080p FHD 해상도라면, 이를 그대로 GIF로 만들 경우 용량이 수백 메가바이트에 달하게 됩니다. 모바일로 블로그를 보는 독자들을 위해 가로 픽셀을 600px ~ 800px로 줄여보세요. 화질 저하는 거의 느껴지지 않으면서 용량은 기적처럼 줄어듭니다.</p>

            <h3 className="text-xl font-bold text-indigo-600 mt-6 mb-3">3. 색상 압축 알고리즘 사용</h3>
            <p>가장 중요한 부분입니다. GIF는 표현할 수 있는 색상이 최대 256색으로 제한되어 있습니다. 싸구려 변환기를 사용하면 색이 얼룩덜룩해지는 &apos;디더링(Dithering)&apos; 현상이 발생하죠. 하지만 Gifty와 같은 고급 인코더는 &apos;팔레트 생성 최적화&apos; 기술을 사용하여, 영상에 쓰인 핵심 256색을 먼저 추출한 뒤 압축하므로 화질이 완벽하게 보존됩니다.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">결론: Gifty로 한 번에 해결하세요!</h2>
            <p>이 모든 복잡한 설정을 외울 필요가 없습니다. <strong>Gifty</strong>는 블로거 여러분을 위해 자동으로 20MB가 넘지 않도록 알고리즘을 깎고 다듬어 최고의 결과물을 뽑아냅니다. 만약 변환 결과물이 20MB를 넘는다면, Gifty의 똑똑한 AI(?)가 자동으로 크기를 조금씩 줄여가며 네이버 블로그에 딱 맞는 사이즈로 재도전하여 결국 성공해 냅니다!</p>
            
            <p className="mt-8 font-bold text-center">지금 바로 무료로 Gifty를 체험해 보세요!</p>
            <div className="text-center mt-6">
              <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                움짤 만들러 가기 &rarr;
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}