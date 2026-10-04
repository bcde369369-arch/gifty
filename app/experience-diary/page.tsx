'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar as CalendarIcon, Calculator, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExperienceDiary() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'sites'>('schedule');

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 pb-20">
      {/* Navigation - simplified version of main nav */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                체험단 다이어리 📓
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">누끼따기 ✂️</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">블로거를 위한 체험단 다이어리</h1>
            <p className="text-slate-500">일정 관리부터 가계부 작성, 유용한 사이트 모음까지 한 번에 해결하세요!</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm"><Sparkles size={18} className="text-indigo-500"/></div>
            <div className="text-left">
              <p className="text-xs font-bold text-indigo-400">이번 달 절약 금액</p>
              <p className="text-lg font-black">0 원</p>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'schedule' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarIcon size={18} /> 내 일정
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'ledger' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calculator size={18} /> 가계부
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sites' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={18} /> 체험단 모음
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[400px]">
          
          {/* 1. Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">📅 이번 달 내 일정</h2>
                <button className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
                  + 일정 추가
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <CalendarIcon size={32} />
                </div>
                <h3 className="text-slate-600 font-semibold">아직 등록된 일정이 없어요.</h3>
                <p className="text-slate-400 text-sm mt-1">체험단에 당첨되셨다면 방문일과 포스팅 마감일을 등록해보세요!</p>
              </div>
            </div>
          )}

          {/* 2. Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">💰 쏠쏠한 체험단 가계부</h2>
                <button className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
                  + 내역 추가
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <p className="text-green-600 text-sm font-bold mb-1">총 혜택 받은 금액</p>
                  <p className="text-2xl font-black text-green-700">0원</p>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <p className="text-red-600 text-sm font-bold mb-1">초과 지출한 내돈내산</p>
                  <p className="text-2xl font-black text-red-700">0원</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-slate-400 text-sm">아직 기록된 가계부 내역이 없습니다.</p>
              </div>
            </div>
          )}

          {/* 3. Sites List Tab */}
          {activeTab === 'sites' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">🔗 체험단 사이트 모음</h2>
                <p className="text-slate-500 text-sm mt-1">매일 새로운 캠페인을 확인하고 신청해보세요!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example Site Cards */}
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-indigo-50 group-hover:text-indigo-500">
                    로고
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">레뷰 (REVU)</h3>
                    <p className="text-xs text-slate-500 mt-1">국내 최대 규모, 맛집/뷰티/제품</p>
                  </div>
                </a>

                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-pink-50 group-hover:text-pink-500">
                    로고
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-pink-600">디너의여왕</h3>
                    <p className="text-xs text-slate-500 mt-1">맛집 체험단 최강자</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                    로고
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600">서울오빠</h3>
                    <p className="text-xs text-slate-500 mt-1">초보 블로거도 당첨률 높은 곳</p>
                  </div>
                </a>
                
                {/* Add a prompt to suggest more sites */}
                <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-500">+ 더 많은 사이트 업데이트 예정</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
