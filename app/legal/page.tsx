'use client';

import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, Code } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Header */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold">
            <ArrowLeft size={18} /> 메인으로 돌아가기
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">법적 고지 및 이용약관</h1>
        <p className="text-slate-500 mb-12">최종 수정일: 2026년 9월 5일</p>

        <div className="space-y-12">
          {/* Privacy Policy */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">개인정보처리방침 (Privacy Policy)</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                <strong>1. 100% 로컬 처리 원칙:</strong> Gifty는 사용자의 동영상, 이미지, 생성된 GIF 파일을 포함한 어떠한 미디어 파일도 당사의 서버로 전송, 수집, 또는 저장하지 않습니다. 모든 변환 작업은 사용자의 웹 브라우저(WebAssembly 기술) 내에서 안전하게 로컬로 처리됩니다. 따라서 개인 민감 정보 유출의 위험이 없습니다.
              </p>
              <p>
                <strong>2. 쿠키(Cookie) 및 제3자 도구 사용:</strong> 본 웹사이트는 서비스 품질 향상 및 맞춤형 광고 제공을 위해 구글 애드센스(Google AdSense)와 같은 제3자 광고 플랫폼을 사용합니다. 구글을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자가 당사 웹사이트 또는 다른 웹사이트를 이전에 방문한 내역을 기반으로 광고를 게재할 수 있습니다. 사용자는 언제든지 브라우저 설정을 통해 쿠키를 거부할 수 있습니다.
              </p>
              <p>
                <strong>3. 개인정보 수집 항목:</strong> 본 서비스는 회원가입을 요구하지 않으며, 이메일, 이름, 연락처 등의 어떠한 식별 가능한 개인정보도 직접 수집하지 않습니다.
              </p>
            </div>
          </section>

          {/* Terms of Service */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">이용약관 (Terms of Service)</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                <strong>1. 서비스의 목적:</strong> Gifty는 사용자가 소유한 동영상을 GIF 이미지로 변환할 수 있는 무료 웹 도구를 제공합니다.
              </p>
              <p>
                <strong>2. 사용자의 책임:</strong> 본 서비스를 이용하여 저작권 침해, 불법, 음란, 혐오 표현 등을 포함한 영상을 변환하거나 유포하는 행위는 엄격히 금지됩니다. 사용자가 변환한 결과물(GIF)로 인해 발생하는 모든 법적, 도의적 책임은 전적으로 사용자 본인에게 있으며, Gifty는 이에 대해 어떠한 책임도 지지 않습니다.
              </p>
              <p>
                <strong>3. 서비스 보증 한계:</strong> 본 서비스는 &quot;있는 그대로&quot; 제공되며, 브라우저 환경이나 기기 사양에 따라 변환 속도 및 결과물의 품질이 다를 수 있습니다. Gifty는 서비스의 무중단, 오류 없음을 법적으로 보증하지 않습니다.
              </p>
            </div>
          </section>

          {/* Open Source Licenses */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <Code size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">오픈소스 라이선스 고지</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                본 서비스는 뛰어난 오픈소스 프로젝트들의 지원을 받아 제작되었습니다. 원작자들의 헌신에 감사드립니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <li>
                  <strong>FFmpeg & FFmpeg.wasm:</strong> 이 서비스의 핵심 동영상 처리 기술은 FFmpeg (https://ffmpeg.org/) 및 @ffmpeg/wasm 을 사용합니다. FFmpeg는 LGPL(GNU Lesser General Public License) 및 GPL 라이선스를 따르며, FFmpeg.wasm 래퍼는 MIT 라이선스를 따릅니다.
                </li>
                <li>
                  <strong>Next.js & React:</strong> 프론트엔드 프레임워크 (MIT License)
                </li>
                <li>
                  <strong>Tailwind CSS:</strong> 스타일링 프레임워크 (MIT License)
                </li>
                <li>
                  <strong>Lucide:</strong> UI 아이콘 라이브러리 (ISC License)
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
