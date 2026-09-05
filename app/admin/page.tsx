'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteSettings } from '@/lib/settings';
import { Save, LogOut, LayoutDashboard, Link as LinkIcon, Type } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { settings, saveSettings, isLoaded } = useSiteSettings();
  
  // Local state for the form
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('gifty_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    if (isLoaded) setFormData(settings);
  }, [isLoaded, settings]);

  const handleSave = () => {
    setIsSaving(true);
    saveSettings(formData);
    setTimeout(() => {
      setIsSaving(false);
      alert('설정이 성공적으로 저장되었습니다!');
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('gifty_admin_auth');
    router.push('/');
  };

  if (!isLoaded) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Admin Navbar */}
      <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <LayoutDashboard size={24} className="text-indigo-400" />
          Gifty Admin
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-sm font-medium hover:text-indigo-300">내 사이트 보기</Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium hover:text-pink-300">
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">사이트 설정</h1>
            <p className="text-slate-500 mt-2">이곳에서 변경한 텍스트와 링크는 사이트에 실시간으로 즉시 반영됩니다.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save size={20} /> {isSaving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Main Hero Section Settings */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
              <Type size={20} /> 메인 화면 텍스트 설정
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">타이틀 위 강조 문구 (배지)</label>
                <input
                  type="text"
                  value={formData.heroTagline}
                  onChange={(e) => setFormData({...formData, heroTagline: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">예: "오늘 단 하루! 서버비 무료 이벤트", "100% 무료 GIF 메이커"</p>
              </div>
            </div>
          </section>

          {/* Affiliate Banner Settings */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
              <LinkIcon size={20} /> 제휴 마케팅 배너 설정 (하단)
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">배너 제목</label>
                <input
                  type="text"
                  value={formData.affiliateTitle}
                  onChange={(e) => setFormData({...formData, affiliateTitle: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">배너 설명글</label>
                <textarea
                  value={formData.affiliateSubtitle}
                  onChange={(e) => setFormData({...formData, affiliateSubtitle: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">도착 URL 링크 (레퍼럴 링크)</label>
                <input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">유저가 이 링크를 클릭하면 대표님께 수익이 돌아갑니다.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
