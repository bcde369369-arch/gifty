'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  X,
  Sparkles,
  Clock,
  Play,
  Square,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Wand2,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  captureScreenshotFromDisplay,
  isScreenCaptureSupported,
  saveRecordedVideo
} from '@/lib/screenCapture';
import { useRouter } from 'next/navigation';

interface ScreenCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'screenshot' | 'record';
  onScreenshotCaptured?: (file: File) => void;
  onRecordingComplete?: (file: File) => void;
}

export default function ScreenCaptureModal({
  isOpen,
  onClose,
  initialTab = 'screenshot',
  onScreenshotCaptured,
  onRecordingComplete
}: ScreenCaptureModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'screenshot' | 'record'>(initialTab);
  const [isSupported, setIsSupported] = useState(true);

  // 스크린샷 관련 상태
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 화면 녹화 관련 상태
  const [recordDuration, setRecordDuration] = useState<number>(10); // 초 단위 (5, 10, 15, 0=무제한)
  const [includeAudio, setIncludeAudio] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordCountdown, setRecordCountdown] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsSupported(isScreenCaptureSupported());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      resetRecordingState();
    } else {
      cleanupStream();
    }
  }, [isOpen, initialTab]);

  const cleanupStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setCountdown(null);
    setRecordCountdown(null);
  };

  const resetRecordingState = () => {
    cleanupStream();
    setIsRecording(false);
    setElapsedTime(0);
    setRecordedBlob(null);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordedFile(null);
  };

  // ==========================================
  // [1] 스크린샷 캡처 핸들러
  // ==========================================
  const handleImmediateScreenshot = async () => {
    setIsCapturing(true);
    try {
      const file = await captureScreenshotFromDisplay();
      onScreenshotCaptured?.(file);
      onClose();
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        alert(err.message || '화면 캡처 중 오류가 발생했습니다.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCountdownScreenshot = () => {
    setIsCapturing(true);
    setCountdown(3);
    let count = 3;

    countdownTimerRef.current = setInterval(async () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownTimerRef.current!);
        setCountdown(null);
        try {
          const file = await captureScreenshotFromDisplay();
          onScreenshotCaptured?.(file);
          onClose();
        } catch (err: any) {
          if (err.name !== 'NotAllowedError') {
            alert(err.message || '화면 캡처 중 오류가 발생했습니다.');
          }
        } finally {
          setIsCapturing(false);
        }
      }
    }, 1000);
  };

  // ==========================================
  // [2] 화면 녹화 핸들러
  // ==========================================
  const startRecordingFlow = async () => {
    try {
      // 1. 디스플레이 스트림 획득
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as any,
        audio: includeAudio
      });

      // 유저가 오디오 녹음도 원할 때 마이크 추가
      let combinedStream = displayStream;
      if (includeAudio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTracks = [...displayStream.getAudioTracks(), ...micStream.getAudioTracks()];
          combinedStream = new MediaStream([...displayStream.getVideoTracks(), ...audioTracks]);
        } catch {
          // 마이크 권한 거부 시 디스플레이 스트림만 유지
        }
      }

      activeStreamRef.current = combinedStream;

      // 화면 공유 중지 버튼을 브라우저 바에서 누를 때 자동 종료 처리
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // 3초 카운트다운 시작
      setRecordCountdown(3);
      let count = 3;

      const countdownInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setRecordCountdown(count);
        } else {
          clearInterval(countdownInterval);
          setRecordCountdown(null);
          beginActualRecording(combinedStream);
        }
      }, 1000);
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        alert(err.message || '화면 녹화 권한을 가져오지 못했습니다.');
      }
      resetRecordingState();
    }
  };

  const beginActualRecording = (stream: MediaStream) => {
    recordedChunksRef.current = [];

    // 최적 지원 MIME 타입 선택
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: selectedMime || 'video/webm'
      });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_record_${timestamp}.webm`, {
        type: blob.type
      });

      setRecordedBlob(blob);
      setRecordedVideoUrl(url);
      setRecordedFile(file);
      setIsRecording(false);
      cleanupStream();
    };

    recorder.start(250); // 250ms 단위 청크
    setIsRecording(true);
    setElapsedTime(0);

    // 경과 시간 및 제한 타이머
    const startTime = Date.now();
    recordTimerRef.current = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsedSec);

      if (recordDuration > 0 && elapsedSec >= recordDuration) {
        stopRecording();
      }
    }, 250);
  };

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // 녹화 영상을 Gifty 메인 GIF 메이커로 전송
  const handleTransferToGifEditor = async () => {
    if (!recordedFile && !recordedBlob) return;
    setIsNavigating(true);

    try {
      const blob = recordedBlob || (recordedFile as Blob);
      await saveRecordedVideo(blob, recordedFile?.name || 'screen-recording.webm');
      onRecordingComplete?.(recordedFile!);
      onClose();
      // 메인 홈으로 이동하여 VideoEditor 자동 시작
      router.push('/?from=record');
    } catch (err) {
      console.error(err);
      alert('녹화된 영상을 편집기로 전달하는 중 오류가 발생했습니다.');
      setIsNavigating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl || !recordedFile) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = recordedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
              {activeTab === 'screenshot' ? <Camera size={18} /> : <Video size={18} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {activeTab === 'screenshot' ? '화면 스크린샷 캡처' : '화면 녹화 & 움짤 만들기'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                별도 프로그램 설치 없이 브라우저에서 바로 가져옵니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 상단 탭 전환 */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            onClick={() => {
              resetRecordingState();
              setActiveTab('screenshot');
            }}
            disabled={isRecording}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'screenshot'
                ? 'border-purple-600 text-purple-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera size={16} />
            <span>📸 스크린샷 캡처</span>
          </button>
          <button
            onClick={() => {
              cleanupStream();
              setActiveTab('record');
            }}
            disabled={isCapturing}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'record'
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video size={16} />
            <span>🎥 화면 녹화 (움짤용)</span>
            <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
              HOT
            </span>
          </button>
        </div>

        {/* 브라우저 미지원 안내 */}
        {!isSupported ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">화면 캡처 미지원 브라우저</h4>
            <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
              화면 캡처 및 화면 녹화는 보안 정책상 <strong>PC 크롬(Chrome), 웨일(Whale), 엣지(Edge)</strong> 브라우저에서만 동작합니다.
              <br />
              모바일 또는 인앱 브라우저에서는 <strong>[파일 업로드]</strong>나 <strong>[사진 촬영]</strong>을 이용해주세요!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm"
            >
              닫기
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* ========================================================= */}
            {/* 1. 스크린샷 탭 내용 */}
            {/* ========================================================= */}
            {activeTab === 'screenshot' && (
              <div className="space-y-5">
                {countdown !== null ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center animate-pulse">
                    <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-4xl font-black mb-4 shadow-inner">
                      {countdown}
                    </div>
                    <p className="text-base font-bold text-slate-800 mb-1">
                      원하는 화면이나 창으로 이동해주세요!
                    </p>
                    <p className="text-xs text-slate-500">
                      {countdown}초 후 화면 선택 창이 나타납니다.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 즉시 캡처 버튼 */}
                      <button
                        type="button"
                        onClick={handleImmediateScreenshot}
                        disabled={isCapturing}
                        className="p-5 border-2 border-purple-200 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 rounded-2xl flex flex-col items-center text-center transition-all group shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                          <Camera size={26} />
                        </div>
                        <span className="text-sm font-black text-slate-800 mb-1">
                          ⚡ 지금 바로 캡처
                        </span>
                        <span className="text-xs text-slate-500">
                          화면, 특정 창, 브라우저 탭 선택 후 1초 만에 로드
                        </span>
                      </button>

                      {/* 3초 카운트다운 캡처 버튼 */}
                      <button
                        type="button"
                        onClick={handleCountdownScreenshot}
                        disabled={isCapturing}
                        className="p-5 border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl flex flex-col items-center text-center transition-all group shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                          <Clock size={26} />
                        </div>
                        <span className="text-sm font-black text-slate-800 mb-1">
                          ⏱️ 3초 후 캡처
                        </span>
                        <span className="text-xs text-slate-500">
                          원하는 프로그램이나 웹페이지로 전환할 시간 제공
                        </span>
                      </button>
                    </div>

                    {/* 꿀팁 박스: Ctrl+V 안내 */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                        <Sparkles size={16} />
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800 font-extrabold block mb-1">
                          초간단 단축키 꿀팁!
                        </strong>
                        키보드의 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-purple-600">Win + Shift + S</kbd> (Mac은 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-purple-600">Cmd + Shift + 4</kbd>)로 화면을 자른 뒤, 스튜디오 어디서나 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-purple-600">Ctrl + V</kbd>를 누르면 즉시 편집창에 뜹니다.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. 화면 녹화 탭 내용 */}
            {/* ========================================================= */}
            {activeTab === 'record' && (
              <div className="space-y-4">
                {/* 2-A: 녹화 전 옵션 설정 */}
                {!isRecording && !recordedBlob && recordCountdown === null && (
                  <>
                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl mb-4">
                      <label className="text-xs font-extrabold text-indigo-900 block mb-2">
                        ⏱️ 녹화 시간 프리셋 (권장)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { sec: 5, label: '5초' },
                          { sec: 10, label: '10초 (추천⭐)' },
                          { sec: 15, label: '15초' },
                          { sec: 0, label: '무제한' }
                        ].map((item) => (
                          <button
                            key={item.sec}
                            type="button"
                            onClick={() => setRecordDuration(item.sec)}
                            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all border ${
                              recordDuration === item.sec
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-indigo-600/90 mt-2 font-medium">
                        💡 네이버 블로그 업로드 제한(20MB)을 위해 <strong>10초 이하</strong> 녹화를 강력 권장합니다.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-4">
                      <div className="flex items-center gap-2.5">
                        {includeAudio ? (
                          <Mic size={18} className="text-indigo-600" />
                        ) : (
                          <MicOff size={18} className="text-slate-400" />
                        )}
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            오디오(마이크/시스템 소리) 포함
                          </span>
                          <span className="text-[11px] text-slate-400">
                            움짤(GIF)은 소리가 없으므로 끄는 것을 권장합니다
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={startRecordingFlow}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-ping group-hover:bg-white" />
                      <span>화면 녹화 시작하기</span>
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* 2-B: 시작 전 카운트다운 */}
                {recordCountdown !== null && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-4xl font-black mb-4 border-2 border-red-200 animate-bounce">
                      {recordCountdown}
                    </div>
                    <p className="text-base font-bold text-slate-800 mb-1">
                      준비하세요! 곧 녹화가 시작됩니다
                    </p>
                    <p className="text-xs text-slate-500">
                      공유창으로 선택한 화면이 기록됩니다.
                    </p>
                  </div>
                )}

                {/* 2-C: 녹화 진행 중 UI */}
                {isRecording && (
                  <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-600/30 border border-red-500/50 rounded-full">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black tracking-wider text-red-300 uppercase">
                        REC 녹화 중
                      </span>
                    </div>

                    <div className="text-4xl font-black tracking-wider font-mono">
                      00:{String(elapsedTime).padStart(2, '0')}
                      {recordDuration > 0 && (
                        <span className="text-slate-400 text-2xl">
                          {' '}
                          / 00:{String(recordDuration).padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    {recordDuration > 0 && (
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-indigo-500 h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (elapsedTime / recordDuration) * 100)}%`
                          }}
                        />
                      </div>
                    )}

                    <p className="text-xs text-slate-400 text-center">
                      녹화를 마치려면 아래 정지 버튼을 누르거나 화면 상단 공유 중지를 클릭하세요.
                    </p>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl flex items-center gap-2 text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      <Square size={16} fill="white" />
                      <span>녹화 종료하기</span>
                    </button>
                  </div>
                )}

                {/* 2-D: 녹화 완료 후 미리보기 및 전송 */}
                {recordedBlob && recordedVideoUrl && (
                  <div className="space-y-4">
                    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center relative">
                      <video
                        src={recordedVideoUrl}
                        controls
                        autoPlay
                        className="max-h-full max-w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span className="font-bold text-slate-700">
                        🎬 녹화 완료: 약 {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={resetRecordingState}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors font-medium cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>다시 녹화</span>
                      </button>
                    </div>

                    {/* 액션 버튼 그룹 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleTransferToGifEditor}
                        disabled={isNavigating}
                        className="py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Wand2 size={16} />
                        <span>{isNavigating ? '편집기로 이동 중...' : '✨ 움짤(GIF)로 만들기'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadVideo}
                        className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download size={16} />
                        <span>영상 파일(WebM) 저장</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
