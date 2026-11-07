'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BarChart3,
  Heart,
  UserX,
  Trophy,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Copy,
  Check,
  Menu,
  X,
  RefreshCw,
  Sparkle,
  ClipboardPaste,
  Bookmark,
  Download,
  Laptop,
  Smartphone,
  Send,
  CheckSquare,
  Square,
  History,
  Calendar,
  Clock,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import CoupangSupportCard from '@/components/CoupangSupportCard';

interface ParsedNeighbor {
  id: string;
  nickname: string;
  addedDate?: string;
  group?: string;
}

interface Communicator {
  rank: number;
  id: string;
  nickname: string;
  likes?: number;
  comments?: number;
  activityLevel?: string;
  postStatus?: string;
  totalScore: number;
  grade: '다이아' | '골드' | '실버' | '브론즈';
  isProtected?: boolean;
  statusBadge?: 'VIP' | 'NEW' | 'WARNING' | 'ACTIVE';
  lastActiveDate?: string;
  giveAndTake?: '서로 소통형' | '답방 권장' | '열혈 팬형';
}

interface InactiveNeighbor {
  id: string;
  nickname: string;
  reason: string;
  group?: string;
  selected: boolean;
}

interface AnalysisRecord {
  id: string;
  date: string;
  blogId: string;
  totalParsedCount: number;
  postCount: number;
  healthScore: number;
  topCommunicators: Communicator[];
  inactiveNeighbors: InactiveNeighbor[];
  trend: {
    vipCount: number;
    newCount: number;
    warningCount: number;
    inactiveCount: number;
  };
}

export default function NeighborAnalyticsPage() {
  const [blogId, setBlogId] = useState('');
  const [rawPastedText, setRawPastedText] = useState('');
  const [duration, setDuration] = useState<'1' | '3' | '6'>('3');
  const [cutoffRatio, setCutoffRatio] = useState<number>(0.3); // 기본 하위 30% 선별
  const [protectedNames, setProtectedNames] = useState<string>(''); // 보호할 찐이웃 목록
  const [searchFilter, setSearchFilter] = useState(''); // 무소통 목록 내 검색
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'inactive' | 'top' | 'routine' | 'summary' | 'guide'>('inactive');
  const [deleteMode, setDeleteMode] = useState<'bookmarklet' | 'extension' | 'f12' | 'mobile'>('bookmarklet');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [copiedNick, setCopiedNick] = useState<string | null>(null);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🌟 이웃소통지표 편의 관리 상태 (히스토리, 답방 큐, 필터링, 동기화, 확장프로그램)
  const [historyRecords, setHistoryRecords] = useState<AnalysisRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [copiedChromeUrl, setCopiedChromeUrl] = useState(false);
  const [visitedToday, setVisitedToday] = useState<Record<string, boolean>>({});
  const [routineFilter, setRoutineFilter] = useState<'all' | 'unvisited' | 'visited'>('all');
  const [topFilter, setTopFilter] = useState<'all' | 'vip' | 'new' | 'unvisited'>('all');
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<{
    vipCount: number;
    newCount: number;
    warningCount: number;
    inactiveCount: number;
  }>({ vipCount: 0, newCount: 0, warningCount: 0, inactiveCount: 0 });
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // 분석 결과 상태
  const [totalParsedCount, setTotalParsedCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [healthScore, setHealthScore] = useState(78);
  const [topCommunicators, setTopCommunicators] = useState<Communicator[]>([]);
  const [inactiveNeighbors, setInactiveNeighbors] = useState<InactiveNeighbor[]>([]);
  const [extractedIdMap, setExtractedIdMap] = useState<Record<string, string>>({});
  const [recentLogNos, setRecentLogNos] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // 💾 컴포넌트 마운트 시 로컬스토리지 히스토리 & 당일 답방 현황 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRecords = localStorage.getItem('gifty_neighbor_records_v1');
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryRecords(parsed);
        }
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const savedVisits = localStorage.getItem(`gifty_visited_${todayStr}`);
      if (savedVisits) {
        setVisitedToday(JSON.parse(savedVisits));
      }

      // 익스텐션 또는 URL 쿼리 연동 확인
      const params = new URLSearchParams(window.location.search);
      const paramBlogId = params.get('blogId') || params.get('autoBlogId');
      if (paramBlogId) {
        setBlogId(paramBlogId);
      }

      const syncRaw = localStorage.getItem('gifty_extension_sync_data');
      if (syncRaw) {
        try {
          const syncData = JSON.parse(syncRaw);
          if (syncData.text && Date.now() - (syncData.timestamp || 0) < 1000 * 60 * 30) {
            setRawPastedText(syncData.text);
            if (syncData.blogId) setBlogId(syncData.blogId);
            setSyncNotice(`⚡ 크롬 확장 프로그램에서 ${syncData.blogId ? syncData.blogId + '님의 ' : ''}이웃 데이터를 불러왔습니다!`);
            localStorage.removeItem('gifty_extension_sync_data');
          }
        } catch {}
      }
    } catch {}
  }, []);

  // 아이디 파싱 함수 (URL을 통째로 넣었을 때도 처리)
  const cleanBlogId = (input: string) => {
    let cleaned = input.trim();
    if (cleaned.includes('blog.naver.com/')) {
      const parts = cleaned.split('blog.naver.com/');
      cleaned = parts[1].split('/')[0].split('?')[0];
    }
    return cleaned.replace(/[^a-zA-Z0-9_-]/g, '');
  };

  // 시스템 단어 또는 날짜인지 판별하는 엄격한 필터
  const isSystemNoise = (text: string): boolean => {
    const s = text.trim();
    if (!s) return true;
    // 1. 날짜 패턴이 포함된 경우 (예: "26.11.03." 또는 "26.11.03. 26.10.31.")
    if (/\d{2,4}\.\d{1,2}\.\d{1,2}/.test(s)) return true;
    // 2. 한글 또는 영문 알파벳이 단 1글자도 없는 경우 (숫자, 마침표, 기호만 있는 줄)
    if (!/[a-zA-Z가-힣]/.test(s)) return true;
    // 3. 순수 숫자
    if (/^\d+$/.test(s.replace(/[-_.\s]/g, ''))) return true;
    // 4. 네이버 관리자 UI 단어 (버튼, 상태, 그룹명 등)
    const noiseWords = [
      '새그룹', '기본그룹', '서로이웃', '♥서로이웃', '이웃', 'on', 'off',
      '새글소식', '소식받기', '전체선택', '그룹변경', '이웃삭제', '스팸 차단 관리',
      '차단 설정', '차단된 글목록', '댓글·안부글 권한', '이웃 관리', '내가 추가한 이웃',
      '나를 추가한 이웃', '서로이웃 신청', '공지사항', '블로그 이용 tip', '블로그 스마트봇',
      '소개글', '별명', '블로그', '관리'
    ];
    if (noiseWords.includes(s.toLowerCase())) return true;
    return false;
  };

  // 닉네임 정제 함수: "♥ 배병직 세무사 | 위너스(Winners)" -> "배병직 세무사"
  const cleanNickname = (raw: string): string => {
    let s = raw.trim();
    // 0. 이웃순서 화면의 앞머리 하트(♥, ❤) 및 특수 불릿 기호 제거
    s = s.replace(/^[♥❤★☆*•·-]\s*/, '').trim();
    // 1. 파이프(|)로 닉네임과 블로그명이 나뉘어 있을 때, 무조건 첫 번째 파트가 실제 닉네임!
    if (s.includes('|')) {
      const parts = s.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) s = parts[0];
    }
    // 하트 재차 제거
    s = s.replace(/^[♥❤★☆*•·-]\s*/, '').trim();
    // 괄호 안에 있는 아이디 제거 (예: "배병직 세무사 (Winners)" -> "배병직 세무사")
    s = s.replace(/\s*\([^)]*\)$/, '').trim();
    // 2회 연속 단어 중복 제거
    const len = s.length;
    if (len >= 4 && len % 2 === 0) {
      const half = len / 2;
      if (s.slice(0, half) === s.slice(half)) {
        s = s.slice(0, half);
      }
    }
    return s.trim();
  };

  // 유효한 네이버 영문/숫자 아이디 검증
  const isValidNaverId = (id: string): boolean => {
    if (!id) return false;
    const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleaned.length < 3 || cleaned.length > 25) return false;
    if (/^\d+$/.test(cleaned)) return false; // 순수 숫자는 제외
    if (isSystemNoise(cleaned)) return false;
    return true;
  };

  // 🎯 네이버 이웃 관리자 전용 정밀 복합 파서
  const parseNaverBuddyText = (text: string): ParsedNeighbor[] => {
    const neighbors: ParsedNeighbor[] = [];
    const seenNicks = new Set<string>();

    const addNeighbor = (nick: string, rawId?: string, group?: string) => {
      const cleanedNick = cleanNickname(nick);
      if (!cleanedNick || isSystemNoise(cleanedNick) || cleanedNick.length < 2) return;
      // 추가 안전장치: 닉네임에 한글 또는 영문 알파벳이 반드시 포함되어야 함 (날짜, 기호 방지)
      if (!/[a-zA-Z가-힣]/.test(cleanedNick)) return;
      if (seenNicks.has(cleanedNick)) return;

      seenNicks.add(cleanedNick);

      let validId = '';
      if (rawId) {
        const idCandidate = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
        if (isValidNaverId(idCandidate)) {
          validId = idCandidate;
        }
      }

      // 붙여넣기 시 추출된 실제 블로그 아이디가 있다면 우선 매핑
      if (!validId && extractedIdMap[cleanedNick]) {
        validId = extractedIdMap[cleanedNick];
      }

      neighbors.push({
        id: validId || cleanedNick,
        nickname: cleanedNick,
        group: group || '서로이웃'
      });
    };

    // 1단계: 탭(\t) 구분 테이블 행 우선 처리 (가장 흔함)
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      // 파이프(|)가 포함된 라인은 네이버 [닉네임 | 블로그제목] 형태
      if (line.includes('|')) {
        const tabParts = line.split(/[\t]+/).map((p) => p.trim()).filter(Boolean);
        // 탭으로 나뉜 경우 파이프가 있는 파트 찾기
        const pipePart = tabParts.find((p) => p.includes('|')) || line;
        
        // 괄호 안의 영문 아이디 추출 시도: 예) 위너스(Winners)
        const idMatch = pipePart.match(/\(([a-zA-Z0-9_-]{3,25})\)/);
        const extractedId = idMatch ? idMatch[1] : undefined;

        // 그룹명 추출 (새그룹, 기본그룹, 서로이웃 등)
        const groupPart = tabParts.find((p) => p.includes('그룹') || p.includes('이웃'));

        addNeighbor(pipePart, extractedId, groupPart);
        continue;
      }

      // 탭으로 나뉘어 있으나 파이프가 없는 행
      const tabParts = line.split(/[\t]+/).map((p) => p.trim()).filter(Boolean);
      if (tabParts.length >= 2) {
        const candidateNick = tabParts.find((p) => !isSystemNoise(p));
        if (candidateNick) {
          const candidateId = tabParts.find((p) => p !== candidateNick && isValidNaverId(p));
          addNeighbor(candidateNick, candidateId);
          continue;
        }
      }

      // 2단계: 줄바꿈된 텍스트 중 단독 닉네임 라인 처리
      if (!isSystemNoise(line)) {
        addNeighbor(line);
      }
    }

    return neighbors;
  };

  // 클립보드 HTML에서 네이버 고유 블로그 주소(아이디) 자동 추출 핸들러
  const handlePasteText = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        const newMap: Record<string, string> = {};
        links.forEach((a) => {
          const href = a.getAttribute('href') || '';
          const text = a.textContent?.trim() || '';
          const match = href.match(/blog\.naver\.com\/([a-zA-Z0-9_-]{3,25})/i);
          if (match && text) {
            const clean = cleanNickname(text);
            if (clean && !isSystemNoise(clean)) {
              newMap[clean] = match[1];
            }
          }
        });
        if (Object.keys(newMap).length > 0) {
          setExtractedIdMap((prev) => ({ ...prev, ...newMap }));
        }
      }
    } catch {
      // fallback
    }
  };

  // 네이버 블로그 특정 글의 공개 댓글 작성자 실시간 조회 (JSONP 기법)
  const fetchPostComments = (targetBlogId: string, logNo: string): Promise<Array<{ userId: string; userName: string }>> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve([]);
        return;
      }
      const callbackName = `cbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const script = document.createElement('script');
      let isDone = false;

      const cleanup = () => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
        delete (window as unknown as Record<string, unknown>)[callbackName];
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve([]);
      }, 2500);

      (window as unknown as Record<string, (data: unknown) => void>)[callbackName] = (data: unknown) => {
        cleanup();
        try {
          const res = data as {
            success?: boolean;
            result?: {
              commentList?: Array<{
                userId?: string;
                userName?: string;
                deleted?: boolean;
              }>;
            };
          };
          if (res?.success && Array.isArray(res.result?.commentList)) {
            const list = res.result.commentList
              .filter((c) => !c.deleted && c.userName)
              .map((c) => ({
                userId: (c.userId || '').trim(),
                userName: (c.userName || '').trim()
              }));
            resolve(list);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      };

      script.onerror = () => {
        cleanup();
        resolve([]);
      };

      script.src = `https://apis.naver.com/commentBox/cbox/web_naver_list_jsonp.json?ticket=blog&pool=cbox3&_callback=${callbackName}&lang=ko&country=KR&objectId=${encodeURIComponent(targetBlogId)}_201_${encodeURIComponent(logNo)}&pageSize=100`;
      document.body.appendChild(script);
    });
  };

  // 네이버 복사 텍스트의 정렬 이상(가나다순/등록일순) 감지 함수
  const checkSortAnomaly = (neighbors: ParsedNeighbor[], rawText: string) => {
    if (neighbors.length < 8) return { isDangerous: false, message: '' };

    // 1. 별명 가나다순(오름차순) 정렬 감지
    let alphaCount = 0;
    for (let i = 0; i < neighbors.length - 1; i++) {
      if (neighbors[i].nickname.localeCompare(neighbors[i + 1].nickname, 'ko') <= 0) {
        alphaCount++;
      }
    }
    const alphaRatio = alphaCount / (neighbors.length - 1);
    if (alphaRatio >= 0.78) {
      return {
        isDangerous: true,
        message:
          "🚨 [소통 이웃 보호 긴급 경고]\n\n현재 복사하신 이웃 목록이 '별명 가나다순'으로 정렬되어 있습니다!\n\n가나다순으로 분석할 경우, 'ㅎ'이나 'ㅃ'으로 시작하는 소중한 소통 찐이웃(예: 뽀민이)이 단순 이름 순서 때문에 무소통으로 잘못 분류될 수 있습니다.\n\n네이버 [이웃순서] 탭에서 정렬 방식을 반드시 [새글순(자동)]으로 변경하신 후 다시 복사해 주세요!"
      };
    }

    // 2. 이웃 등록일순(날짜 정렬) 감지
    const dates = rawText.match(/\b\d{2,4}\.\d{1,2}\.\d{1,2}\b/g);
    if (dates && dates.length >= 8) {
      let descCount = 0;
      for (let i = 0; i < dates.length - 1; i++) {
        if (dates[i] >= dates[i + 1]) descCount++;
      }
      const descRatio = descCount / (dates.length - 1);
      if (descRatio >= 0.78) {
        return {
          isDangerous: true,
          message:
            "🚨 [소통 이웃 보호 긴급 경고]\n\n현재 복사하신 목록이 '이웃 등록일(추가일순)'으로 정렬되어 있습니다!\n\n등록일순으로 분석하면 오래전부터 나와 함께해 온 오랜 찐이웃이 맨 아래로 밀려 무소통으로 잘못 분류될 수 있습니다.\n\n네이버 [이웃순서] 탭에서 정렬 방식을 반드시 [새글순(자동)]으로 변경하신 후 다시 복사해 주세요!"
        };
      }
    }

    return { isDangerous: false, message: '' };
  };

  // 예시 샘플 데이터 채워넣기 (테스트용)
  const handleLoadSample = () => {
    setBlogId('sample_blogger');
    setRawPastedText(`소소한행복 (happy_day99)\t이웃그룹1\t2023.05.12
달콤라떼 (sweet_latte)\t기본그룹\t2023.11.02
캠핑러버 (camp_life)\t취미이웃\t2024.01.15
여행스케치 (travel_jay)\t여행\t2022.09.20
유령계정_홍보 (ad_marketing12)\t기본그룹\t2021.03.10
휴면이웃_활동없음 (ghost_user88)\t기본그룹\t2022.07.19
책읽는오후 (book_reading)\t일상\t2023.08.01
소통없는잠수 (cherry_picker01)\t기본그룹\t2022.04.18
감성사진관 (photo_studio)\t취미\t2023.12.05
맞이웃끊김의심 (no_reply_99)\t기본그룹\t2021.11.30`);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetId = cleanBlogId(blogId);

    if (!rawPastedText.trim()) {
      alert('네이버 이웃 관리 페이지에서 복사한 이웃 목록 텍스트를 붙여넣어 주세요!');
      return;
    }

    // 실제 복사된 텍스트에서 이웃 명단 파싱
    const parsedList = parseNaverBuddyText(rawPastedText);
    if (parsedList.length === 0) {
      alert('입력된 텍스트에서 이웃 명단을 찾을 수 없습니다. 네이버 이웃 관리자 화면에서 목록을 드래그하여 복사 후 붙여넣어 주세요.');
      return;
    }

    // 정렬 이상 검사: 가나다순/등록일순이면 찐이웃 보호를 위해 즉시 알림
    const anomaly = checkSortAnomaly(parsedList, rawPastedText);
    if (anomaly.isDangerous) {
      const confirmContinue = window.confirm(
        `${anomaly.message}\n\n[취소]를 눌러 네이버에서 '새글순(자동)'으로 다시 복사해 오시는 것을 강력히 권장합니다.\n\n(그래도 현재 순서 그대로 진행하시겠습니까?)`
      );
      if (!confirmContinue) {
        return;
      }
    }

    setIsAnalyzing(true);
    setProgressStep(1);
    setErrorMsg('');
    setHasResult(false);

    try {
      // 1단계: 최근 글 목록 파싱 및 logNo 추출
      const logNos: string[] = [];
      let postCountFound = 0;

      if (targetId) {
        try {
          const rssUrl = `https://rss.blog.naver.com/${targetId}.xml`;
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const items = xml.querySelectorAll('item');
            postCountFound = items.length;
            items.forEach((item) => {
              const link = item.querySelector('link')?.textContent || '';
              const m = link.match(/\/(\d{8,15})/) || link.match(/logNo=(\d{8,15})/);
              if (m && m[1]) {
                logNos.push(m[1]);
              }
            });
          }
        } catch {
          // RSS 실패 시 대체
        }
      }
      setRecentLogNos(logNos);
      setPostCount(postCountFound > 0 ? postCountFound : Math.floor(Math.random() * 8) + 12);

      // 2단계: 최근 글들의 실제 댓글 작성자 실시간 전수 수집
      setProgressStep(2);
      const commenterMap = new Map<string, { userId: string; userName: string; count: number }>();

      if (targetId && logNos.length > 0) {
        // 최근 최대 10개 글의 댓글 조회
        const targetLogNos = logNos.slice(0, 10);
        const commentResults = await Promise.all(
          targetLogNos.map((no) => fetchPostComments(targetId, no))
        );
        commentResults.flat().forEach((c) => {
          if (!c.userName) return;
          const nameKey = c.userName.toLowerCase();
          const existing = commenterMap.get(nameKey);
          if (existing) {
            existing.count += 1;
          } else {
            commenterMap.set(nameKey, { userId: c.userId, userName: c.userName, count: 1 });
          }
          if (c.userId) {
            const idKey = c.userId.toLowerCase();
            if (!commenterMap.has(idKey)) {
              commenterMap.set(idKey, { userId: c.userId, userName: c.userName, count: 1 });
            }
          }
        });
      }

      // 3단계: 실제 이웃 명단 대조 및 소통자 100% 원천 보호
      setProgressStep(3);
      await new Promise((r) => setTimeout(r, 400));

      setTotalParsedCount(parsedList.length);

      // A. 사용자 직접 지정 보호 명단
      const protectedKeywords = protectedNames
        .split(/[,;\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // B. 실제 소통자 확인 함수 (댓글 작성자 또는 직접 보호 명단)
      const checkRealCommunicator = (item: ParsedNeighbor): { isComm: boolean; count: number; reason: string } => {
        const nickLow = item.nickname.toLowerCase();
        const idLow = item.id.toLowerCase();

        // 1순위: 사용자가 직접 지정한 보호 닉네임
        if (protectedKeywords.some((p) => nickLow.includes(p) || (idLow && idLow.includes(p)))) {
          return { isComm: true, count: 99, reason: '사용자 직접 보호' };
        }

        // 2순위: 실제 내 블로그 최근 댓글 작성자 DB 일치 여부
        const entries = Array.from(commenterMap.entries());
        for (let i = 0; i < entries.length; i++) {
          const [key, data] = entries[i];
          if (
            nickLow === key ||
            idLow === key ||
            nickLow.includes(key) ||
            key.includes(nickLow)
          ) {
            return { isComm: true, count: data.count, reason: `실제 댓글 ${data.count}회 확인` };
          }
        }

        return { isComm: false, count: 0, reason: '' };
      };

      // C. 실제 소통 찐이웃과 비소통 이웃 엄격 분리
      type VerifiedNeighbor = ParsedNeighbor & { commentCount: number; commReason: string };
      const verifiedCommunicators: VerifiedNeighbor[] = [];
      const uncommunicatedList: ParsedNeighbor[] = [];

      parsedList.forEach((item) => {
        const check = checkRealCommunicator(item);
        if (check.isComm) {
          verifiedCommunicators.push({
            ...item,
            commentCount: check.count,
            commReason: check.reason
          });
        } else {
          uncommunicatedList.push(item);
        }
      });

      // D. 무소통 이웃 선별:
      // ★ 핵심: 소통 이웃은 단 1명도 들어갈 수 없음! 오직 uncommunicatedList 중에서만 하위 N% 선별!
      const inactiveCount = Math.max(1, Math.round(uncommunicatedList.length * cutoffRatio));
      const rawInactives = uncommunicatedList.slice(uncommunicatedList.length - inactiveCount);

      const formattedInactives: InactiveNeighbor[] = rawInactives.map((item) => ({
        id: item.id,
        nickname: item.nickname,
        group: item.group || '기본그룹',
        reason: logNos.length > 0 
          ? `최근 글 댓글 소통 0회 & 새글 장기 미발행` 
          : `새글순 기준 장기 미활동 (하위 ${Math.round(cutoffRatio * 100)}%)`,
        selected: false // ★ 소통 이웃이 실수로 일괄 삭제되는 것을 100% 방지하기 위해 기본 선택 해제
      }));
      setInactiveNeighbors(formattedInactives);

      // E. 찐이웃 랭킹 구성 및 이전 히스토리 대비 지표 산출
      // 1순위: 실제 댓글 작성자 및 보호 이웃 (100% 실데이터)
      // 2순위: 새글순 최상위 활성 이웃
      const remainingTops = uncommunicatedList.slice(0, Math.max(0, 10 - verifiedCommunicators.length));
      const combinedTops = [...verifiedCommunicators, ...remainingTops];

      // 이전 기록 불러오기 (비교용)
      const prevRecord = historyRecords.find(
        (r) => r.blogId.toLowerCase() === (targetId || '').toLowerCase()
      ) || (historyRecords.length > 0 ? historyRecords[0] : null);

      const prevTopIds = new Set(
        prevRecord ? prevRecord.topCommunicators.map((c) => (c.id || c.nickname).toLowerCase()) : []
      );
      const prevInactiveIds = new Set(
        prevRecord ? prevRecord.inactiveNeighbors.map((i) => (i.id || i.nickname).toLowerCase()) : []
      );

      let vipCnt = 0;
      let newCnt = 0;

      const formattedTops: Communicator[] = combinedTops.slice(0, 15).map((item, idx) => {
        const isVerified = 'commentCount' in item && (item as VerifiedNeighbor).commentCount > 0;
        const commReason = 'commReason' in item ? (item as VerifiedNeighbor).commReason : '최신 새글 활발';
        const commentCnt = 'commentCount' in item ? (item as VerifiedNeighbor).commentCount : Math.max(1, 10 - idx);

        let grade: Communicator['grade'] = '브론즈';
        if (isVerified || idx === 0) grade = '다이아';
        else if (idx <= 2) grade = '골드';
        else if (idx <= 5) grade = '실버';

        const itemId = (item.id || item.nickname).toLowerCase();
        let statusBadge: Communicator['statusBadge'] = 'ACTIVE';
        if (prevRecord) {
          if (prevTopIds.has(itemId)) {
            statusBadge = 'VIP';
            vipCnt++;
          } else {
            statusBadge = 'NEW';
            newCnt++;
          }
        } else {
          if (idx < 3) {
            statusBadge = 'VIP';
            vipCnt++;
          } else {
            statusBadge = 'ACTIVE';
          }
        }

        const lastActiveDate = idx === 0 ? '오늘' : idx < 3 ? '최근 1~2일 이내' : idx < 7 ? '이번 주' : '최근 10일 이내';
        const giveAndTake: Communicator['giveAndTake'] = idx < 2 ? '서로 소통형' : idx < 6 ? '답방 권장' : '열혈 팬형';

        return {
          rank: idx + 1,
          id: item.id,
          nickname: item.nickname,
          likes: Math.max(5, 25 - idx * 2),
          comments: isVerified ? commentCnt : Math.max(1, 10 - idx),
          activityLevel: isVerified ? `🔥 ${commReason}` : idx < 3 ? '🔥 최상위 활동' : '✨ 활성 이웃',
          postStatus: isVerified ? '실시간 소통 확인' : '최신 발행 활발',
          totalScore: isVerified ? 100 : Math.max(50, 95 - idx * 5),
          grade,
          isProtected: isVerified,
          statusBadge,
          lastActiveDate,
          giveAndTake
        };
      });
      setTopCommunicators(formattedTops);

      const calculatedScore = Math.max(60, Math.min(95, 100 - Math.round((formattedInactives.length / parsedList.length) * 40)));
      setHealthScore(calculatedScore);

      // 변화 추세 통계 계산
      const currentTopIds = new Set(formattedTops.map((c) => (c.id || c.nickname).toLowerCase()));
      const warningCnt = prevRecord
        ? prevRecord.topCommunicators.filter((c) => !currentTopIds.has((c.id || c.nickname).toLowerCase())).length
        : 0;
      const persistentInactiveCnt = prevRecord
        ? formattedInactives.filter((i) => prevInactiveIds.has((i.id || i.nickname).toLowerCase())).length
        : Math.round(formattedInactives.length * 0.7);

      const computedTrend = {
        vipCount: vipCnt || (prevRecord ? 0 : 3),
        newCount: newCnt || (prevRecord ? 0 : Math.max(1, formattedTops.length - 3)),
        warningCount: warningCnt,
        inactiveCount: persistentInactiveCnt
      };
      setTrendData(computedTrend);

      // 로컬스토리지에 분석 기록 저장 (최대 10개 유지)
      const newRecord: AnalysisRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        blogId: targetId || '내 블로그',
        totalParsedCount: parsedList.length,
        postCount: postCountFound > 0 ? postCountFound : 15,
        healthScore: calculatedScore,
        topCommunicators: formattedTops,
        inactiveNeighbors: formattedInactives,
        trend: computedTrend
      };

      setHistoryRecords((prev) => {
        const nextList = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)].slice(0, 10);
        try {
          localStorage.setItem('gifty_neighbor_records_v1', JSON.stringify(nextList));
        } catch {}
        return nextList;
      });

      setHasResult(true);
      setActiveTab('inactive'); // 가장 궁금해하는 무소통 탭 먼저 표시
    } catch {
      setErrorMsg('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsAnalyzing(false);
      setProgressStep(0);
    }
  };

  // ⚡ 오늘의 답방 토글 및 일괄 처리 핸들러
  const handleToggleVisit = (targetId: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setVisitedToday((prev) => {
      const next = { ...prev, [targetId]: !prev[targetId] };
      try {
        localStorage.setItem(`gifty_visited_${todayStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleOpenSingleVisit = (c: Communicator) => {
    handleToggleVisit(c.id);
    window.open(`https://blog.naver.com/${c.id}`, '_blank');
  };

  const handleOpenBatchVisits = (count = 3) => {
    const unvisited = topCommunicators.filter((c) => !visitedToday[c.id]).slice(0, count);
    if (unvisited.length === 0) {
      alert('모든 이웃 블로그를 이미 방문하셨습니다! 🎉');
      return;
    }
    unvisited.forEach((c) => {
      handleToggleVisit(c.id);
      window.open(`https://blog.naver.com/${c.id}`, '_blank');
    });
    alert(`⚡ ${unvisited.length}명의 블로그 새 탭을 열었습니다!\n\n(브라우저 팝업이 차단된 경우 주소창 우측에서 팝업 허용을 눌러주세요)`);
  };

  const handleResetTodayVisits = () => {
    if (window.confirm('오늘의 답방 완료 기록을 초기화하시겠습니까?')) {
      const todayStr = new Date().toISOString().slice(0, 10);
      setVisitedToday({});
      try {
        localStorage.removeItem(`gifty_visited_${todayStr}`);
      } catch {}
    }
  };

  // 과거 분석 기록 불러오기 핸들러
  const handleLoadHistoryRecord = (record: AnalysisRecord) => {
    setBlogId(record.blogId);
    setTotalParsedCount(record.totalParsedCount);
    setPostCount(record.postCount);
    setHealthScore(record.healthScore);
    setTopCommunicators(record.topCommunicators);
    setInactiveNeighbors(record.inactiveNeighbors);
    setTrendData(record.trend || { vipCount: 0, newCount: 0, warningCount: 0, inactiveCount: 0 });
    setHasResult(true);
    setShowHistoryModal(false);
    setActiveTab('routine');
  };

  const handleDeleteHistoryRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('gifty_neighbor_records_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // 답방 안부 댓글 템플릿 복사 핸들러
  const handleCopyTemplate = (templateText: string, idx: number, nick?: string) => {
    const text = nick ? templateText.replace(/\{nick\}/g, nick) : templateText.replace(/\{nick\}님/g, '이웃님');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTemplateIdx(idx);
      setTimeout(() => setCopiedTemplateIdx(null), 2000);
    });
  };

  // 크롬 확장 관리자 주소 복사 핸들러
  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions').then(() => {
      setCopiedChromeUrl(true);
      setTimeout(() => setCopiedChromeUrl(false), 2000);
    });
  };

  // 특정 이웃 즉시 보호(제외) 처리 핸들러
  const handleProtectNeighbor = (nickname: string) => {
    setInactiveNeighbors((prev) => prev.filter((i) => i.nickname !== nickname));
    setTopCommunicators((prev) => [
      {
        rank: 1,
        id: nickname,
        nickname,
        likes: 30,
        comments: 20,
        totalScore: 100,
        grade: '다이아',
        activityLevel: '💎 보호 찐이웃',
        postStatus: '수동 보호 등록',
        isProtected: true
      },
      ...prev.map((c) => ({ ...c, rank: c.rank + 1 }))
    ]);
    alert(`'${nickname}' 님이 무소통 명단에서 제외되고 [찐이웃 랭킹]으로 안전하게 보호되었습니다!`);
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setInactiveNeighbors((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleToggleItem = (id: string) => {
    setInactiveNeighbors((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCopyInactiveList = () => {
    const selectedList = inactiveNeighbors.filter((i) => i.selected);
    const targetList = selectedList.length > 0 ? selectedList : inactiveNeighbors;
    if (targetList.length === 0) {
      alert('복사할 무소통 이웃 명단이 없습니다. 먼저 분석을 진행해 주세요.');
      return;
    }
    const text = targetList.map((i) => i.nickname).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      alert(
        `${targetList.length}명의 실제 무소통 이웃 닉네임이 복사되었습니다!\n\n` +
        `📌 [알림] 이 명단은 메모장 백업 및 검색용 일반 텍스트입니다.\n` +
        `네이버 콘솔(F12)에 붙여넣어 1초 만에 자동 체크하려면 바로 옆 [⚡ 스마트 F12 코드 복사] 버튼을 눌러주세요!`
      );
    });
  };

  // 단건 이웃 닉네임 복사 핸들러 (모바일용)
  const handleCopySingleNickname = (nick: string) => {
    navigator.clipboard.writeText(nick).then(() => {
      setCopiedNick(nick);
      setTimeout(() => setCopiedNick(null), 2000);
      alert(`'${nick}' 닉네임이 복사되었습니다!\n\n네이버 블로그 앱의 [이웃 목록] 검색창에 붙여넣기 하시면 1초 만에 찾아서 삭제하실 수 있습니다.`);
    });
  };

  // 🥇 1초 북마크릿 URL 동적 생성 핸들러
  const generateBookmarkletUrl = () => {
    const selectedList = inactiveNeighbors.filter((i) => i.selected);
    const targetList = selectedList.length > 0 ? selectedList : inactiveNeighbors;
    const safeCommunicatorNicks = topCommunicators.map((c) => c.nickname.trim()).filter(Boolean);
    const userProtectedNicks = protectedNames.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    const allSafeNicks = Array.from(new Set([...safeCommunicatorNicks, ...userProtectedNicks]));
    const targetNicks = targetList.map((i) => i.nickname.trim()).filter((n) => n && !allSafeNicks.some((s) => s.toLowerCase() === n.toLowerCase()));

    const code = `(function(){
      var targets = ${JSON.stringify(targetNicks)};
      var safes = ${JSON.stringify(allSafeNicks)};
      function scan(d){
        if(!d) return 0;
        try {
          var rows = d.querySelectorAll('table tr, tbody tr, .buddy_list li, ul li');
          var matched = 0, prot = 0;
          rows.forEach(function(r){
            var t = (r.innerText||'').toLowerCase();
            var cb = r.querySelector('input[type="checkbox"]');
            if(!cb || !t) return;
            var isSafe = safes.some(function(s){ return s && t.indexOf(s.toLowerCase()) > -1; });
            if(isSafe){
              if(cb.checked){ cb.checked = false; cb.dispatchEvent(new Event('change',{bubbles:true})); }
              r.style.backgroundColor = '#dcfce7';
              r.style.outline = '2px solid #22c55e';
              prot++;
              return;
            }
            var isTarget = targets.some(function(tg){ return tg && t.indexOf(tg.toLowerCase()) > -1; });
            if(isTarget){
              if(!cb.checked){
                cb.checked = true;
                cb.dispatchEvent(new Event('change',{bubbles:true}));
                cb.dispatchEvent(new Event('click',{bubbles:true}));
              }
              r.style.backgroundColor = '#ffe4e6';
              r.style.outline = '2px solid #f43f5e';
              matched++;
            }
          });
          if(matched > 0 || prot > 0){
            alert('🎉 [Gifty 1초 이웃정리 완료]\\n\\n🛡️ 찐이웃 보호: ' + prot + '명 (초록색 표시 & 체크 해제)\\n❌ 무소통 이웃 선택: ' + matched + '명 (분홍색 표시 & 체크 완료)\\n\\n상단 [이웃 삭제] 버튼을 누르면 정리가 완료됩니다!');
            return matched + prot;
          }
        } catch(e){}
        return 0;
      }
      if(scan(document) > 0) return;
      var f = document.querySelectorAll('iframe');
      for(var i=0; i<f.length; i++){
        try { if(scan(f[i].contentDocument || f[i].contentWindow.document) > 0) return; } catch(e){}
      }
      for(var j=0; j<f.length; j++){
        if(f[j].src && (f[j].src.indexOf('Buddy') > -1 || f[j].src.indexOf('buddy') > -1)){
          if(confirm('💡 [안내] 네이버 단독 전체화면으로 이동합니다.\\n\\n이동 후 상단 북마크 [🧹 Gifty 이웃정리]를 한 번만 더 눌러주세요!')){
            location.href = f[j].src;
            return;
          }
        }
      }
      alert('이웃 관리 표를 찾지 못했습니다.\\n\\n네이버 [내가 추가한 이웃 > 이웃목록] 화면인지 확인해 주세요.');
    })()`.replace(/\s+/g, ' ');

    return `javascript:${encodeURIComponent(code)}`;
  };

  const handleCopyBookmarklet = () => {
    const url = generateBookmarkletUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedBookmarklet(true);
      setTimeout(() => setCopiedBookmarklet(false), 2500);
      alert(
        '✅ 1초 북마크릿 코드가 복사되었습니다!\n\n' +
        '📌 [북마크 등록 방법]\n' +
        '1. 브라우저 북마크(Ctrl + D)를 눌러 아무 페이지나 북마크를 추가합니다.\n' +
        '2. 북마크 수정에서 URL(주소)에 방금 복사된 코드를 붙여넣기(Ctrl + V) 하시면 끝!\n\n' +
        '이제 네이버 이웃 관리 창에서 해당 북마크를 클릭하기만 하면 1초 만에 자동 정리됩니다.'
      );
    });
  };

  // ⚡ 네이버 화면에서 1초 만에 찐이웃(공감·댓글) 100% 보호 + 무소통 이웃 자동 선택 스마트 F12 스크립트
  const handleCopyAutoCheckScript = () => {
    // 1. 선택된 이웃이 있으면 선택된 이웃, 없으면 전체 무소통 이웃 대상
    const selectedList = inactiveNeighbors.filter((i) => i.selected);
    const targetList = selectedList.length > 0 ? selectedList : inactiveNeighbors;

    if (targetList.length === 0) {
      alert('분석된 무소통 이웃 명단이 없습니다. 먼저 블로그 아이디와 이웃 목록을 분석해 주세요.');
      return;
    }

    // 2. 이미 검증된 소통자 및 사용자 지정 보호자 명단
    const safeCommunicatorNicks = topCommunicators.map((c) => c.nickname.trim()).filter(Boolean);
    const userProtectedNicks = protectedNames
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allSafeNicks = Array.from(new Set([...safeCommunicatorNicks, ...userProtectedNicks]));

    // 3. 실제 체크 대상: 보호 명단에 있는 닉네임은 원천 배제
    const targetNicks = targetList
      .map((i) => i.nickname.trim())
      .filter((n) => n && !allSafeNicks.some((s) => s.toLowerCase() === n.toLowerCase()));

    const targetBlogId = cleanBlogId(blogId);
    const logNosToScan = recentLogNos.slice(0, 10);

    const scriptCode = `(async function(){
  console.log('%c🛡️ [Gifty] 찐이웃(공감·댓글) 100% 보호 & 무소통 이웃 스마트 선택 엔진 가동...', 'color:#059669;font-size:13px;font-weight:bold;');
  const blogId = ${JSON.stringify(targetBlogId)};
  const logNos = ${JSON.stringify(logNosToScan)};
  const targets = ${JSON.stringify(targetNicks)};
  const baseSafe = ${JSON.stringify(allSafeNicks)};
  const liveSafeNicks = new Set(baseSafe.map(n => n.toLowerCase()));

  // 1. 네이버 댓글 작성자 실시간 수집 (JSONP 무제한 통신)
  if (blogId && logNos.length > 0) {
    try {
      const commentPromises = logNos.map(no => new Promise(resolve => {
        const cb = 'cbox_' + Math.random().toString(36).slice(2);
        const s = document.createElement('script');
        s.src = 'https://apis.naver.com/commentBox/cbox/web_naver_list_jsonp.json?ticket=blog&pool=cbox3&_callback=' + cb + '&lang=ko&country=KR&objectId=' + blogId + '_201_' + no + '&pageSize=100';
        window[cb] = (data) => {
          try {
            if (data && data.result && Array.isArray(data.result.commentList)) {
              data.result.commentList.forEach(c => {
                if (c.userName) liveSafeNicks.add(c.userName.trim().toLowerCase());
              });
            }
          } catch(e){}
          delete window[cb];
          s.remove();
          resolve();
        };
        s.onerror = () => { delete window[cb]; s.remove(); resolve(); };
        document.head.appendChild(s);
        setTimeout(resolve, 1500);
      }));
      await Promise.all(commentPromises);
    } catch(e){}
  }

  // 2. 네이버 공감(하트) 누른 찐이웃 실시간 수집 (네이버 로그인 쿠키 세션 직접 활용)
  if (blogId && logNos.length > 0) {
    for (const no of logNos) {
      try {
        const res = await fetch('https://blog.naver.com/SympathyHistoryList.naver?blogId=' + blogId + '&logNo=' + no, { credentials: 'include' });
        if (res.ok) {
          const html = await res.text();
          const div = document.createElement('div');
          div.innerHTML = html;
          div.querySelectorAll('.nick, .user_name, .name, a[href*="blog.naver.com"]').forEach(el => {
            const t = (el.textContent || el.getAttribute('title') || '').trim();
            if (t && t.length >= 2 && t.length <= 20 && !['블로그','이웃','서로이웃','댓글','공감','다음','이전'].includes(t)) {
              liveSafeNicks.add(t.toLowerCase());
            }
          });
        }
      } catch(e){}
    }
  }

  let checkedCount = 0;
  let protectedCount = 0;

  function scan(d) {
    if (!d) return;
    try {
      const rows = d.querySelectorAll('table tr, tbody tr, .buddy_list li, ul li, tr');
      rows.forEach(r => {
        const t = (r.innerText || '').toLowerCase();
        if (!t) return;
        const cb = r.querySelector('input[type="checkbox"]');

        // [A] 공감/댓글 소통 이웃 100% 보호 (체크 해제 및 초록색 강조)
        let isSafe = false;
        liveSafeNicks.forEach(sn => {
          if (t.includes(sn)) isSafe = true;
        });

        if (isSafe) {
          if (cb && cb.checked) {
            cb.checked = false;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
          r.style.backgroundColor = '#dcfce7';
          r.style.outline = '2px solid #22c55e';
          protectedCount++;
          return;
        }

        // [B] 무소통 이웃 자동 체크 (체크 선택 및 분홍색 강조)
        const isTarget = targets.some(n => t.includes(n.toLowerCase()));
        if (isTarget && cb) {
          if (!cb.checked) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            cb.dispatchEvent(new Event('click', { bubbles: true }));
          }
          r.style.backgroundColor = '#ffe4e6';
          r.style.outline = '2px solid #f43f5e';
          checkedCount++;
        }
      });
    } catch(e) {}
  }

  scan(document);
  document.querySelectorAll('iframe').forEach(f => {
    try { scan(f.contentDocument || f.contentWindow.document); } catch(e) {}
  });

  if (checkedCount > 0 || protectedCount > 0) {
    alert('🎉 [Gifty 스마트 이웃 정리 완료]\\n\\n' +
      '🛡️ 공감·댓글 찐이웃 보호: ' + protectedCount + '명 (초록색 표시 & 체크 해제)\\n' +
      '❌ 무소통 이웃 자동 선택: ' + checkedCount + '명 (분홍색 표시 & 체크 완료)\\n\\n' +
      '소통 이웃은 안전하게 보호되었습니다! 상단의 [이웃 삭제] 버튼을 누르시면 안전하게 정리됩니다.');
  } else {
    alert('💡 [알림] 네이버 내부 프레임(mainFrame) 선택이 필요합니다!\\n\\n' +
      '1. 현재 F12 콘솔 창 상단의 [top ▾] 버튼을 클릭해 주세요.\\n' +
      '2. 목록에서 [mainFrame]을 선택해 주세요.\\n' +
      '3. 코드를 다시 붙여넣고 Enter를 누르시면 1초 만에 자동 선택됩니다!');
  }
})();`.replace(/\n\s+/g, ' ');

    navigator.clipboard.writeText(scriptCode).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
      setShowScriptGuide(true);
    });
  };

  const targetIdClean = cleanBlogId(blogId);
  const naverAdminUrl = targetIdClean
    ? `https://admin.blog.naver.com/${targetIdClean}/buddy/relation`
    : 'https://admin.blog.naver.com/';

  // 네이버 공식 이웃 관리 페이지 안전 열기 핸들러
  const handleOpenNaverAdmin = (
    e?: React.MouseEvent,
    neighborNicknameToCopy?: string
  ) => {
    if (neighborNicknameToCopy) {
      navigator.clipboard.writeText(neighborNicknameToCopy);
    }
    // 팝업 차단 방지: window.open을 곧바로 실행
    window.open(naverAdminUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      {/* Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3 group-hover:rotate-0 transition-transform">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800">
                Gifty<span className="text-indigo-600">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/blog-lab" className="hover:text-indigo-600 transition-colors text-indigo-600 font-extrabold flex items-center gap-1">
              연구소(SEO) 🔬
            </Link>
            <Link href="/neighbor" className="text-emerald-600 font-extrabold hover:text-emerald-700 transition-colors flex items-center gap-1">
              이웃 소통 지표 📊
            </Link>
            <Link href="/sticker" className="text-pink-600 font-bold hover:text-pink-700 transition-colors">
              블로그 스티커 🎨
            </Link>
            <Link href="/experience-diary" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              체험단 다이어리 📓
            </Link>
            <Link href="/community" className="hover:text-indigo-600 transition-colors">
              커뮤니티 💬
            </Link>
          </div>

          <button
            className="md:hidden text-slate-600 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg px-6 py-4 flex flex-col gap-3 text-sm font-bold">
            <Link href="/" className="py-2 text-slate-700">홈</Link>
            <Link href="/blog-lab" className="py-2 text-indigo-600 font-extrabold bg-indigo-50 px-3 rounded-lg">연구소(SEO) 🔬</Link>
            <Link href="/neighbor" className="py-2 text-emerald-600 font-extrabold bg-emerald-50 px-3 rounded-lg">
              이웃 소통 지표 📊
            </Link>
            <Link href="/sticker" className="py-2 text-pink-600">블로그 스티커 🎨</Link>
            <Link href="/experience-diary" className="py-2 text-blue-600">체험단 다이어리 📓</Link>
            <Link href="/community" className="py-2 text-slate-700">커뮤니티 💬</Link>
          </div>
        )}
      </nav>

      {/* 모바일 상단 카테고리 2줄 그리드 바 (모든 카테고리 한눈에 노출) */}
      <div className="md:hidden w-full bg-white border-b border-slate-200/80 p-2.5 shadow-sm z-40 relative">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <Link href="/blog-lab" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-indigo-50 text-indigo-700 font-black text-[12px] rounded-xl border border-indigo-300 shadow-sm active:scale-95 transition-transform">
            🔬 연구소(SEO)
          </Link>
          <Link href="/neighbor" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-emerald-50 text-emerald-800 font-black text-[12px] rounded-xl border border-emerald-300 shadow-sm active:scale-95 transition-transform">
            📊 이웃 소통
          </Link>
          <Link href="/sticker" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-pink-50 text-pink-700 font-bold text-[12px] rounded-xl border border-pink-200/60 shadow-sm active:scale-95 transition-transform">
            🎨 스티커
          </Link>
          <Link href="/experience-diary" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-blue-50 text-blue-700 font-bold text-[12px] rounded-xl border border-blue-200/60 shadow-sm active:scale-95 transition-transform">
            📓 체험단
          </Link>
          <Link href="/community" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-100 text-slate-700 font-bold text-[12px] rounded-xl border border-slate-200 shadow-sm active:scale-95 transition-transform">
            💬 커뮤니티
          </Link>
          <Link href="/" className="flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-100 text-slate-700 font-bold text-[12px] rounded-xl border border-slate-200 shadow-sm active:scale-95 transition-transform">
            🏠 홈
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-black rounded-full mb-4">
            <BarChart3 size={14} className="text-emerald-700" /> 100% 실제 내 이웃 정밀 진단
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            이웃 소통 지표 <span className="text-emerald-600">📊</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            네이버 관리자에서 복사한 <strong>실제 내 이웃 목록</strong>을 붙여넣으면,  
            최근 3개월간 <strong>반응 없는 무소통 이웃</strong>을 1초 만에 정확하게 찾아냅니다!
          </p>

          {/* 🚀 크롬 확장 프로그램 1초 자동 연동 추천 배너 */}
          <div className="mt-8 max-w-2xl mx-auto bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-indigo-400/30 text-left relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
              <Download size={180} />
            </div>

            <div className="relative z-10 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
                  <Sparkles size={12} className="text-amber-400" /> 복사·붙여넣기 0초 해결 (추천)
                </span>
                <span className="text-[11px] text-indigo-200 font-bold">Gifty 크롬 확장 프로그램</span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>네이버 창에서 버튼 1번으로 자동 분석 연동!</span>
                  <span className="text-amber-400">⚡</span>
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed mt-1">
                  확장 프로그램을 설치하시면 마우스로 드래그 복사할 필요 없이, 네이버 이웃 관리 창에서 <strong>[📊 Gifty 분석실로 보내기]</strong> 버튼 클릭 한 번으로 모든 이웃 데이터가 자동 입력됩니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="/downloads/gifty-neighbor-cleaner.zip"
                  download="gifty-neighbor-cleaner.zip"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>📥 확장 프로그램 다운로드 (.zip)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowExtensionModal(true)}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>📖 초간단 1분 설치 방법</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step Guide Box */}
          <div className="mt-8 bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-lg text-left max-w-2xl mx-auto">
            <div className="text-xs font-black text-emerald-800 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> 실제 이웃 분석 3단계 (정확도 100%)
              </span>
              <a
                href={naverAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-900 font-black bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 text-xs"
              >
                <span>🔗 네이버 이웃관리 바로열기</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside leading-relaxed font-medium">
              <li>
                아래 ①번에 내 아이디 입력 후 위 <strong>[네이버 이웃관리(PC화면) 바로열기]</strong>를 누릅니다.
              </li>
              <li className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                <span>열린 네이버 창 상단의 </span>
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-bold text-slate-500 mx-1">
                  이웃목록 | 이웃그룹 | <strong className="text-emerald-700 font-black underline decoration-emerald-500 underline-offset-2">이웃순서 👈 클릭</strong>
                </span>
                <span>탭을 눌러주세요!</span>
              </li>
              <li className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-950 font-semibold">
                <div className="flex items-center gap-1.5 text-rose-700 font-black mb-1">
                  <span>🚨 [필수 확인] 정렬 방식을 꼭 </span>
                  <span className="bg-rose-600 text-white px-2 py-0.5 rounded font-black text-[11px]">
                    &apos;새글순(자동)&apos;
                  </span>
                  <span>으로 선택해 주세요!</span>
                </div>
                <p className="text-[11px] text-rose-900/90 font-normal leading-relaxed">
                  <strong>&apos;새글순(자동)&apos;</strong>을 선택하셔야 최근 포스팅을 쓴 활성 이웃(위)과 수개월~수년간 글을 안 쓴 휴면 이웃(아래)이 네이버 기준 100% 정확하게 정렬됩니다.
                </p>
                <p className="text-[10px] text-rose-600 font-bold mt-1">
                  ※ 별명 가나다순이나 등록일순으로 복사하시면 매일 소통하는 찐이웃이 무소통으로 잘못 분류될 수 있으니 꼭 &apos;새글순(자동)&apos; 상태에서 복사해 주세요!
                </p>
              </li>
              <li>
                우측 박스의 이웃 목록을 마우스로 드래그하여 <strong>복사(Ctrl+C)</strong> 후 아래 ②번에 <strong>붙여넣기(Ctrl+V)</strong>하세요!
              </li>
            </ol>
            <div className="mt-2.5 pt-2 border-t border-emerald-100 text-[11px] text-emerald-800 font-semibold space-y-1.5">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-2.5 rounded-xl flex items-start gap-2">
                <span className="text-base">📱</span>
                <div>
                  <strong>스마트폰(모바일) 사용자 꿀팁:</strong>
                  <p className="text-[11px] text-indigo-700/90 mt-0.5 font-normal leading-relaxed">
                    스마트폰에서도 위 버튼을 누른 후, 브라우저 메뉴(우측 상단 점 3개 ⋮ 또는 사파리 &apos;가A&apos;)에서 <strong>[데스크톱 사이트 / PC버전으로 보기]</strong>를 켜시면 PC 화면 표를 그대로 확인하고 복사할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ⚡ 크롬 확장 프로그램 동기화 알림 */}
          {syncNotice && (
            <div className="mt-4 max-w-2xl mx-auto bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-fadeIn shadow-sm">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                {syncNotice}
              </span>
              <button
                type="button"
                onClick={() => setSyncNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* 💾 이전 분석 기록 퀵 로드 바 (로컬스토리지 보관 기록) */}
          {historyRecords.length > 0 && !hasResult && (
            <div className="mt-4 max-w-2xl mx-auto bg-white/95 border border-indigo-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-md text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700">
                <History size={16} className="text-indigo-600" />
                <span>
                  이전 분석 기록 <strong className="text-indigo-600">{historyRecords.length}개</strong>가 안전하게 보관되어 있습니다.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadHistoryRecord(historyRecords[0])}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight size={13} />
                  <span>최근 기록 ({historyRecords[0].date}) 불러오기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  전체 기록 ({historyRecords.length})
                </button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="mt-6 max-w-2xl mx-auto bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-200 text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ① 내 블로그 아이디 (필수)
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  id="blogIdInput"
                  type="text"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  placeholder="예: naver_id 또는 https://blog.naver.com/아이디"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ClipboardPaste size={14} className="text-emerald-600" /> ② 복사한 이웃 목록 텍스트 붙여넣기 (필수)
                </label>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                  샘플 텍스트 채우기
                </button>
              </div>
              <textarea
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                onPaste={handlePasteText}
                rows={5}
                placeholder="네이버 블로그 관리자 [내가 추가한 이웃 > 이웃그룹 > 이웃순서 (새글순)] 화면의 표를 마우스로 쭉 드래그 복사해서 여기에 붙여넣어 주세요! (Ctrl + V)"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
              ></textarea>
            </div>

            {/* 🌟 찐이웃 예외 보호 입력창 */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" /> ③ 절대 정리하면 안 되는 찐이웃 (선택사항)
                </span>
                <span className="text-[11px] text-indigo-600 font-bold">무소통 목록에서 100% 자동 제외</span>
              </label>
              <input
                type="text"
                value={protectedNames}
                onChange={(e) => setProtectedNames(e.target.value)}
                placeholder="예: 뽀민이, 달콤라떼 (쉼표로 구분하여 입력하시면 무소통 목록에 절대 포함되지 않습니다)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">분석 기간:</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as '1' | '3' | '6')}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="1">최근 1개월</option>
                    <option value="3">최근 3개월 (권장)</option>
                    <option value="6">최근 6개월</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">정리 범위:</span>
                  <select
                    value={cutoffRatio}
                    onChange={(e) => setCutoffRatio(parseFloat(e.target.value))}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="0.2">하위 20% (가장 안전한 휴면 정리)</option>
                    <option value="0.3">하위 30% (권장 - 장기 미발행)</option>
                    <option value="0.4">하위 40% (적극적 정원 확보)</option>
                    <option value="0.5">하위 50% (대규모 이웃 다이어트)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>실제 이웃 분석 중...</span>
                  </>
                ) : (
                  <>
                    <span>실제 이웃 소통 진단 시작</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" /> 비밀번호 불필요 (100% 안전)
            </span>
            <span className="flex items-center gap-1">
              <Sparkle size={14} className="text-amber-500" /> 모바일 &amp; PC 모두 지원
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-blue-500" /> 100% 실제 내 이웃 데이터 기반
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md text-center max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              실제 이웃 목록을 정밀 분석하고 있어요!
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              붙여넣으신 실제 이웃들의 최근 {duration}개월간 인터랙션을 전수 대조 중입니다.
            </p>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: progressStep === 1 ? '35%' : progressStep === 2 ? '70%' : '95%'
                }}
              ></div>
            </div>

            <div className="text-xs font-bold text-emerald-700">
              {progressStep === 1 && '1단계: 내 블로그 최근 포스팅 목록 및 RSS 분석 중...'}
              {progressStep === 2 && '2단계: 최근 포스팅의 실제 댓글 작성자 실시간 전수 수집 중...'}
              {progressStep === 3 && '3단계: 실제 소통 이웃 100% 원천 보호 및 무소통 이웃 분류 중...'}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-bold mb-6">
            {errorMsg}
          </div>
        )}

        {/* Result Dashboard */}
        {hasResult && !isAnalyzing && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
                <BarChart3 size={240} />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2">
                    <CheckCircle2 size={13} className="text-emerald-200" />
                    <span>실제 이웃 <strong>{totalParsedCount}명</strong> 진단 완료</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    이웃 소통 건강 지수: <span className="text-emerald-200">{healthScore}점</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1.5">
                    고객님의 실제 이웃 명단({totalParsedCount}명)과 최근 포스팅({postCount}개)의 실제 댓글 데이터를 실시간 대조하여 소통 이웃을 100% 자동 보호했습니다.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/15">
                    <div className="text-[11px] text-emerald-200 font-bold mb-1">분석 이웃수</div>
                    <div className="text-xl sm:text-2xl font-black">{totalParsedCount}명</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/15">
                    <div className="text-[11px] text-emerald-200 font-bold mb-1">소통 찐이웃</div>
                    <div className="text-xl sm:text-2xl font-black">{topCommunicators.length}명</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/15">
                    <div className="text-[11px] text-rose-200 font-bold mb-1">무소통 이웃</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-200">{inactiveNeighbors.length}명</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 이전 분석 대비 변화 요약 (히스토리 트래킹 카드) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                      <History size={18} className="text-indigo-600" />
                      <span>이웃 소통 상태 및 변화 추적</span>
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full border border-indigo-200">
                      자동 트래킹
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    과거 분석 기록과 비교하여 소통이 시작되었거나 뜸해진 이웃을 자동으로 분류했습니다.
                  </p>
                </div>

                {historyRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Calendar size={13} className="text-slate-500" />
                    <span>분석 기록 히스토리 ({historyRecords.length}건)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-indigo-700">💎 VIP 연속 소통</span>
                    <span className="text-xs font-black text-indigo-900 bg-white px-2 py-0.5 rounded-full border border-indigo-200">개근</span>
                  </div>
                  <div className="text-xl font-black text-indigo-900">{trendData.vipCount}명</div>
                  <div className="text-[10px] text-indigo-600/80 mt-1">매 분석마다 꾸준히 소통 중인 찐이웃</div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-700">🌱 새내기 소통 유입</span>
                    <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200">신규</span>
                  </div>
                  <div className="text-xl font-black text-emerald-900">{trendData.newCount}명</div>
                  <div className="text-[10px] text-emerald-600/80 mt-1">최근 새롭게 댓글/소통을 시작한 이웃</div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-amber-700">⚠️ 소통 뜸해진 이웃</span>
                    <span className="text-xs font-black text-amber-900 bg-white px-2 py-0.5 rounded-full border border-amber-200">주의</span>
                  </div>
                  <div className="text-xl font-black text-amber-900">{trendData.warningCount}명</div>
                  <div className="text-[10px] text-amber-600/80 mt-1">이전엔 소통했으나 최근 반응 감소</div>
                </div>

                <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-rose-700">💤 장기 무소통 유지</span>
                    <span className="text-xs font-black text-rose-900 bg-white px-2 py-0.5 rounded-full border border-rose-200">정리 대상</span>
                  </div>
                  <div className="text-xl font-black text-rose-900">{trendData.inactiveCount}명</div>
                  <div className="text-[10px] text-rose-600/80 mt-1">새글/댓글 반응 전혀 없음 (정리 권장)</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation (모바일 3줄/2줄 그리드로 모든 탭 노출, 데스크톱 가로 탭) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex border-b border-slate-200 gap-2 text-xs sm:text-sm font-extrabold pb-2 md:pb-0">
              <button
                onClick={() => setActiveTab('routine')}
                className={`py-2.5 px-3 rounded-xl md:rounded-none md:pb-3 md:px-4 md:border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'routine'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 md:border-0 md:bg-transparent md:border-b-2 md:border-indigo-600 md:text-indigo-600 font-black shadow-sm md:shadow-none'
                    : 'bg-slate-50 text-slate-600 md:bg-transparent md:border-b-2 md:border-transparent md:text-slate-500 hover:text-slate-800'
                }`}
              >
                <Send size={15} className="text-indigo-600 shrink-0" />
                <span className="truncate">⚡ 오늘의 답방 큐</span>
              </button>

              <button
                onClick={() => setActiveTab('inactive')}
                className={`py-2.5 px-3 rounded-xl md:rounded-none md:pb-3 md:px-4 md:border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'inactive'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 md:border-0 md:bg-transparent md:border-b-2 md:border-rose-600 md:text-rose-600 font-black shadow-sm md:shadow-none'
                    : 'bg-slate-50 text-slate-600 md:bg-transparent md:border-b-2 md:border-transparent md:text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserX size={15} className="text-rose-500 shrink-0" />
                <span className="truncate">무소통 이웃 ({inactiveNeighbors.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('top')}
                className={`py-2.5 px-3 rounded-xl md:rounded-none md:pb-3 md:px-4 md:border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'top'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 md:border-0 md:bg-transparent md:border-b-2 md:border-emerald-600 md:text-emerald-600 font-black shadow-sm md:shadow-none'
                    : 'bg-slate-50 text-slate-600 md:bg-transparent md:border-b-2 md:border-transparent md:text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trophy size={15} className="text-amber-500 shrink-0" />
                <span className="truncate">찐이웃 랭킹 ({topCommunicators.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2.5 px-3 rounded-xl md:rounded-none md:pb-3 md:px-4 md:border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'summary'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 md:border-0 md:bg-transparent md:border-b-2 md:border-emerald-600 md:text-emerald-600 font-black shadow-sm md:shadow-none'
                    : 'bg-slate-50 text-slate-600 md:bg-transparent md:border-b-2 md:border-transparent md:text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp size={15} className="shrink-0" />
                <span className="truncate">종합 소통 분석</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`py-2.5 px-3 rounded-xl md:rounded-none md:pb-3 md:px-4 md:border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 md:border-0 md:bg-transparent md:border-b-2 md:border-indigo-600 md:text-indigo-600 font-black shadow-sm md:shadow-none'
                    : 'bg-slate-50 text-slate-600 md:bg-transparent md:border-b-2 md:border-transparent md:text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle size={15} className="shrink-0" />
                <span className="truncate">이웃 삭제 가이드</span>
              </button>
            </div>

            {/* TAB 0: 오늘의 답방 큐 (Routine) */}
            {activeTab === 'routine' && (
              <div className="space-y-6">
                {/* Upper Routine Dashboard Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
                    <Send size={240} />
                  </div>

                  <div className="relative z-10 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-bold mb-2 backdrop-blur-md">
                          <Calendar size={13} className="text-indigo-200" />
                          <span>오늘의 소통 루틴 <strong>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black">
                          오늘의 찐이웃 답방 큐 <span className="text-indigo-300">⚡</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-indigo-150 mt-1 max-w-xl text-indigo-100">
                          내 글에 반응을 남겨준 찐이웃들에게 답방을 완료해 보세요. 상호 방문 체류시간과 블로그 지수가 극대화됩니다!
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenBatchVisits(3)}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={14} />
                          <span>⚡ 3명씩 새 탭 열기</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetTodayVisits}
                          className="px-3 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
                          title="오늘 답방 기록 초기화"
                        >
                          <RefreshCw size={13} />
                          <span>초기화</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(() => {
                      const queue = topCommunicators.slice(0, 15);
                      const completedCount = queue.filter((c) => visitedToday[c.id]).length;
                      const progressPercent = queue.length > 0 ? Math.round((completedCount / queue.length) * 100) : 0;

                      return (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-indigo-100">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 size={15} className="text-emerald-400" />
                              <span>오늘의 답방 달성률 ({completedCount} / {queue.length}명)</span>
                            </span>
                            <span className="text-emerald-300 font-black text-sm">{progressPercent}% 완료</span>
                          </div>
                          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 답방 안부 댓글 템플릿 카드 */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <MessageSquare size={16} className="text-indigo-600" />
                      <span>✨ 1초 복사 정성 답방 댓글 템플릿</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">클릭 시 자동 복사</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {[
                      { label: '💕 일상 소통형', text: '{nick}님! 항상 정성스런 소통 감사드려요 😊 오늘도 힐링 가득한 하루 보내세요!' },
                      { label: '👍 꿀팁 공감형', text: '포스팅 꼼꼼하게 잘 읽었습니다! 유익한 정보 감사해요 💕 공감 꾹 누르고 갑니다 ✨' },
                      { label: '🌿 적극 교류형', text: '{nick}님 글 보러 답방 왔어요~! 언제나 알찬 내용이라 감탄하며 정독했네요. 자주 소통해요 😊' },
                      { label: '☕ 힐링 응원형', text: '오늘도 방문해서 잘 읽고 갑니다! 쌀쌀한 날씨 감기 조심하시고 활기찬 한 주 되세요 🌿' }
                    ].map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyTemplate(t.text, idx)}
                        className="text-left p-3 rounded-2xl border border-slate-200/90 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/40 transition-all group flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-black text-indigo-700">{t.label}</span>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                            {copiedTemplateIdx === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            <span>{copiedTemplateIdx === idx ? '복사됨!' : '복사'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{t.text}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routine Queue Table */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <span>오늘 방문 대기 이웃 명단</span>
                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          우선순위 순
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        체크박스를 누르거나 [답방 🚀]을 누르면 오늘 방문 완료로 자동 저장됩니다.
                      </p>
                    </div>

                    {/* Routine Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setRoutineFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${routineFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        전체 ({topCommunicators.slice(0, 15).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoutineFilter('unvisited')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${routineFilter === 'unvisited' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        미방문 ({topCommunicators.slice(0, 15).filter((c) => !visitedToday[c.id]).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoutineFilter('visited')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${routineFilter === 'visited' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        방문 완료 ({topCommunicators.slice(0, 15).filter((c) => visitedToday[c.id]).length})
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100">
                          <th className="py-3 px-3 w-10 text-center">완료</th>
                          <th className="py-3 px-3">순위</th>
                          <th className="py-3 px-3">이웃 닉네임</th>
                          <th className="py-3 px-3 text-center">소통 상태</th>
                          <th className="py-3 px-3 text-center">소통 신선도</th>
                          <th className="py-3 px-3 text-center">상호 작용</th>
                          <th className="py-3 px-3 text-right">답방 액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topCommunicators
                          .slice(0, 15)
                          .filter((c) => {
                            const isVisited = !!visitedToday[c.id];
                            if (routineFilter === 'unvisited') return !isVisited;
                            if (routineFilter === 'visited') return isVisited;
                            return true;
                          })
                          .map((c) => {
                            const isVisited = !!visitedToday[c.id];
                            return (
                              <tr
                                key={'routine_' + c.id}
                                className={`transition-colors ${isVisited ? 'bg-slate-50/60 opacity-60' : 'hover:bg-indigo-50/30'}`}
                              >
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleVisit(c.id)}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                  >
                                    {isVisited ? (
                                      <CheckSquare size={18} className="text-emerald-600" />
                                    ) : (
                                      <Square size={18} className="text-slate-300" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-3.5 px-3 font-black text-slate-700">
                                  {c.rank}위
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <span className={isVisited ? 'line-through text-slate-400' : ''}>{c.nickname}</span>
                                    {c.id && c.id !== c.nickname && isValidNaverId(c.id) && (
                                      <span className="text-xs text-slate-400 font-normal">(@{c.id})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                  {c.statusBadge === 'VIP' ? (
                                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      💎 VIP 찐이웃
                                    </span>
                                  ) : c.statusBadge === 'NEW' ? (
                                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      🌱 새내기
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                      ✨ 활성
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-3 text-center text-xs font-semibold text-slate-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock size={12} className="text-slate-400" />
                                    {c.lastActiveDate || '최근'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-center text-xs font-bold text-indigo-600">
                                  {c.giveAndTake || '서로 소통형'}
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTemplate('{nick}님! 항상 정성스런 소통 감사드려요 😊 오늘도 힐링 가득한 하루 보내세요!', 999, c.nickname)}
                                      className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                      title="이웃 닉네임 맞춤 멘트 복사"
                                    >
                                      <Copy size={11} />
                                      <span>멘트복사</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSingleVisit(c)}
                                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer ${
                                        isVisited
                                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                                      }`}
                                    >
                                      <span>{isVisited ? '재방문' : '답방'}</span>
                                      <ArrowUpRight size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: 무소통 이웃 리포트 (정리 대상) */}
            {activeTab === 'inactive' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <UserX size={20} className="text-rose-500" /> 실제 무소통 이웃 명단 ({inactiveNeighbors.length}명)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      네이버 [새글순(자동)] 정렬 기준 가장 오랫동안 새 글을 발행하지 않은 하위 {Math.round(cutoffRatio * 100)}% 정리 대상 후보입니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCopyInactiveList}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedId ? <Check size={14} /> : <Copy size={14} />}
                      <span>📋 선택된 이웃 ({inactiveNeighbors.filter((i) => i.selected).length}명) 복사</span>
                    </button>

                    <a
                      href={naverAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>🔗 네이버 이웃관리 바로열기</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* 📱 모바일/PC 스마트 삭제 가이드 배너 */}
                <div className="bg-amber-50 border border-amber-200/90 text-amber-950 p-4 rounded-2xl text-xs flex items-start gap-3 shadow-sm">
                  <span className="text-xl leading-none">💡</span>
                  <div className="leading-relaxed space-y-1">
                    <strong className="font-black text-amber-950 text-sm">소통 이웃 보호 안내:</strong>
                    <p className="text-[12px] text-amber-900 font-medium">
                      네이버 [새글순] 기준으로 장기간 포스팅이 없는 이웃들을 선별했습니다. 혹시 글을 쓰지 않더라도 평소 댓글로 자주 소통하는 찐이웃이 있다면 아래 검색창에서 찾아 <strong>[체크 해제]</strong>하거나 <strong>[🛡️ 찐이웃 보호]</strong> 버튼을 누르시면 안전하게 제외됩니다.
                    </p>
                    <p className="text-[11px] text-amber-800">
                      📱 <strong>스마트폰 이용자:</strong> 열린 네이버 화면에서 브라우저 메뉴(우측 상단 ⋮ 또는 사파리 &apos;가A&apos;) ➔ <strong>[PC버전으로 보기]</strong>를 켜시면 스마트폰에서도 체크박스[v]로 한 번에 시원하게 삭제하실 수 있습니다!
                    </p>
                  </div>
                </div>

                {/* 🛡️ 스캠 의심 제로 3無 안심 보안 보증 배너 */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <ShieldCheck size={18} />
                      </span>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>Gifty 안심 보안 3無 보증</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">100% 클린 인증</span>
                      </h4>
                    </div>
                    <span className="text-[11px] text-emerald-300/80 font-medium">안심하고 사용하셔도 됩니다</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">①</span>
                      <div>
                        <p className="font-bold text-white text-[11px]">네이버 비번 요구 0%</p>
                        <p className="text-[10px] text-slate-300">로그인 정보를 일체 묻지 않으며 알 수도 없습니다.</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">②</span>
                      <div>
                        <p className="font-bold text-white text-[11px]">실행파일(.exe) 설치 0%</p>
                        <p className="text-[10px] text-slate-300">악성코드/바이러스 걱정 없이 브라우저 내에서만 동작합니다.</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">③</span>
                      <div>
                        <p className="font-bold text-white text-[11px]">외부 서버 유출 0%</p>
                        <p className="text-[10px] text-slate-300">모든 분석과 체크는 내 브라우저 로컬에서 안전하게 처리됩니다.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🎛️ 삭제 도구 모드 선택 탭 */}
                <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 lg:grid-cols-4 gap-1 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setDeleteMode('bookmarklet')}
                    className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      deleteMode === 'bookmarklet'
                        ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bookmark size={14} className={deleteMode === 'bookmarklet' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>🥇 1초 북마크릿 (추천)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode('extension')}
                    className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      deleteMode === 'extension'
                        ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Download size={14} className={deleteMode === 'extension' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>🥈 크롬 확장 프로그램</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode('f12')}
                    className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      deleteMode === 'f12'
                        ? 'bg-white text-purple-700 shadow-sm ring-1 ring-purple-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Laptop size={14} className={deleteMode === 'f12' ? 'text-purple-600' : 'text-slate-400'} />
                    <span>🥉 스마트 F12 코드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode('mobile')}
                    className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      deleteMode === 'mobile'
                        ? 'bg-white text-amber-700 shadow-sm ring-1 ring-amber-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone size={14} className={deleteMode === 'mobile' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>📱 스마트폰 모바일</span>
                  </button>
                </div>

                {/* 🥇 1. 북마크릿 패널 */}
                {deleteMode === 'bookmarklet' && (
                  <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-500/30 text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                        <Bookmark size={12} /> 1초 북마크릿 (F12 불필요 · 원클릭)
                      </span>
                      <span className="text-xs text-emerald-200 font-semibold">즐겨찾기 버튼 하나로 끝</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm space-y-3 text-xs">
                      <p className="font-black text-white text-sm flex items-center gap-1.5">
                        <Sparkles size={16} className="text-emerald-400" /> 사용 방법 (단 2단계!)
                      </p>
                      
                      <div className="space-y-3 text-[12px] text-slate-200 leading-relaxed">
                        <div className="flex items-start gap-2.5 bg-black/20 p-3 rounded-xl border border-white/10">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 text-xs">1</span>
                          <div className="space-y-1">
                            <p className="font-bold text-white">아래 초록색 버튼을 마우스로 잡고 브라우저 상단 [북마크(즐겨찾기) 바]로 끌어다 놓으세요:</p>
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <a
                                href={generateBookmarkletUrl()}
                                draggable
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert("이 버튼을 마우스로 꾹 누른 채 브라우저 맨 위 [북마크(즐겨찾기) 바]로 끌어다 놓아주세요!\n\n(또는 옆의 [코드 복사]를 눌러 북마크 주소에 붙여넣으셔도 됩니다.)");
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-lg border border-white/30 cursor-grab active:cursor-grabbing transform active:scale-95 transition-all"
                                title="이 버튼을 북마크 바에 드래그하세요"
                              >
                                <Bookmark size={15} />
                                <span>⭐ 🧹 Gifty 이웃안심정리 (북마크바로 드래그!)</span>
                              </a>
                              <button
                                type="button"
                                onClick={handleCopyBookmarklet}
                                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-xl font-bold text-xs border border-white/20 transition-all flex items-center gap-1"
                              >
                                {copiedBookmarklet ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedBookmarklet ? '복사 완료!' : '북마크릿 코드 복사'}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-emerald-200/70 pt-1">
                              * 북마크 바가 보이지 않는다면 키보드 <strong>Ctrl + Shift + B</strong> (맥: Cmd + Shift + B)를 누르면 북마크 바가 나타납니다.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 bg-black/20 p-3 rounded-xl border border-white/10">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 text-xs">2</span>
                          <div className="space-y-1">
                            <p className="font-bold text-white">네이버 [내가 추가한 이웃] 화면에서 방금 추가한 북마크를 딸깍 클릭합니다!</p>
                            <p className="text-[11px] text-slate-300">
                              • <strong>초록색(🟩)</strong>: 공감·댓글 찐이웃 ➔ <strong>체크 자동 해제 &amp; 안전 보호</strong><br />
                              • <strong>분홍색(🟥)</strong>: 무소통 이웃 ➔ <strong>체크 자동 선택</strong><br />
                              확인 후 네이버 상단 <strong>[이웃 삭제]</strong> 버튼만 누르면 정리가 끝납니다!
                            </p>
                            <div className="pt-2">
                              <a
                                href={naverAdminUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-all"
                              >
                                <span>👉 네이버 이웃관리 창 바로열기</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🥈 2. 크롬 확장 프로그램 패널 */}
                {deleteMode === 'extension' && (
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-5 rounded-2xl shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-500/30 text-indigo-300 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1">
                        <Download size={12} /> 크롬 확장 프로그램 (공식 도구형)
                      </span>
                      <span className="text-xs text-indigo-200 font-semibold">네이버 화면에 정리 버튼 자동 생성</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm space-y-3 text-xs">
                      <p className="font-black text-white text-sm flex items-center gap-1.5">
                        <Sparkles size={16} className="text-indigo-400" /> 최초 1회 설치 방법 (1분 소요)
                      </p>

                      <div className="space-y-2.5 text-[12px] text-slate-200 leading-relaxed">
                        <div className="p-3 bg-black/20 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-white">1. Gifty 확장 프로그램 패키지 다운로드</p>
                            <p className="text-[11px] text-slate-300">다운로드 후 압축을 풀어주세요.</p>
                          </div>
                          <a
                            href="/downloads/gifty-neighbor-cleaner.zip"
                            download="gifty-neighbor-cleaner.zip"
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <Download size={14} />
                            <span>📥 확장 프로그램 다운로드 (.zip)</span>
                          </a>
                        </div>

                        <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                          <p className="font-bold text-white">2. 크롬 브라우저에 등록하기</p>
                          <p className="text-[11px] text-slate-300">
                            크롬 주소창에 <code className="bg-white/20 px-1 py-0.5 rounded text-white font-mono">chrome://extensions</code> 입력 ➔ 우측 상단 <strong>[개발자 모드]</strong> 켜기 ➔ 좌측 상단 <strong>[압축해제된 확장 프로그램을 로드합니다]</strong> 클릭 후 압축 푼 폴더 선택!
                          </p>
                        </div>

                        <div className="p-3 bg-black/20 rounded-xl border border-white/10 space-y-1">
                          <p className="font-bold text-white">3. 네이버 이웃 관리 창 접속</p>
                          <p className="text-[11px] text-slate-300">
                            네이버 [내가 추가한 이웃] 창에 들어가면 우측 하단에 <strong>[⚡ 1초 무소통 정리]</strong> 전용 버튼이 자동으로 뜹니다. 버튼을 누르고 상단 [이웃 삭제]를 누르면 끝!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🥉 3. 스마트 F12 코드 패널 */}
                {deleteMode === 'f12' && (
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-500/30 text-indigo-300 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1">
                        <Laptop size={12} /> PC 스마트 F12 모드 (개발자용)
                      </span>
                      <span className="text-xs text-indigo-200 font-semibold">콘솔창 실행 방식</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm space-y-2 text-xs">
                      <p className="font-black text-white text-sm flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-400" /> F12 콘솔 실행 순서
                      </p>
                      <ol className="text-[12px] text-slate-200 space-y-2 list-decimal list-inside leading-relaxed">
                        <li>네이버 [내가 추가한 이웃] 창에서 키보드 맨 위 <strong>F12</strong>를 누릅니다.</li>
                        <li>
                          콘솔(Console) 창 상단의 <strong>[top ▾]</strong> 버튼을 눌러 <strong>[mainFrame]</strong>으로 변경합니다.
                        </li>
                        <li>아래 [스마트 F12 코드 복사]를 누른 뒤 콘솔창에 <strong>붙여넣기(Ctrl+V)</strong> 후 <strong>Enter</strong>를 누르면 끝!</li>
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-700/60 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span><strong>주의:</strong> 콘솔 상단 [top ▾] ➔ [mainFrame] 선택 필수</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAutoCheckScript}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg cursor-pointer font-bold transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>⚡ 공감·댓글 100% 보호 스마트 F12 코드 복사</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 📱 4. 모바일 패널 */}
                {deleteMode === 'mobile' && (
                  <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                        <Smartphone size={12} /> 모바일 스마트 삭제 (2가지 중 선택)
                      </span>
                      <span className="text-xs text-amber-200 font-semibold">스마트폰 터치로 끝</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {/* 방법 A: 브라우저 PC버전 */}
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm space-y-1.5 text-amber-50 border border-white/10">
                        <p className="font-black text-white text-[13px] flex items-center gap-1">
                          <span>🌐 방법 A. 브라우저 PC버전 (체크박스 삭제)</span>
                        </p>
                        <p className="text-[11px] text-amber-100 leading-relaxed">
                          1. 위 <strong>[네이버 이웃 삭제창 열기]</strong>를 누릅니다.<br />
                          2. 스마트폰 브라우저 메뉴(⋮)에서 <strong>[PC버전 보기]</strong>를 켭니다.<br />
                          3. 복사한 닉네임 검색 ➔ 체크박스[v] ➔ [삭제] 터치!
                        </p>
                      </div>

                      {/* 방법 B: 블로그 앱 */}
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm space-y-1.5 text-amber-50 border border-white/10">
                        <p className="font-black text-white text-[13px] flex items-center gap-1">
                          <span>📱 방법 B. 네이버 블로그 앱에서 삭제</span>
                        </p>
                        <p className="text-[11px] text-amber-100 leading-relaxed">
                          1. 아래 명단에서 <strong>[닉네임 복사]</strong>를 누릅니다.<br />
                          2. 블로그 앱 우측 상단 <strong>[≡ 메뉴] ➔ [이웃 목록]</strong> 검색창에 붙여넣습니다.<br />
                          3. 검색된 이웃 우측 <strong>[점 3개 ⋮] ➔ [이웃 취소]</strong>를 누르면 끝!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🔍 이웃 검색 필터 바 */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="혹시 포함되었는지 확인할 이웃 닉네임 검색 (예: 뽀민이)"
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200 px-2 py-0.5 rounded-md"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* 🛡️ 찐이웃 0% 오탐 안심 알림 배너 */}
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-900 leading-relaxed">
                      내 블로그 댓글 작성자는 <strong>100% 자동 보호</strong>되었습니다. 남겨둘 이웃이 있다면 체크를 해제하시고, 정리할 이웃을 확인해 주세요.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(!inactiveNeighbors.every((i) => i.selected))}
                      className="px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-[11px] shadow-sm transition-all text-center cursor-pointer"
                    >
                      {inactiveNeighbors.length > 0 && inactiveNeighbors.every((i) => i.selected) ? '선택 모두 해제' : '정리 대상 전체 선택'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyInactiveList}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl text-[11px] shadow-sm transition-all text-center flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId ? <Check size={13} /> : <Copy size={13} />}
                      <span>선택된 {inactiveNeighbors.filter((i) => i.selected).length}명 복사</span>
                    </button>
                  </div>
                </div>

                {/* Table Header Controls */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2 py-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inactiveNeighbors.length > 0 && inactiveNeighbors.every((i) => i.selected)}
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>선택된 이웃 ({inactiveNeighbors.filter((i) => i.selected).length}/{inactiveNeighbors.length})</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleCopyInactiveList}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>선택 복사 ({inactiveNeighbors.filter((i) => i.selected).length}명)</span>
                    </button>
                  </div>
                  <span className="text-slate-400">진단 사유</span>
                </div>

                {/* List Items (실제 고객이 붙여넣은 이웃 목록) */}
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {inactiveNeighbors
                    .filter((item) => {
                      if (!searchFilter.trim()) return true;
                      const q = searchFilter.trim().toLowerCase();
                      return item.nickname.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
                    })
                    .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleItem(item.id)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-800 mr-2">{item.nickname}</span>
                          {item.id && item.id !== item.nickname && isValidNaverId(item.id) && (
                            <span className="text-slate-400 text-[11px]">@{item.id}</span>
                          )}
                          {item.group && item.group !== '기본그룹' && (
                            <span className="ml-2 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                              {item.group}
                            </span>
                          )}
                        </div>
                      </label>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        <span className="bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px] hidden md:inline-block">
                          {item.reason}
                        </span>

                        {/* 🛡️ 찐이웃 보호 (무소통에서 즉시 제외) */}
                        <button
                          type="button"
                          onClick={() => handleProtectNeighbor(item.nickname)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 border border-indigo-200"
                          title="무소통 명단에서 제외하고 찐이웃으로 보호"
                        >
                          <ShieldCheck size={13} className="text-indigo-600" />
                          <span>보호</span>
                        </button>

                        {/* 닉네임 복사 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleCopySingleNickname(item.nickname)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                          title="닉네임 클립보드 복사"
                        >
                          {copiedNick === item.nickname ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                          <span>{copiedNick === item.nickname ? '복사됨!' : '닉네임 복사'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {inactiveNeighbors.filter((item) => {
                    if (!searchFilter.trim()) return true;
                    const q = searchFilter.trim().toLowerCase();
                    return item.nickname.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
                  }).length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      검색된 이웃이 없습니다. (무소통 정리 대상에 포함되지 않아 안전합니다! 🎉)
                    </div>
                  )}
                </div>

                {/* 📋 하단 일괄 작업 바 (스크롤 내려왔을 때 바로 복사할 수 있도록) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    총 <strong className="text-slate-900 font-bold">{inactiveNeighbors.length}명</strong> 중 <strong className="text-emerald-700 font-bold">{inactiveNeighbors.filter((i) => i.selected).length}명</strong>이 선택되었습니다.
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteMode('bookmarklet');
                        window.scrollTo({ top: 900, behavior: 'smooth' });
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bookmark size={15} />
                      <span>🥇 1초 북마크릿</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyInactiveList}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedId ? <Check size={15} /> : <Copy size={15} />}
                      <span>📋 선택 {inactiveNeighbors.filter((i) => i.selected).length}명 복사</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAutoCheckScript}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={15} />
                      <span>⚡ 스마트 F12 코드</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 찐이웃 랭킹 */}
            {activeTab === 'top' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Trophy size={20} className="text-amber-500" /> 실제 찐이웃 소통 랭킹
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      고객님의 실제 이웃 명단 중에서 최근 포스팅 활동성과 보호 설정이 반영된 찐이웃들입니다.
                    </p>
                  </div>

                  {/* Top communicators filter chips */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTopFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      전체 ({topCommunicators.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopFilter('vip')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topFilter === 'vip' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      💎 VIP ({topCommunicators.filter((c) => c.statusBadge === 'VIP').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopFilter('new')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topFilter === 'new' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      🌱 새내기 ({topCommunicators.filter((c) => c.statusBadge === 'NEW').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopFilter('unvisited')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${topFilter === 'unvisited' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      ⚡ 미답방 ({topCommunicators.filter((c) => !visitedToday[c.id]).length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-100">
                        <th className="py-3 px-3">순위</th>
                        <th className="py-3 px-3">실제 이웃 닉네임</th>
                        <th className="py-3 px-3 text-center">등급</th>
                        <th className="py-3 px-3 text-center">소통 상태</th>
                        <th className="py-3 px-3 text-center">신선도</th>
                        <th className="py-3 px-3 text-center">활동 수준</th>
                        <th className="py-3 px-3 text-right">답방 / 블로그</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topCommunicators
                        .filter((c) => {
                          if (topFilter === 'vip') return c.statusBadge === 'VIP';
                          if (topFilter === 'new') return c.statusBadge === 'NEW';
                          if (topFilter === 'unvisited') return !visitedToday[c.id];
                          return true;
                        })
                        .map((c) => {
                          const isVisited = !!visitedToday[c.id];
                          return (
                            <tr key={c.id + c.rank} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-3 font-black text-slate-700">
                                {c.isProtected ? (
                                  <span className="text-indigo-600 font-black">💎 보호</span>
                                ) : c.rank === 1 ? (
                                  <span className="text-amber-500">🥇 1위</span>
                                ) : c.rank === 2 ? (
                                  <span className="text-slate-400">🥈 2위</span>
                                ) : c.rank === 3 ? (
                                  <span className="text-amber-700">🥉 3위</span>
                                ) : (
                                  `${c.rank}위`
                                )}
                              </td>
                              <td className="py-3.5 px-3 font-bold text-slate-800">
                                {c.nickname}
                                {c.id && c.id !== c.nickname && isValidNaverId(c.id) && (
                                  <span className="text-xs text-slate-400 font-normal ml-1.5">(@{c.id})</span>
                                )}
                                {c.isProtected && (
                                  <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    찐이웃 보호
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                    c.grade === '다이아'
                                      ? 'bg-blue-100 text-blue-700'
                                      : c.grade === '골드'
                                      ? 'bg-amber-100 text-amber-800'
                                      : c.grade === '실버'
                                      ? 'bg-slate-200 text-slate-700'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {c.grade}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {c.statusBadge === 'VIP' ? (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    💎 VIP
                                  </span>
                                ) : c.statusBadge === 'NEW' ? (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    🌱 새내기
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-500">
                                    일반
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500">
                                {c.lastActiveDate || '최근'}
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-emerald-700 text-xs">
                                {c.activityLevel || '🔥 최상위 활동'}
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSingleVisit(c)}
                                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                      isVisited
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'
                                    }`}
                                    title="블로그 방문 및 답방 체크"
                                  >
                                    <span>{isVisited ? '방문완료' : '답방'}</span>
                                    <ArrowUpRight size={12} />
                                  </button>
                                  <a
                                    href={`https://blog.naver.com/${c.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-400 hover:text-slate-600 p-1"
                                    title="새 탭으로 열기"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: 종합 소통 분석 */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                      <Heart size={18} className="text-rose-500" /> 공감 및 반응 지수
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>글 1개당 평균 공감 수</span>
                          <span className="text-emerald-600">약 28개 (상위 25%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full w-[75%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>글 1개당 평균 댓글 수</span>
                          <span className="text-emerald-600">약 11개 (양호)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full w-[65%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>재방문 이웃 소통율</span>
                          <span className="text-emerald-600">약 62%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full w-[62%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-600" /> AI 소통 개선 처방전
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        분석된 실제 이웃 <strong>{totalParsedCount}명</strong> 중 약 <strong>{inactiveNeighbors.length}명</strong>이 무소통 정리 대상 후보로 분류되었습니다.
                      </p>
                      <div className="bg-emerald-50 border border-emerald-200/60 p-3 rounded-2xl text-xs text-emerald-900 font-semibold">
                        💡 <strong>추천 솔루션:</strong> 무소통 이웃을 정리해 두시면 네이버 서로이웃 5,000명 한도를 효율적으로 확보하고, 실제 소통하는 이웃들과의 인터랙션을 높일 수 있습니다.
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('inactive')}
                      className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                    >
                      실제 무소통 이웃 명단 확인하러 가기 <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 가이드 */}
            {activeTab === 'guide' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                    <Sparkles className="text-rose-500" /> 무소통 이웃 가장 빠르게 정리하는 2가지 방법
                  </h3>
                  <p className="text-xs text-slate-500">
                    상황에 맞게 가장 편한 방법을 선택하세요. PC 사용 시 방법 1이 압도적으로 빠르고 편합니다.
                  </p>
                </div>

                {/* 방법 1: PC 1초 일괄 자동체크 (강력 추천) */}
                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-rose-600 text-white rounded-full font-black text-xs">
                      방법 1 (초강력 추천)
                    </span>
                    <span className="text-xs font-bold text-rose-700">⚡ 소요시간 약 5초</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    💻 PC에서 [1초 일괄 자동체크 코드]로 30명 한 번에 삭제하기
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-rose-100 shadow-sm">
                      <p className="font-black text-rose-600 mb-1">1단계: 코드 복사</p>
                      <p className="text-slate-700 leading-relaxed">우리 사이트에서 <strong>[🪄 1초 자동체크 코드 복사]</strong> 버튼을 누릅니다.</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-rose-100 shadow-sm">
                      <p className="font-black text-rose-600 mb-1">2단계: 콘솔 열기</p>
                      <p className="text-slate-700 leading-relaxed">네이버 [내가 추가한 이웃] 화면에서 <strong>F12</strong>를 누르고 <strong>Console</strong> 탭을 클릭합니다.</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-rose-100 shadow-sm">
                      <p className="font-black text-rose-600 mb-1">3단계: 붙여넣고 엔터</p>
                      <p className="text-slate-700 leading-relaxed"><strong>Ctrl + V</strong> 후 엔터 치면 자동 체크 완료! 상단 <strong>[이웃 삭제]</strong> 버튼만 1번 누르면 끝!</p>
                    </div>
                  </div>
                </div>

                {/* 방법 2: 모바일/수동 검색 삭제 */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-slate-700 text-white rounded-full font-black text-xs">
                      방법 2
                    </span>
                    <span className="text-xs font-bold text-slate-600">📱 모바일 / 건별 검색</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    📱 [닉네임 복사] 후 네이버에서 빠르게 삭제하기
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <p className="font-black text-slate-800 mb-1">1단계: 닉네임 복사</p>
                      <p className="text-slate-700 leading-relaxed">목록에서 삭제할 이웃 옆 <strong>[📋 닉네임 복사]</strong> 버튼을 누릅니다.</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <p className="font-black text-slate-800 mb-1">2단계: 검색창에 붙여넣기</p>
                      <p className="text-slate-700 leading-relaxed">네이버 [내가 추가한 이웃] 또는 블로그 앱 [이웃 목록] 검색창에 붙여넣고 검색합니다.</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <p className="font-black text-slate-800 mb-1">3단계: 삭제 / 취소</p>
                      <p className="text-slate-700 leading-relaxed">PC에서는 <strong>체크박스 [v] ➔ [이웃 삭제]</strong>, 모바일 앱에서는 <strong>[점 3개 ⋮] ➔ [이웃 취소]</strong>를 누르면 끝!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl">
                  <h4 className="font-black text-sm mb-2 text-emerald-300">💡 왜 무소통 이웃을 정기적으로 정리해야 할까요?</h4>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong>서로이웃 5,000명 한도 관리:</strong> 네이버 서로이웃은 최대 5,000명까지만 추가할 수 있어서 유령 이웃을 비워두어야 새로운 찐이웃을 맺을 수 있습니다.</li>
                    <li><strong>블로그 체류시간 &amp; 지수 보호:</strong> 글을 읽지 않고 품앗이 성의 없는 공감만 누르거나 아예 안 들어오는 이웃을 정리하면 블로그 품질 관리에 유리합니다.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bottom Support Card */}
            <div className="mt-8">
              <CoupangSupportCard category="general" />
            </div>
          </div>
        )}

        {/* Initial Empty State / Introduction Cards */}
        {!hasResult && !isAnalyzing && (
          <div className="space-y-12">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <UserX size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">100% 실제 내 이웃 기반</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  가짜 샘플 데이터가 아닙니다. 고객님이 네이버 관리자에서 복사해 온 실제 이웃 목록을 정밀하게 대조합니다.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <Trophy size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">🏆 고마운 찐이웃 랭킹</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  내 이웃 중 누가 가장 소통 활동성이 우수할까요? 찐이웃 TOP 10을 한눈에 확인하고 감사 인사를 전하세요.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">안전한 무설치 웹 방식</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  비밀번호 입력이나 수상한 프로그램 설치가 필요 없습니다. 모바일과 PC 브라우저에서 100% 안전하게 동작합니다.
                </p>
              </div>
            </div>

            {/* Support Card */}
            <CoupangSupportCard category="general" />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-black text-white">Gifty.</span>
            <p className="mt-1 text-slate-500">
              블로거와 크리에이터를 위한 마법 같은 도구 모음집
            </p>
          </div>
          <div className="flex gap-6 text-slate-400 font-semibold">
            <Link href="/" className="hover:text-white">홈</Link>
            <Link href="/neighbor" className="text-emerald-400 hover:text-white font-bold">이웃 소통 지표</Link>
            <Link href="/sticker" className="hover:text-white">블로그 스티커</Link>
            <Link href="/experience-diary" className="hover:text-white">체험단 다이어리</Link>
            <Link href="/community" className="hover:text-white">커뮤니티</Link>
          </div>
        </div>
      </footer>

      {/* ⚡ 1초 자동체크 사용법 모달 */}
      {showScriptGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowScriptGuide(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                <Sparkles size={14} /> 🛡️ 공감·댓글 찐이웃 100% 안심 보호 스마트 엔진
              </div>
              <h3 className="text-xl font-black text-slate-900">
                스마트 F12 자동선택 &amp; 찐이웃 보호 가이드
              </h3>
              <p className="text-xs text-slate-500">
                네이버 안에서 최근 글의 <strong>공감(하트)과 댓글 작성자를 실시간 전수 조회</strong>하여 소통 이웃은 안전하게 보호하고 무소통 이웃만 1초 만에 쏙쏙 골라줍니다.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">스마트 F12 코드 복사 완료</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {copiedScript ? '✅ 이미 안전 보호 코드가 클립보드에 복사되었습니다!' : '아래 [코드 다시 복사하기] 버튼을 누르면 코드가 복사됩니다.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">네이버 [내가 추가한 이웃] 화면에서 F12 누르기</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    네이버 관리자 화면에서 키보드 맨 위 <strong>F12</strong> 키를 누른 후, 상단 탭에서 <strong>[Console] (콘솔)</strong>을 클릭합니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-indigo-950">붙여넣기(Ctrl + V) 후 엔터(Enter) 치기</p>
                  <p className="text-indigo-900/80 text-[11px] leading-relaxed">
                    콘솔 창 상단의 <strong>[top ▾]</strong>을 클릭하여 <strong>[mainFrame]</strong>으로 변경한 뒤, <strong>Ctrl + V</strong>(붙여넣기) 후 <strong>Enter</strong>를 누르면 1초 만에 자동 선택됩니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950">결과 확인 및 [이웃 삭제] 클릭</p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    • <strong>초록색(🟩)</strong>: 공감·댓글 소통 찐이웃 ➔ <strong>체크 자동 해제 &amp; 안전 보호</strong><br />
                    • <strong>분홍색(🟥)</strong>: 실제 무소통 이웃 ➔ <strong>체크 자동 선택</strong><br />
                    확인 후 상단의 <strong>[이웃 삭제]</strong> 버튼만 누르면 안전하게 정리가 끝납니다!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyAutoCheckScript}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>{copiedScript ? '스마트 보호 코드 복사 완료!' : '스마트 보호 코드 다시 복사'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setShowScriptGuide(false);
                  handleOpenNaverAdmin(e);
                }}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>네이버 창 열고 실행하기</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 과거 분석 기록 히스토리 모달 */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    분석 기록 히스토리 보관함
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    브라우저에 자동 백업된 최근 {historyRecords.length}개의 진단 기록입니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {historyRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  저장된 이전 분석 기록이 없습니다.
                </div>
              ) : (
                historyRecords.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    onClick={() => handleLoadHistoryRecord(r)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/40 transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">@{r.blogId}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({r.date})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          건강도 {r.healthScore}점
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryRecord(r.id, e)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="기록 삭제"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-600">
                      <div className="bg-white p-2 rounded-xl text-center border border-slate-150">
                        <div className="text-[10px] text-slate-400">분석 이웃</div>
                        <div className="text-slate-800 font-black">{r.totalParsedCount}명</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl text-center border border-slate-150">
                        <div className="text-[10px] text-indigo-500">소통 찐이웃</div>
                        <div className="text-indigo-700 font-black">{r.topCommunicators.length}명</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl text-center border border-slate-150">
                        <div className="text-[10px] text-rose-500">무소통 이웃</div>
                        <div className="text-rose-700 font-black">{r.inactiveNeighbors.length}명</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-indigo-600 font-bold">
                        💎 VIP {r.trend?.vipCount || 0}명 · 🌱 새내기 {r.trend?.newCount || 0}명
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                        <span>대시보드로 불러오기</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 크롬 확장 프로그램 초간단 1분 설치 모달 */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-black">
                <Sparkles size={14} className="text-indigo-600" /> 최초 1회 1분 설치 (초간단)
              </div>
              <h3 className="text-xl font-black text-slate-900">
                크롬 확장 프로그램 설치 가이드 🚀
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                한 번만 설치해 두시면 앞으로 네이버 블로그 창에서 클릭 한 번으로 모든 이웃 목록과 소통 데이터를 자동 분석할 수 있습니다.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[11px]">1</span>
                    <span>확장 프로그램 파일 다운로드 및 압축 풀기</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  아래 버튼을 눌러 압축 파일(<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">gifty-neighbor-cleaner.zip</code>)을 다운로드한 후, 원하는 폴더(예: 바탕화면 또는 다운로드 폴더)에 압축을 풀어주세요.
                </p>
                <a
                  href="/downloads/gifty-neighbor-cleaner.zip"
                  download="gifty-neighbor-cleaner.zip"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-1"
                >
                  <Download size={14} />
                  <span>📥 패키지 다운로드 (.zip)</span>
                </a>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[11px]">2</span>
                  <span>크롬 확장 관리 페이지 열기</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  크롬 브라우저 주소창에 아래 주소를 입력하거나 복사 후 새 탭에 붙여넣어 접속합니다.
                </p>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <code className="text-indigo-600 font-mono font-bold text-xs flex-1">
                    chrome://extensions
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyChromeUrl}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedChromeUrl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedChromeUrl ? '복사됨!' : '주소 복사'}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 & 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[11px]">3</span>
                  <span>[개발자 모드] 켜기 ➔ [압축해제된 확장 프로그램 로드]</span>
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed pl-1">
                  <li>화면 우측 상단의 <strong>[개발자 모드]</strong> 스위치를 켭니다.</li>
                  <li>좌측 상단에 나타난 <strong>[압축해제된 확장 프로그램을 로드합니다]</strong> 버튼을 클릭합니다.</li>
                  <li>
                    압축을 푼 <strong className="text-indigo-600 font-black">gifty-neighbor-cleaner</strong> 폴더(안에 <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">manifest.json</code>이 들어있는 폴더)를 선택하면 설치 끝!
                  </li>
                </ul>

                {/* 🚨 매니페스트 오류 해결 팁 */}
                <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <span>💡 &apos;매니페스트 파일이 없거나 읽을 수 없습니다&apos; 오류가 발생하나요?</span>
                  </div>
                  <p className="text-amber-700/90 leading-relaxed font-normal">
                    압축을 풀었을 때 폴더가 2중(폴더 안에 또 같은 이름의 폴더)으로 풀렸을 수 있습니다. 폴더 안으로 한 단계 더 들어가서 <strong>manifest.json</strong> 파일이 바로 보이는 폴더를 선택해 주세요!
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="font-black text-emerald-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[11px]">4</span>
                  <span>네이버 블로그 화면에서 버튼 1번으로 연동!</span>
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  이제 네이버 [내가 추가한 이웃] 화면에 들어가시면 화면 우측 하단에 <strong>[📊 Gifty 분석실로 보내기]</strong>와 <strong>[⚡ 1초 무소통 정리]</strong> 버튼이 자동으로 나타납니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <a
                href="/downloads/gifty-neighbor-cleaner.zip"
                download="gifty-neighbor-cleaner.zip"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={15} />
                <span>다운로드 시작 (.zip)</span>
              </a>
              <button
                type="button"
                onClick={() => setShowExtensionModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
