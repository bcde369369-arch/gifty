'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wand2,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Eye,
  MessageSquare,
  Zap,
  Menu,
  X
} from 'lucide-react';
import CoupangSupportCard from '@/components/CoupangSupportCard';

// ==========================================
// 더미 및 시뮬레이션 알고리즘 헬퍼
// ==========================================

// 금칙어/광고성 위험 단어 리스트
const DANGEROUS_WORDS = [
  '최고', '1위', '완치', '기적', '특효', '보장', '치료제', '부작용 없음',
  '무조건', '절대', '전액 환불', '수익률', '원금 보장', '대출', '카지노'
];

// 카테고리별 황금 키워드 프리셋
const KEYWORD_PRESETS: Record<string, Array<{ keyword: string; searchVolume: number; docCount: number; level: string; compRatio: number }>> = {
  '맛집/카페': [
    { keyword: '성수역 조용한 카페 내돈내산', searchVolume: 4820, docCount: 1240, level: '준최2 이상', compRatio: 0.26 },
    { keyword: '연남동 파스타 단체 모임', searchVolume: 6150, docCount: 2310, level: '준최3 이상', compRatio: 0.38 },
    { keyword: '용리단길 신상 와인바 예약', searchVolume: 3200, docCount: 890, level: '준최1 이상', compRatio: 0.28 },
    { keyword: '강남역 직장인 가성비 점심 밥집', searchVolume: 8900, docCount: 4100, level: '준최4 이상', compRatio: 0.46 },
    { keyword: '수원 행궁동 디저트 선물 포장', searchVolume: 2900, docCount: 750, level: '준최1 이상', compRatio: 0.25 }
  ],
  '여행/나들이': [
    { keyword: '강릉 오션뷰 펜션 내돈내산 후기', searchVolume: 5400, docCount: 1980, level: '준최3 이상', compRatio: 0.36 },
    { keyword: '제주 서쪽 가성비 감성숙소', searchVolume: 7100, docCount: 2600, level: '준최4 이상', compRatio: 0.37 },
    { keyword: '단양 패러글라이딩 복장 준비물', searchVolume: 3900, docCount: 920, level: '준최2 이상', compRatio: 0.24 },
    { keyword: '가평 반려견 동반 글램핑 추천', searchVolume: 6400, docCount: 2150, level: '준최3 이상', compRatio: 0.34 }
  ],
  '뷰티/패션': [
    { keyword: '올리브영 지성 수분크림 내돈내산', searchVolume: 8200, docCount: 3100, level: '준최4 이상', compRatio: 0.38 },
    { keyword: '봄 웜톤 매트 립스틱 발색 비교', searchVolume: 4300, docCount: 1100, level: '준최2 이상', compRatio: 0.25 },
    { keyword: '20대 여자 데일리 가방 브랜드 추천', searchVolume: 9500, docCount: 4200, level: '준최5 이상', compRatio: 0.44 },
    { keyword: '민감성 피부 약산성 클렌징폼 성분', searchVolume: 3400, docCount: 850, level: '준최1 이상', compRatio: 0.25 }
  ],
  'IT/일상': [
    { keyword: '아이폰 16 케이스 내돈내산 거치형', searchVolume: 6700, docCount: 1900, level: '준최3 이상', compRatio: 0.28 },
    { keyword: '가성비 무선 기계식 키보드 타건감', searchVolume: 5100, docCount: 1650, level: '준최3 이상', compRatio: 0.32 },
    { keyword: '네이버 블로그 폰트 변경 모바일 적용법', searchVolume: 4100, docCount: 980, level: '준최2 이상', compRatio: 0.24 },
    { keyword: '아이패드 에어 굿노트 다이어리 서식', searchVolume: 7800, docCount: 2400, level: '준최4 이상', compRatio: 0.31 }
  ]
};

export default function BlogLabPage() {
  const [activeTab, setActiveTab] = useState<'score' | 'keyword' | 'post' | 'ai'>('score');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // === 탭 1: 블로그 지수 진단 상태 ===
  const [blogIdInput, setBlogIdInput] = useState('');
  const [isAnalyzingScore, setIsAnalyzingScore] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    blogId: string;
    level: string;
    scorePercent: number;
    dwellScore: number;
    neighborScore: number;
    activityScore: number;
    totalScore: number;
    postQuality: string;
    advice: string;
    targetKeywordRange: string;
    visualTip: string;
  } | null>(null);

  // === 탭 2: 황금 키워드 발굴 상태 ===
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('맛집/카페');
  const [isSearchingKeyword, setIsSearchingKeyword] = useState(false);
  const [customKeywordResult, setCustomKeywordResult] = useState<{
    keyword: string;
    searchVolume: number;
    pcVolume: number;
    mobileVolume: number;
    docCount: number;
    compRatio: number;
    recommendedLevel: string;
    isGolden: boolean;
  } | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // === 탭 3: 포스팅 누락 & 형태소/금칙어 검사 상태 ===
  const [postMode, setPostMode] = useState<'text' | 'url'>('text');
  const [postText, setPostText] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [hasPostChecked, setHasPostChecked] = useState(false);
  const [isCheckingPost, setIsCheckingPost] = useState(false);

  // === 탭 4: AI 처방전 & 문맥 교정 상태 ===
  const [aiRawText, setAiRawText] = useState('');
  const [aiFocusKeyword, setAiFocusKeyword] = useState('');
  const [aiPolishedText, setAiPolishedText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedAiText, setCopiedAiText] = useState(false);

  // ------------------------------------------
  // 핸들러: 블로그 지수 진단
  // ------------------------------------------
  const handleAnalyzeBlog = (targetId?: string) => {
    const id = (targetId || blogIdInput).trim().replace(/https?:\/\/blog\.naver\.com\//, '').split('/')[0];
    if (!id) {
      alert('네이버 블로그 아이디를 입력해주세요!');
      return;
    }
    setBlogIdInput(id);
    setIsAnalyzingScore(true);
    setScoreResult(null);

    // 실제 알고리즘 시뮬레이션
    setTimeout(() => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      const abs = Math.abs(hash);

      const levels = ['준최적화 1단계', '준최적화 2단계', '준최적화 3단계', '준최적화 4단계', '준최적화 5단계', '최적화 1단계', '최적화 2단계'];
      const chosenLevel = levels[abs % levels.length];
      const baseScore = 60 + (abs % 36); // 60~95점
      const dwell = 70 + (abs % 28);
      const neighbor = 65 + ((abs >> 2) % 32);
      const activity = 75 + ((abs >> 4) % 24);

      setScoreResult({
        blogId: id,
        level: chosenLevel,
        scorePercent: Math.min(99, Math.max(45, 100 - Math.floor(baseScore * 0.8))),
        dwellScore: Math.min(98, dwell),
        neighborScore: Math.min(97, neighbor),
        activityScore: Math.min(99, activity),
        totalScore: baseScore,
        postQuality: baseScore > 80 ? '매우 우수 (상위 5% 이내)' : baseScore > 70 ? '안정적 성장 중' : '보통 (키워드/체류시간 보강 필요)',
        advice: chosenLevel.includes('준최') 
          ? '현재 체급에서는 월간 검색량 2,000~6,000 수준의 롱테일/세부 키워드를 집중 공략할 때 뷰(VIEW) 상위 노출 확률이 85% 이상으로 가장 높습니다.'
          : '최적화 단계의 블로그입니다! 단일 메인 키워드(월 1만 이상)에 도전하시되, 본문에 체류시간용 움직이는 GIF(움짤)를 최소 2개 이상 배치해 이탈률을 방어하세요.',
        targetKeywordRange: chosenLevel.includes('준최1') || chosenLevel.includes('준최2') 
          ? '월간 검색량 800 ~ 3,000 구간 추천' 
          : chosenLevel.includes('준최3') || chosenLevel.includes('준최4')
          ? '월간 검색량 3,000 ~ 8,000 구간 추천'
          : '월간 검색량 8,000 ~ 25,000 구간 공략 가능',
        visualTip: dwell < 80 
          ? '⚠️ 방문자 체류 시간이 다소 짧습니다. 글 중간에 눈길을 사로잡는 [Gifty 움짤]과 핵심을 짚어주는 [Gifty 스티커]를 삽입하여 스크롤 이탈을 막아보세요!'
          : '✨ 비주얼 요소와 가독성이 뛰어납니다. 현재 퀄리티를 유지하면서 서이추 소통을 보강하시면 다음 지수 단계로 빠르게 승급합니다.'
      });
      setIsAnalyzingScore(false);
    }, 1200);
  };

  // ------------------------------------------
  // 핸들러: 키워드 검색
  // ------------------------------------------
  const handleSearchKeyword = (kw?: string) => {
    const q = (kw || keywordInput).trim();
    if (!q) {
      alert('분석할 키워드를 입력해주세요!');
      return;
    }
    setKeywordInput(q);
    setIsSearchingKeyword(true);

    setTimeout(() => {
      let hash = 0;
      for (let i = 0; i < q.length; i++) {
        hash = (hash << 5) - hash + q.charCodeAt(i);
        hash |= 0;
      }
      const abs = Math.abs(hash);
      const searchVolume = 1200 + (abs % 18500);
      const pcVolume = Math.round(searchVolume * 0.22);
      const mobileVolume = searchVolume - pcVolume;
      const docCount = 400 + ((abs >> 3) % 9200);
      const compRatio = +(docCount / searchVolume).toFixed(2);
      const isGolden = compRatio < 0.35 && searchVolume >= 2000;

      let recLevel = '준최1 이상';
      if (searchVolume > 12000) recLevel = '최적화 1단계 이상';
      else if (searchVolume > 6000) recLevel = '준최3~4단계 이상';
      else if (searchVolume > 2500) recLevel = '준최2단계 이상';

      setCustomKeywordResult({
        keyword: q,
        searchVolume,
        pcVolume,
        mobileVolume,
        docCount,
        compRatio,
        recommendedLevel: recLevel,
        isGolden
      });
      setIsSearchingKeyword(false);
    }, 700);
  };

  // ------------------------------------------
  // 핸들러: 포스팅 텍스트 분석
  // ------------------------------------------
  const postAnalysisData = useMemo(() => {
    if (!postText.trim()) {
      return {
        charCountWithSpace: 0,
        charCountWithoutSpace: 0,
        wordCount: 0,
        keywordRepeats: 0,
        keywordDensity: 0,
        foundDangerousWords: [] as string[],
        dwellEstimateSeconds: 0,
        dwellScore: 0,
        repeatWarning: false
      };
    }

    const clean = postText.trim();
    const charCountWithSpace = clean.length;
    const charCountWithoutSpace = clean.replace(/\s+/g, '').length;
    const words = clean.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 타겟 키워드 반복수
    let keywordRepeats = 0;
    if (targetKeyword.trim()) {
      const regex = new RegExp(targetKeyword.trim(), 'gi');
      const matches = clean.match(regex);
      keywordRepeats = matches ? matches.length : 0;
    }

    const keywordDensity = charCountWithoutSpace > 0 && targetKeyword.trim()
      ? +((keywordRepeats * targetKeyword.trim().length / charCountWithoutSpace) * 100).toFixed(1)
      : 0;

    // 금칙어 검출
    const foundDangerous = DANGEROUS_WORDS.filter(w => clean.includes(w));

    // 체류시간 추정 (글자당 평균 0.05초 + 기본 15초)
    const dwellEstimateSeconds = Math.round(15 + charCountWithoutSpace * 0.045);
    const dwellScore = Math.min(100, Math.round((dwellEstimateSeconds / 120) * 100));

    return {
      charCountWithSpace,
      charCountWithoutSpace,
      wordCount,
      keywordRepeats,
      keywordDensity,
      foundDangerousWords: foundDangerous,
      dwellEstimateSeconds,
      dwellScore,
      repeatWarning: keywordRepeats >= 8 || keywordDensity > 3.5
    };
  }, [postText, targetKeyword]);

  // ------------------------------------------
  // 핸들러: AI 문맥 교정
  // ------------------------------------------
  const handleGenerateAiCorrection = () => {
    if (!aiRawText.trim()) {
      alert('교정할 원고나 문장을 입력해주세요!');
      return;
    }
    setIsGeneratingAi(true);

    setTimeout(() => {
      const kw = aiFocusKeyword.trim() || '맛집';
      // 시뮬레이션: 반복되는 키워드를 자연스러운 수식어로 교체하고, 문단 끝에 체류시간 증가용 유도 멘트 추가
      let polished = aiRawText;
      const count = (polished.match(new RegExp(kw, 'g')) || []).length;
      
      if (count > 3) {
        // 일부를 대명사나 동의어로 교체
        let replaced = 0;
        polished = polished.replace(new RegExp(kw, 'g'), (match) => {
          replaced++;
          if (replaced === 2) return '이곳';
          if (replaced === 4) return '해당 장소';
          if (replaced === 6) return '매장';
          return match;
        });
      }

      polished = polished.trim() + `\n\n📌 [Gifty 체류시간 꿀팁 처방]\n- 이 단락 바로 아래에 음식이 보글보글 끓는 [움짤]을 넣어보세요! 체류시간이 평균 40초 이상 늘어납니다.\n- 포스팅 마지막에는 방문자와의 소통을 위해 '여러분의 최애 메뉴는 무엇인가요?' 스티커를 부착해보세요!`;

      setAiPolishedText(polished);
      setIsGeneratingAi(false);
    }, 1000);
  };

  const copyToClipboard = (text: string, onCopied: () => void) => {
    navigator.clipboard.writeText(text).then(() => {
      onCopied();
    }).catch(() => {
      alert('복사 권한이 필요합니다.');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
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
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/blog-lab" className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors flex items-center gap-1">
              연구소(SEO) 🔬
            </Link>
            <Link href="/neighbor" className="hover:text-emerald-700 transition-colors text-emerald-600 font-extrabold flex items-center gap-1">
              이웃 소통 지표 📊
            </Link>
            <Link href="/community" className="hover:text-indigo-600 transition-colors text-slate-600 flex items-center gap-1">
              커뮤니티 💬
            </Link>
            <Link href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">
              체험단 다이어리 📓
            </Link>
            <Link href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">
              블로그 스티커 🎨
            </Link>
            <Link href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">
              누끼따기(AI) ✂️
            </Link>
          </div>
          <button
            className="md:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0">
            <Link href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</Link>
            <Link href="/blog-lab" className="text-indigo-600 bg-indigo-50 p-3 rounded-xl font-black">연구소(SEO) 🔬</Link>
            <Link href="/neighbor" className="text-emerald-600 hover:bg-emerald-50 p-3 rounded-xl font-black">이웃 소통 지표 📊</Link>
            <Link href="/community" className="text-slate-700 hover:bg-slate-50 p-3 rounded-xl">커뮤니티 💬</Link>
            <Link href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</Link>
            <Link href="/sticker" className="text-pink-600 hover:bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</Link>
            <Link href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-sm">
            <Zap size={14} className="text-indigo-600 animate-pulse" />
            <span>블라이(Blai)보다 강력한 처방형 블로그 SEO 솔루션</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Gifty <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">블로그 연구소</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            단순히 수치만 보여주는 분석은 이제 그만! 내 블로그 지수 진단부터 황금 키워드 발굴, 체류시간을 극대화하는 비주얼 처방전까지 원스톱으로 확인하세요.
          </p>
        </div>

        {/* 4대 핵심 탭 메뉴 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-slate-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('score')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'score'
                ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <BarChart3 size={17} />
            <span>블로그 지수 진단</span>
          </button>
          <button
            onClick={() => setActiveTab('keyword')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'keyword'
                ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Flame size={17} className="text-amber-500" />
            <span>황금 키워드 발굴</span>
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'post'
                ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <ShieldCheck size={17} className="text-emerald-500" />
            <span>포스팅 누락·금칙어</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'ai'
                ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Wand2 size={17} className="text-purple-500" />
            <span>AI 문맥 교정기</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 탭 1: 블로그 지수 & 건강도 진단기 */}
        {/* ========================================================= */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                  내 블로그의 현재 체급(지수)과 체류시간 진단
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  네이버 블로그 아이디를 입력하시면 추정 등급, 이웃 소통도, 이탈률 방어 지표를 복합 계산해 드립니다.
                </p>
              </div>

              {/* 검색 인풋 */}
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={blogIdInput}
                    onChange={(e) => setBlogIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeBlog()}
                    placeholder="네이버 블로그 ID 또는 주소 입력 (예: myblog)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  onClick={() => handleAnalyzeBlog()}
                  disabled={isAnalyzingScore}
                  className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzingScore ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>무료 정밀 진단</span>
                    </>
                  )}
                </button>
              </div>

              {/* 샘플 빠른 테스트 */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
                <span>빠른 체험 예시:</span>
                <button
                  onClick={() => handleAnalyzeBlog('food_traveler')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #맛집블로그
                </button>
                <button
                  onClick={() => handleAnalyzeBlog('daily_it_tech')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #IT리뷰어
                </button>
                <button
                  onClick={() => handleAnalyzeBlog('beauty_queen')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #뷰티인플루언서
                </button>
              </div>
            </div>

            {/* 진단 결과 카드 */}
            {scoreResult && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 animate-fadeIn space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      진단 완료: @{scoreResult.blogId}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
                      <span>{scoreResult.level}</span>
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        상위 {scoreResult.scorePercent}%
                      </span>
                    </h3>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">종합 건전도 점수</div>
                      <div className="text-3xl font-black text-indigo-600">{scoreResult.totalScore}점</div>
                    </div>
                  </div>
                </div>

                {/* 3대 세부 지표 프로그레스 바 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-purple-500" /> 체류 시간 활력도
                      </span>
                      <span className="text-purple-600 font-extrabold">{scoreResult.dwellScore}점</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-700" style={{ width: `${scoreResult.dwellScore}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">스크롤 완독률 및 미디어 흡입력</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} className="text-emerald-500" /> 찐이웃 소통 건강도
                      </span>
                      <span className="text-emerald-600 font-extrabold">{scoreResult.neighborScore}점</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${scoreResult.neighborScore}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Gifty 이웃 정리기 기준 유효 반응률</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-indigo-500" /> 포스팅 발행 안정성
                      </span>
                      <span className="text-indigo-600 font-extrabold">{scoreResult.activityScore}점</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${scoreResult.activityScore}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">정기 포스팅 빈도 및 누락 방어율</p>
                  </div>
                </div>

                {/* 🎯 Gifty만의 액션형 처방전 (블라이와 차별화되는 지점) */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-2xl border border-indigo-200/80 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-base">
                    <Sparkles size={18} className="text-indigo-600" />
                    <span>Gifty 전담 분석관의 맞춤형 승급 처방전</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100">
                      <div className="font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                        <Flame size={15} className="text-amber-500" /> 추천 키워드 공략 체급
                      </div>
                      <p className="text-slate-600 font-semibold mb-2">{scoreResult.targetKeywordRange}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{scoreResult.advice}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100">
                      <div className="font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                        <Wand2 size={15} className="text-pink-500" /> 체류 시간 극대화 비주얼 솔루션
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed mb-3">{scoreResult.visualTip}</p>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                        >
                          움짤 만들러 가기 &rarr;
                        </Link>
                        <Link
                          href="/sticker"
                          className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs rounded-lg border border-pink-200 transition-colors flex items-center gap-1"
                        >
                          스티커 만들기 &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 2: 황금 키워드 & 검색량 발굴기 */}
        {/* ========================================================= */}
        {activeTab === 'keyword' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                  검색량은 많고 문서는 적은 &lsquo;황금 키워드&rsquo; 발굴기
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  원하는 키워드를 입력하시면 PC/모바일 검색량, 경쟁 비율, 내 지수로 상위 노출이 가능한지 진단해 드립니다.
                </p>
              </div>

              {/* 키워드 검색 인풋 */}
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchKeyword()}
                    placeholder="조회할 키워드 입력 (예: 강남역 맛집 내돈내산)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  onClick={() => handleSearchKeyword()}
                  disabled={isSearchingKeyword}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSearchingKeyword ? <RefreshCw size={16} className="animate-spin" /> : <Flame size={16} className="text-amber-400" />}
                  <span>키워드 분석</span>
                </button>
              </div>

              {/* 직접 검색한 키워드 결과 */}
              {customKeywordResult && (
                <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl mb-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-indigo-200/60 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">&lsquo;{customKeywordResult.keyword}&rsquo;</span>
                        {customKeywordResult.isGolden && (
                          <span className="bg-amber-400 text-slate-900 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Flame size={12} /> 황금 키워드
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        권장 블로그 지수: <strong className="text-indigo-600">{customKeywordResult.recommendedLevel}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(customKeywordResult.keyword, () => {
                        setCopiedKeyword(customKeywordResult.keyword);
                        setTimeout(() => setCopiedKeyword(null), 2000);
                      })}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                    >
                      {copiedKeyword === customKeywordResult.keyword ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>키워드 복사</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <div className="text-[11px] text-slate-400 font-semibold">총 월간 검색량</div>
                      <div className="text-lg font-black text-indigo-600 mt-0.5">{customKeywordResult.searchVolume.toLocaleString()}회</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <div className="text-[11px] text-slate-400 font-semibold">모바일 비율</div>
                      <div className="text-lg font-black text-purple-600 mt-0.5">{customKeywordResult.mobileVolume.toLocaleString()}회</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <div className="text-[11px] text-slate-400 font-semibold">발행 문서 수</div>
                      <div className="text-lg font-black text-slate-700 mt-0.5">{customKeywordResult.docCount.toLocaleString()}건</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <div className="text-[11px] text-slate-400 font-semibold">경쟁 포화도</div>
                      <div className={`text-lg font-black mt-0.5 ${customKeywordResult.compRatio < 0.35 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {customKeywordResult.compRatio}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 카테고리별 실시간 추천 황금 키워드 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-500" /> 카테고리별 추천 황금 롱테일 키워드
                  </h3>
                  <div className="flex items-center gap-1 text-xs">
                    {Object.keys(KEYWORD_PRESETS).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          selectedCategory === cat
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/60">
                        <th className="py-2.5 px-3">추천 키워드</th>
                        <th className="py-2.5 px-3 text-right">월 검색량</th>
                        <th className="py-2.5 px-3 text-right">문서 수</th>
                        <th className="py-2.5 px-3 text-center">경쟁도</th>
                        <th className="py-2.5 px-3 text-center">추천 체급</th>
                        <th className="py-2.5 px-3 text-center">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {KEYWORD_PRESETS[selectedCategory]?.map((row) => (
                        <tr key={row.keyword} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                            <Flame size={14} className="text-amber-500 shrink-0" />
                            <span>{row.keyword}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-indigo-600">
                            {row.searchVolume.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500">
                            {row.docCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-xs border border-emerald-200">
                              꿀키워드 ({row.compRatio})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-600 text-xs">
                            {row.level}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => copyToClipboard(row.keyword, () => {
                                setCopiedKeyword(row.keyword);
                                setTimeout(() => setCopiedKeyword(null), 2000);
                              })}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              {copiedKeyword === row.keyword ? '복사됨!' : '복사'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 3: 포스팅 누락 & 금칙어/형태소 검사기 */}
        {/* ========================================================= */}
        {activeTab === 'post' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                  포스팅 검색 누락 & 형태소/금칙어 정밀 진단
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  발행 전 원고를 붙여넣어 글자 수, 키워드 과다 반복(저품질 위험), 금칙어를 체크하거나 발행 후 URL 누락 여부를 확인하세요.
                </p>
              </div>

              {/* 모드 선택 */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => setPostMode('text')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    postMode === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📝 원고 텍스트 직접 검사 (발행 전)
                </button>
                <button
                  onClick={() => setPostMode('url')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    postMode === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔗 포스팅 URL 누락 검사 (발행 후)
                </button>
              </div>

              {postMode === 'text' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        🎯 공략 메인 키워드 (선택)
                      </label>
                      <input
                        type="text"
                        value={targetKeyword}
                        onChange={(e) => setTargetKeyword(e.target.value)}
                        placeholder="예: 강남역 고기집"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        💡 검사 안내
                      </label>
                      <div className="text-xs text-slate-500 py-2.5">
                        공백 제외 1,500자 이상 & 키워드 4~6회 반복 시 상위 노출에 가장 이상적입니다.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      본문 내용 붙여넣기
                    </label>
                    <textarea
                      rows={8}
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder="블로그에 작성할 본문 내용을 그대로 복사해 붙여넣어 주세요. 실시간으로 글자수, 키워드 반복률, 위험 단어를 검사합니다."
                      className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  {/* 실시간 분석 통계 카드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                      <div className="text-[11px] text-slate-400 font-semibold">공백 포함 글자수</div>
                      <div className="text-lg font-black text-slate-800 mt-0.5">
                        {postAnalysisData.charCountWithSpace.toLocaleString()}자
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                      <div className="text-[11px] text-slate-400 font-semibold">공백 제외 글자수</div>
                      <div className="text-lg font-black text-indigo-600 mt-0.5">
                        {postAnalysisData.charCountWithoutSpace.toLocaleString()}자
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                      <div className="text-[11px] text-slate-400 font-semibold">메인 키워드 반복</div>
                      <div className={`text-lg font-black mt-0.5 ${postAnalysisData.repeatWarning ? 'text-red-500' : 'text-emerald-600'}`}>
                        {postAnalysisData.keywordRepeats}회
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                      <div className="text-[11px] text-slate-400 font-semibold">예상 체류 시간</div>
                      <div className="text-lg font-black text-purple-600 mt-0.5">
                        약 {postAnalysisData.dwellEstimateSeconds}초
                      </div>
                    </div>
                  </div>

                  {/* 경고 및 알림 배너 */}
                  {postAnalysisData.repeatWarning && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs sm:text-sm">
                      <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <strong>키워드 과다 반복 주의!</strong> 동일 키워드가 너무 잦으면 네이버 검색 알고리즘에서 어뷰징(스팸)으로 판정될 위험이 있습니다. [AI 문맥 교정기] 탭에서 자연스러운 동의어로 교체해보세요.
                      </div>
                    </div>
                  )}

                  {postAnalysisData.foundDangerousWords.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs sm:text-sm">
                      <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <strong>주의 단어 발견 ({postAnalysisData.foundDangerousWords.join(', ')})</strong>:
                        과장/광고성 또는 의료법/심의 위반 가능성이 있는 단어가 포함되어 있습니다. 완곡한 표현으로 수정을 권장합니다.
                      </div>
                    </div>
                  )}

                  {!postAnalysisData.repeatWarning && postAnalysisData.charCountWithoutSpace >= 1200 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <strong>상위 노출에 최적화된 글자수입니다!</strong> 본문 곳곳에 지루함을 덜어주는 [Gifty 움짤]을 함께 삽입하시면 완벽한 체류시간을 확보할 수 있습니다.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* URL 검사 모드 */
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      placeholder="검사할 포스팅 URL (예: https://blog.naver.com/...)"
                      className="flex-grow px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        if (!postUrl.trim()) return alert('URL을 입력해주세요!');
                        setIsCheckingPost(true);
                        setTimeout(() => {
                          setIsCheckingPost(false);
                          setHasPostChecked(true);
                        }, 900);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
                    >
                      {isCheckingPost ? '확인 중...' : '누락 검사'}
                    </button>
                  </div>

                  {hasPostChecked && (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm sm:text-base">정상 노출 (Good)</div>
                          <div className="text-xs text-slate-500">네이버 뷰(VIEW)/스마트블록에 정상 색인되었습니다.</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        누락 없음
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 4: AI 처방전 & 문맥 교정기 */}
        {/* ========================================================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-extrabold mb-2 border border-purple-200">
                  <Wand2 size={13} />
                  <span>블라이에는 없는 Gifty만의 액션형 AI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                  키워드 과다 반복 완화 & 체류시간 증폭 처방기
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  어색하게 중복된 키워드를 자연스러운 문맥으로 바꾸고, 스크롤 이탈을 막는 맞춤형 비주얼 배치 위치를 추천해 드립니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 입력 칼럼 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      반복 완화할 키워드 (예: &lsquo;성수 맛집&rsquo;)
                    </label>
                    <input
                      type="text"
                      value={aiFocusKeyword}
                      onChange={(e) => setAiFocusKeyword(e.target.value)}
                      placeholder="중복으로 지적받은 키워드 입력"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      다듬을 본문 단락
                    </label>
                    <textarea
                      rows={9}
                      value={aiRawText}
                      onChange={(e) => setAiRawText(e.target.value)}
                      placeholder="키워드가 너무 많이 들어가서 어색하거나, 이탈률이 걱정되는 단락을 붙여넣어 주세요."
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAiCorrection}
                    disabled={isGeneratingAi}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>AI 분석 및 교정 중...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        <span>원클릭 자연스러운 문맥 교정</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 결과 칼럼 */}
                <div className="space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-purple-700">
                      ✨ AI 교정 결과 및 체류시간 처방
                    </label>
                    {aiPolishedText && (
                      <button
                        onClick={() => copyToClipboard(aiPolishedText, () => {
                          setCopiedAiText(true);
                          setTimeout(() => setCopiedAiText(false), 2000);
                        })}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        {copiedAiText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedAiText ? '복사 완료!' : '전체 복사'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-grow p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto whitespace-pre-wrap min-h-[240px]">
                    {aiPolishedText ? (
                      aiPolishedText
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-10">
                        <Wand2 size={28} className="text-purple-300 mb-2" />
                        <p>왼쪽에 단락을 입력하고 버튼을 누르면<br />자연스러운 문맥과 비주얼 추천 팁이 생성됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 안내 및 제휴 배너 */}
        <div className="mt-12">
          <CoupangSupportCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Gifty. 네이버 블로거의 성장을 위한 올인원 워크스페이스.</p>
      </footer>
    </div>
  );
}
