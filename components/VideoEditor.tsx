'use client';

import React, { useRef, useState, useEffect } from 'react';
import { convertToGif } from '@/lib/ffmpeg';
import { Loader2, Download, RotateCcw } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings';

interface VideoEditorProps {
  videoFile: File;
  onReset: () => void;
}

export default function VideoEditor({ videoFile, onReset }: VideoEditorProps) {
  const { settings, isLoaded } = useSiteSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      setDuration(vidDuration);
      setEndTime(Math.min(15, vidDuration));
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setProgress(0);
    setGifUrl(null);
    try {
      const resultDuration = endTime - startTime;
      if (resultDuration > 15) {
        alert('최대 15초까지만 변환 가능합니다.');
        setIsConverting(false);
        return;
      }

      const url = await convertToGif(videoFile, startTime, resultDuration, (ratio) => {
        setProgress(Math.round(ratio * 100));
      });
      setGifUrl(url);
    } catch (error: unknown) {
      console.error('Conversion failed', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`변환 중 오류가 발생했습니다: ${errorMessage}\n(브라우저가 지원하지 않거나 파일이 너무 클 수 있습니다)`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 편집 및 변환
        </h3>
        <button onClick={onReset} className="text-slate-400 hover:text-slate-600 p-1">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-inner ring-1 ring-slate-900/10">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>

      {!gifUrl && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>시작: {startTime.toFixed(1)}초</span>
              <span className="text-indigo-600">선택 구간: {(endTime - startTime).toFixed(1)}초</span>
              <span>끝: {endTime.toFixed(1)}초</span>
            </div>
            <div className="relative pt-2 pb-2">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 rounded-full -translate-y-1/2"></div>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val < endTime) setStartTime(val);
                }}
                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-md z-20"
              />
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={endTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val > startTime && (val - startTime) <= 15) setEndTime(val);
                }}
                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fuchsia-500 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-md z-30"
              />
            </div>
            <p className="text-xs text-center text-slate-400 mt-1">* 15초 이상은 선택되지 않습니다.</p>
          </div>

          {isConverting ? (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-sm font-bold text-indigo-700">
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> 마법 부리는 중... (조금만 기다려주세요)
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-3 rounded-full transition-all duration-300 ease-out relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConvert}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              마법처럼 움짤 만들기 🪄
            </button>
          )}
        </div>
      )}

      {gifUrl && (
        <div className="flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-500 pt-4 border-t border-slate-100 mt-2">
          <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full mb-2">
            완성되었습니다!
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gifUrl} alt="Converted GIF" className="max-w-full h-auto max-h-[200px] rounded-lg shadow-md border border-slate-200" />
          
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              다시 만들기
            </button>
            <a
              href={gifUrl}
              download="gifty.gif"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <Download size={18} /> 다운로드
            </a>
          </div>

          {/* Square Affiliate Banner (Replaces AdSense temporarily) */}
          <a
            href={isLoaded ? settings.affiliateLink : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500 opacity-20 rounded-full blur-2xl transform -translate-x-5 translate-y-5 group-hover:opacity-40 transition-opacity"></div>
            
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-300 mb-3 bg-indigo-950 px-2 py-1 rounded">SPONSOR</span>
            <h4 className="text-xl font-extrabold text-center mb-2 leading-tight">숏폼 떡상 비결? 🚀</h4>
            <p className="text-sm text-indigo-200 text-center mb-6 leading-relaxed">
              요즘 대세 편집 앱 <strong>CapCut Pro</strong><br/> 워터마크 없이 프로처럼 편집하세요!
            </p>
            <div className="bg-white text-indigo-900 font-bold px-6 py-2.5 rounded-full text-sm group-hover:bg-indigo-50 transition-colors shadow-md">
              무료 시작하기
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
