'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock, CheckCircle2, ShieldCheck, Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('기능 건의');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      alert('이메일과 문의 내용을 입력해 주세요.');
      return;
    }

    // mailto 링크 생성 후 실행
    const bodyText = `이름: ${name || '익명'}\n회신 이메일: ${email}\n문의 유형: ${subject}\n\n문의 내용:\n${message}`;
    const mailtoUrl = `mailto:contact@gifty.run?subject=${encodeURIComponent(`[Gifty 문의] ${subject} - ${name || '사용자'}`)}&body=${encodeURIComponent(bodyText)}`;
    
    window.location.href = mailtoUrl;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> 메인으로 돌아가기
          </Link>
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/about" className="hover:text-indigo-600 transition-colors">서비스 소개</Link>
            <Link href="/guide" className="hover:text-indigo-600 transition-colors">꿀팁 가이드</Link>
            <Link href="/legal" className="hover:text-indigo-600 transition-colors">이용약관</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full space-y-10">
        {/* Header */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-bold rounded-full">
            <Mail size={16} /> 문의 및 제휴 · Contact Us
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Gifty 팀에게 연락하기
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            새로운 기능 제안, 오류 제보, 비즈니스 협력 등 창작자 여러분의 모든 목소리를 기다립니다.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">공식 고객지원 이메일</h2>
                  <p className="text-xs text-slate-400">Official Contact</p>
                </div>
              </div>
              <p className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50/50 p-3 rounded-xl break-all">
                contact@gifty.run
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                이메일 클라이언트가 설치되어 있지 않다면 위 주소로 직접 메일을 보내주셔도 동일하게 접수됩니다.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Clock size={18} />
                <span>답변 소요 시간 안내</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                접수된 문의는 <strong>영업일 기준 24시간~48시간 이내</strong>에 담당 엔지니어 및 에디터팀이 검토 후 답변을 발송합니다.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <ShieldCheck size={18} className="text-indigo-600" />
                <span>개인정보 보호 안내</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                문의 처리를 위해 수집된 이메일과 이름은 상담 목적 이외의 마케팅 용도로 절대 활용되지 않으며, 문의 종료 후 안전하게 파기됩니다.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">문의가 접수되었습니다!</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    메일 프로그램으로 문의 내용이 전달되었습니다. 신속하고 꼼꼼하게 검토 후 기재해주신 이메일로 회신드리겠습니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    새 문의 작성하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-600" />
                    문의 접수 양식
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">이름 또는 닉네임</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      회신받으실 이메일 주소 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">문의 유형</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="기능 건의">💡 새로운 기능 추가 제안</option>
                      <option value="버그 제보">⚠️ 변환 오류 및 버그 제보</option>
                      <option value="광고 및 제휴 문의">🤝 비즈니스 및 파트너십 문의</option>
                      <option value="기타 문의">💬 기타 문의사항</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      문의 내용 <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="자세한 문의 내용 또는 오류가 발생한 브라우저 환경(기기명, 크롬/사파리 버전 등)을 적어주시면 더 신속한 처리가 가능합니다."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>문의 메일 발송하기</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs space-y-3">
          <div className="flex justify-center gap-6 font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">홈</Link>
            <Link href="/about" className="hover:text-white transition-colors">서비스 소개</Link>
            <Link href="/guide" className="hover:text-white transition-colors">꿀팁 가이드</Link>
            <Link href="/contact" className="text-indigo-400 font-bold">문의하기</Link>
            <Link href="/legal" className="hover:text-white transition-colors">이용약관 및 개인정보처리방침</Link>
          </div>
          <p>© 2026 Gifty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
