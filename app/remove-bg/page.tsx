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
  const [imglyLoaded, setImglyLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load imgly script from CDN
    if ((window as any).imglyRemoveBackground) {
      setImglyLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/imglyRemoveBackground.umd.js';
    script.async = true;
    script.onload = () => setImglyLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      alert('?대?吏 ?뚯씪留??낅줈??媛?ν빀?덈떎. (JPG, PNG ??');
      return;
    }
    
    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setIsProcessing(false);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgressText('AI 紐⑤뜽??遺덈윭?ㅺ퀬 ?덉뒿?덈떎... (理쒖큹 1?뚮뒗 10珥??뺣룄 ?뚯슂?⑸땲??');
    
    try {
      // Configuration for model loading progress
      const config = {
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          if (key.includes('fetch')) {
            setProgressText(`AI 紐⑤뜽 ?ㅼ슫濡쒕뱶 以?.. ${percent}%`);
          } else {
            setProgressText('?대?吏 諛곌꼍??遺꾩꽍?섍퀬 吏?곕뒗 以?..');
          }
        }
      };

      const resultBlob = await (window as any).imglyRemoveBackground(selectedFile, config);
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setProgressText('?꾨즺!');
    } catch (error) {
      console.error(error);
      alert('諛곌꼍 ?쒓굅 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. 釉뚮씪?곗?瑜?理쒖떊 踰꾩쟾?쇰줈 ?낅뜲?댄듃 ?대낫?몄슂.');
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
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} /> ?吏?硫붿씤?쇰줈
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">
            <ImageIcon size={16} /> 100% 臾대즺 ?ъ쭊 ?꾨겮?곌린
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            AI 諛곌꼍 ?쒓굅 (?꾨겮?곌린)
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            ?대┃ ??踰덉쑝濡??ъ쭊??諛곌꼍??源붾걫?섍쾶 吏?뚮낫?몄슂! ?쒕쾭???ъ쭊????λ릺吏 ?딆븘 媛쒖씤?뺣낫媛 100% 蹂댄샇?⑸땲??
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          {!originalUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-80 border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <Upload className="text-indigo-500 mb-4" size={48} />
              <p className="text-lg font-bold text-slate-700">?ш린瑜??대┃?섏뿬 ?ъ쭊???낅줈?쒗븯?몄슂</p>
              <p className="text-sm text-slate-400 mt-2">JPG, PNG ?뚯씪 吏??/p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex flex-col md:flex-row w-full gap-8 justify-center items-center mb-8">
                {/* Original */}
                <div className="flex flex-col items-center w-full md:w-1/2">
                  <span className="text-sm font-bold text-slate-500 mb-2">?먮낯 ?ъ쭊</span>
                  <div className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={originalUrl} alt="?먮낯" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                {/* Result */}
                <div className="flex flex-col items-center w-full md:w-1/2">
                  <span className="text-sm font-bold text-slate-500 mb-2">?꾨겮?곌린 寃곌낵</span>
                  <div 
                    className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px', backgroundColor: '#f8fafc' }}
                  >
                    {resultUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resultUrl} alt="寃곌낵" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span>寃곌낵臾쇱씠 ?ш린???쒖떆?⑸땲??/span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
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
                      disabled={!imglyLoaded}
                      className={`font-bold py-3 px-8 rounded-xl shadow-md transition-transform flex items-center gap-2 ${imglyLoaded ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Sparkles size={18} /> {imglyLoaded ? '諛곌꼍 吏?곌린 ?쒖옉!' : 'AI ?붿쭊 濡쒕뵫 以?..'}
                    </button>
                  )}
                  
                  {resultUrl && (
                    <button 
                      onClick={handleDownload}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Download size={18} /> ?щ챸 PNG濡???ν븯湲?                    </button>
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
                    ?ㅻⅨ ?ъ쭊 怨좊Ⅴ湲?                  </button>
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
