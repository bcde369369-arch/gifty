'use client';

import React, { useRef, useState, useEffect } from 'react';
import { convertToGif } from '@/lib/ffmpeg';
import { Loader2, Download, RotateCcw } from 'lucide-react';

interface VideoEditorProps {
  videoFile: File;
  onReset: () => void;
}

export default function VideoEditor({ videoFile, onReset }: VideoEditorProps) {
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
    } catch (error) {
      console.error(error);
      alert('변환 중 오류가 발생했습니다.');
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

          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          >
            {isConverting ? (
              <>
                <Loader2 className="animate-spin" /> 변환 중... {progress}%
              </>
            ) : (
              '마법처럼 움짤 만들기 🪄'
            )}
          </button>
        </div>
      )}

      {gifUrl && (
        <div className="flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-500 pt-4 border-t border-slate-100 mt-2">
          <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full mb-2">
            완성되었습니다!
          </div>
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
            <button
              onClick={() => alert('후원 계좌(토스): 123-4567-8901 \n\n소중한 후원 감사합니다! 커피 맛있게 먹고 더 좋은 사이트로 업데이트 할게요💖')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 shadow-sm transition-all"
            >
              ☕ 칭찬하기
            </button>
          </div>

          {/* Square Ad Placeholder */}
          <div className="w-full mt-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-400">
            <span className="text-xs uppercase tracking-widest font-bold mb-2">Advertisement</span>
            <span className="text-sm text-center">구글 애드센스 사각형 배너 영역 <br/>(다운로드 후 사용자 시선 집중)</span>
          </div>
        </div>
      )}
    </div>
  );
}
