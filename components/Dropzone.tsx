'use client';

import { UploadCloud, FileVideo, Video, Crop } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onOpenRecord?: () => void;
}

export default function Dropzone({ onFileSelect, onOpenRecord }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert('동영상 파일만 업로드 가능합니다!');
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative w-full p-6 md:p-8 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out text-center cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50 shadow-inner'
          : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'
      }`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="relative pointer-events-none mb-3.5">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-60 scale-150"></div>
        <div className="relative w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center text-indigo-600 rotate-[-5deg]">
          <UploadCloud size={34} />
        </div>
      </div>
      
      <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1.5">동영상을 여기로 끌어다 놓으세요</h3>
      <p className="text-xs md:text-sm font-medium text-slate-500 mb-4 max-w-[280px]">
        MP4, WebM 등 대부분의 형식을 지원합니다. (최대 100MB)
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-2 relative z-20">
        <div className="px-5 py-2 bg-indigo-600 text-white text-xs md:text-sm font-bold rounded-full shadow-md hover:bg-indigo-700 transition-colors pointer-events-none flex items-center gap-2">
          <FileVideo size={16} />
          파일 선택하기
        </div>
        {onOpenRecord && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecord();
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs md:text-sm font-black rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Crop size={15} />
            <span>🎯 원하는 영역 지정 녹화</span>
          </button>
        )}
      </div>
    </div>
  );
}
