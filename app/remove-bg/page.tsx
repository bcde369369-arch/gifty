'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Upload, Download, Loader2, Image as ImageIcon } from 'lucide-react';

export default function RemoveBg() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [tfLoaded, setTfLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segmenterRef = useRef<any>(null);

  useEffect(() => {
    // Load transformers.js dynamically from CDN via script
    const loadTransformers = async () => {
      if ((window as any).TransformersPipeline) {
        setTfLoaded(true);
      }
    };
    
    // We can't use native import() for external HTTP URLs in Next.js build easily.
    // So we inject a module script!
    if (!(window as any).TransformersPipeline && !document.getElementById('tf-script')) {
      const script = document.createElement('script');
      script.id = 'tf-script';
      script.type = 'module';
      script.textContent = `
        import { pipeline, env, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js';
        window.TransformersPipeline = pipeline;
        window.TransformersEnv = env;
        window.TransformersRawImage = RawImage;
        window.dispatchEvent(new Event('transformers-loaded'));
      `;
      document.body.appendChild(script);
      
      window.addEventListener('transformers-loaded', () => {
        const env = (window as any).TransformersEnv;
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        setTfLoaded(true);
      });
    } else if ((window as any).TransformersPipeline) {
      setTfLoaded(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다. (JPG, PNG 등)');
      return;
    }
    
    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setIsProcessing(false);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile || !originalUrl || !tfLoaded) return;
    
    setIsProcessing(true);
    setProgressText('AI 엔진 준비 중...');
    
    try {
      if (!segmenterRef.current) {
        setProgressText('AI 모델 다운로드 중... (최초 1회 약 150MB)');
        const pipeline = (window as any).TransformersPipeline;
        segmenterRef.current = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          progress_callback: (info: any) => {
            if (info.status === 'progress') {
              setProgressText(`AI 모델 다운로드 중... ${Math.round(info.progress)}%`);
            }
          }
        });
      }

      setProgressText('배경 지우는 중... (약 2~5초 소요)');
      
      const RawImage = (window as any).TransformersRawImage;
      const img = await RawImage.fromURL(originalUrl);
      
      const result = await segmenterRef.current(img);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let maskImage: any;
      if (Array.isArray(result) && result.length > 0) {
        maskImage = result[0].mask;
      } else if (result.mask) {
        maskImage = result.mask;
      } else {
        throw new Error("No mask found");
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas 2D context not supported");

      const origHtmlImg = new Image();
      origHtmlImg.src = originalUrl;
      await new Promise(resolve => { origHtmlImg.onload = resolve; });
      ctx.drawImage(origHtmlImg, 0, 0);

      ctx.globalCompositeOperation = 'destination-in';
      
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = maskImage.width;
      maskCanvas.height = maskImage.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error("Mask canvas context not supported");
      
      const maskData = new ImageData(maskCanvas.width, maskCanvas.height);
      const pixelCount = maskCanvas.width * maskCanvas.height;
      
      if (maskImage.channels === 1) {
        for (let i = 0; i < pixelCount; i++) {
          maskData.data[i * 4] = maskImage.data[i];
          maskData.data[i * 4 + 1] = maskImage.data[i];
          maskData.data[i * 4 + 2] = maskImage.data[i];
          maskData.data[i * 4 + 3] = maskImage.data[i]; 
        }
      } else {
        const hasAlpha = maskImage.channels === 4;
        for (let i = 0; i < pixelCount; i++) {
          maskData.data[i * 4] = maskImage.data[i * maskImage.channels];
          maskData.data[i * 4 + 1] = maskImage.data[i * maskImage.channels + 1];
          maskData.data[i * 4 + 2] = maskImage.data[i * maskImage.channels + 2];
          maskData.data[i * 4 + 3] = hasAlpha ? maskImage.data[i * maskImage.channels + 3] : maskImage.data[i * maskImage.channels];
        }
      }
      
      maskCtx.putImageData(maskData, 0, 0);
      ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL('image/png');
      setResultUrl(url);
      setProgressText('완료!');
      
    } catch (error) {
      console.error(error);
      alert('배경 제거 중 오류가 발생했습니다. 브라우저를 최신 버전으로 업데이트 해보세요.');
      setProgressText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `gifty-nukki-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
            <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} /> 움짤 메인으로
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">
            <ImageIcon size={16} /> 100% 무료 사진 누끼따기
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            AI 배경 제거 (누끼따기)
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            클릭 한 번으로 사진의 배경을 깔끔하게 지워보세요! 서버에 사진이 저장되지 않아 개인정보가 100% 보호됩니다.
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          {!originalUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-80 border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <Upload className="text-indigo-500 mb-4" size={48} />
              <p className="text-lg font-bold text-slate-700">여기를 클릭하여 사진을 업로드하세요</p>
              <p className="text-sm text-slate-400 mt-2">JPG, PNG 파일 지원</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex flex-col md:flex-row w-full gap-8 justify-center items-center mb-8">
                <div className="flex flex-col items-center w-full md:w-1/2">
                  <span className="text-sm font-bold text-slate-500 mb-2">원본 사진</span>
                  <div className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={originalUrl} alt="원본" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                <div className="flex flex-col items-center w-full md:w-1/2">
                  <span className="text-sm font-bold text-slate-500 mb-2">누끼따기 결과</span>
                  <div 
                    className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px', backgroundColor: '#f8fafc' }}
                  >
                    {resultUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resultUrl} alt="결과" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span>결과물이 여기에 표시됩니다</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center w-full">
                {isProcessing && (
                  <div className="w-full bg-indigo-50 text-indigo-700 py-3 px-4 rounded-xl flex items-center justify-center gap-3 mb-6 font-medium">
                    <Loader2 className="animate-spin" size={20} />
                    {progressText}
                  </div>
                )}
                
                <div className="flex gap-4 flex-wrap justify-center">
                  {!resultUrl && !isProcessing && (
                    <button 
                      onClick={handleRemoveBackground}
                      disabled={!tfLoaded}
                      className={`font-bold py-3 px-8 rounded-xl shadow-md transition-transform flex items-center gap-2 ${tfLoaded ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Sparkles size={18} /> {tfLoaded ? '배경 지우기 시작!' : 'AI 엔진 로딩 중...'}
                    </button>
                  )}
                  
                  {resultUrl && (
                    <button 
                      onClick={handleDownload}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Download size={18} /> 투명 PNG로 저장하기
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      setSelectedFile(null);
                      setOriginalUrl(null);
                      setResultUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    다른 사진 고르기
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </main>
      
      <div className="mt-auto"></div>
    </div>
  );
}
