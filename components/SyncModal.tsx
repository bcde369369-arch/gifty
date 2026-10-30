'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  LogOut,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getSavedSyncCode,
  saveSyncCode,
  clearSyncCode,
  formatSyncCode,
  normalizeSyncCode,
  generateRandomSyncCode,
  pushSchedulesToCloud,
  pullSchedulesFromCloud,
  getLastSyncedTime,
} from '@/lib/syncService';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedules: unknown[];
  onSchedulesSynced: (newSchedules: unknown[]) => void;
}

export default function SyncModal({
  isOpen,
  onClose,
  currentSchedules,
  onSchedulesSynced,
}: SyncModalProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedSyncCode();
      setActiveCode(saved);
      setLastSynced(getLastSyncedTime());
      setStatusMessage(null);
      setCopied(false);
      setShowQr(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. 새 연동 코드 발급 & 현재 데이터 클라우드 업로드
  const handleGenerateAndUpload = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    const newCode = generateRandomSyncCode();

    const res = await pushSchedulesToCloud(currentSchedules, newCode);
    setIsLoading(false);

    if (res.success) {
      saveSyncCode(newCode);
      setActiveCode(newCode);
      setLastSynced(new Date().toISOString());
      setShowQr(true);
      setStatusMessage({ text: '연동 코드가 발급되었으며 데이터가 클라우드에 안전하게 업로드되었습니다!', type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  // 2. 다른 기기에서 연동 코드 입력 후 데이터 다운로드 & 연결
  const handleConnectWithCode = async () => {
    const norm = normalizeSyncCode(inputCode);
    if (norm.length !== 6) {
      setStatusMessage({ text: '6자리 연동 코드를 정확히 입력해주세요.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const res = await pullSchedulesFromCloud(norm);
    setIsLoading(false);

    if (res.success && res.data) {
      saveSyncCode(norm);
      setActiveCode(norm);
      setLastSynced(res.updatedAt || new Date().toISOString());
      onSchedulesSynced(res.data as unknown[]);
      setStatusMessage({ text: '성공적으로 연결되었습니다! 최신 일정을 불러왔습니다.', type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  // 3. 현재 코드로 수동 동기화 (클라우드에서 최신 받기)
  const handleManualPull = async () => {
    if (!activeCode) return;
    setIsLoading(true);
    setStatusMessage(null);

    const res = await pullSchedulesFromCloud(activeCode);
    setIsLoading(false);

    if (res.success && res.data) {
      setLastSynced(res.updatedAt || new Date().toISOString());
      onSchedulesSynced(res.data as unknown[]);
      setStatusMessage({ text: '최신 일정을 클라우드에서 성공적으로 가져왔습니다!', type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  // 4. 현재 코드로 수동 업로드 (클라우드에 올리기)
  const handleManualPush = async () => {
    if (!activeCode) return;
    setIsLoading(true);
    setStatusMessage(null);

    const res = await pushSchedulesToCloud(currentSchedules, activeCode);
    setIsLoading(false);

    if (res.success) {
      setLastSynced(new Date().toISOString());
      setStatusMessage({ text: '현재 일정이 클라우드에 성공적으로 업데이트되었습니다!', type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  // 5. 연동 해제
  const handleDisconnect = () => {
    if (confirm('연동을 해제하시겠습니까? (이 기기의 기존 일정 데이터는 그대로 유지됩니다)')) {
      clearSyncCode();
      setActiveCode(null);
      setShowQr(false);
      setInputCode('');
      setStatusMessage({ text: '연동이 해제되었습니다.', type: 'info' });
    }
  };

  // 6. 코드 복사
  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 모바일 접속용 원클릭 URL & QR 코드 이미지
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gifty.kr';
  const autoConnectUrl = activeCode ? `${origin}/experience-diary?syncCode=${activeCode}` : '';
  const qrImageUrl = activeCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(autoConnectUrl)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                모바일 ↔ PC 간편 연동
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  회원가입 없음
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                6자리 코드로 언제 어디서나 다이어리를 동기화하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 상태 메시지 알림바 */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 바디 콘텐츠 */}
        <div className="p-6 space-y-6">
          {activeCode ? (
            /* [상태 A] 이미 연동 코드가 등록되어 연동 중인 상태 */
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  실시간 연동 활성화됨
                </div>
                <div className="text-xs text-slate-500 mb-1 font-medium">내 고유 연동 코드</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-extrabold tracking-widest text-indigo-700 font-mono">
                    {formatSyncCode(activeCode)}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 transition-colors shadow-sm"
                    title="코드 복사"
                  >
                    {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  </button>
                </div>
                {lastSynced && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    마지막 동기화: {new Date(lastSynced).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* QR 코드 토글 영역 */}
              <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <QrCode size={16} className="text-indigo-600" /> 스마트폰 카메라로 바로 연결하기
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      모바일 카메라로 QR을 비추면 코드가 자동 입력됩니다
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    {showQr ? 'QR 접기' : 'QR 보기'}
                  </button>
                </div>

                {showQr && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrImageUrl}
                        alt="연동 QR 코드"
                        className="w-44 h-44 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-indigo-600 font-medium mt-3">
                      스마트폰 기본 카메라 앱으로 비춰보세요!
                    </p>
                  </div>
                )}
              </div>

              {/* 수동 동기화 및 업로드 버튼 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleManualPull}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  클라우드에서 받기
                </button>
                <button
                  onClick={handleManualPush}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles size={14} />
                  클라우드에 올리기
                </button>
              </div>

              {/* 연동 해제 버튼 */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-medium py-1 px-3 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} /> 이 기기에서 연동 해제하기
                </button>
              </div>
            </div>
          ) : (
            /* [상태 B] 아직 연동되지 않은 상태 (새 코드 발급 or 코드 입력) */
            <div className="space-y-6">
              {/* 옵션 1: PC나 메인 기기에서 새로 시작할 때 */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      새 연동 코드 발급하기 (기존 일정이 있는 기기)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      현재 등록된 다이어리 일정을 암호화하여 클라우드에 올리고, 모바일에서 접속할 수 있는 6자리 코드를 발급합니다.
                    </p>
                    <button
                      onClick={handleGenerateAndUpload}
                      disabled={isLoading}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> 코드 생성 및 데이터 전송 중...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> 6자리 연동 코드 발급 및 클라우드 업로드
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">또는</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* 옵션 2: 스마트폰 등 다른 기기에서 기존 코드를 입력할 때 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      발급받은 6자리 연동 코드 입력하기
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      PC에서 발급받은 6자리 코드를 입력하면 저장된 일정을 즉시 불러오고 연동합니다.
                    </p>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="예: 748291"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleConnectWithCode}
                        disabled={isLoading || inputCode.length !== 6}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold transition-all shrink-0"
                      >
                        {isLoading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <>
                            연결 <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 자주 묻는 질문 & 사용 방법 아코디언 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
            <button
              type="button"
              onClick={() => setShowFaq(!showFaq)}
              className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-indigo-700">
                <HelpCircle size={15} /> 💡 모바일 연동 3초 가이드 & 자주 묻는 질문
              </span>
              {showFaq ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {showFaq && (
              <div className="p-4 pt-1 border-t border-slate-200 text-xs space-y-3 bg-white text-slate-600">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    ❓ 회원가입이나 로그인이 필요한가요?
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    전혀 필요 없습니다! 회원가입 없이 6자리 고유 연동 코드만으로 기기 간에 즉시 연결됩니다.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    ❓ 폰에서 일정을 등록하면 PC에도 바로 뜨나요?
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    네! 연동이 완료되면 한쪽에서 일정을 추가·수정·완료 체크할 때마다 클라우드를 통해 실시간 양방향으로 자동 동기화됩니다.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    ❓ 휴대폰이나 컴퓨터를 바꿀 땐 어떻게 하나요?
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    새 기기에서 [발급받은 6자리 연동 코드 입력하기]를 통해 기존 코드를 입력하시면 저장되어 있던 모든 일정이 그대로 복원됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 보안 안내 배지 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-600 text-[11px]">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>
              <strong>프라이버시 보호:</strong> 모든 일정 데이터는 6자리 코드로 브라우저에서 암호화되어 전송되므로 외부에서 내용을 볼 수 없습니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
