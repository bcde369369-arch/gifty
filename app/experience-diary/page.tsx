'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, Calculator, Link as LinkIcon, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface Schedule {
  id: string;
  title: string;
  visitDate: string;
  deadlineDate: string;
}

export default function ExperienceDiary() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'sites'>('schedule');
  
  // 상태 관리
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');

  // 브라우저 저장소(localStorage)에서 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('gifty_schedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    }
  }, []);

  // 일정 추가 함수
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadlineDate) return alert('캠페인 이름과 포스팅 마감일은 필수입니다!');

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      title: newTitle,
      visitDate: newVisitDate,
      deadlineDate: newDeadlineDate,
    };

    const updated = [newSchedule, ...schedules];
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated)); // 로컬에 저장
    
    // 초기화 및 모달 닫기
    setNewTitle('');
    setNewVisitDate('');
    setNewDeadlineDate('');
    setIsModalOpen(false);
  };

  // 일정 삭제 함수
  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 pb-20">
      {/* Navigation */}
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
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  <Plus size={16} /> 일정 추가
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <CalendarIcon size={32} />
                  </div>
                  <h3 className="text-slate-600 font-semibold">아직 등록된 일정이 없어요.</h3>
                  <p className="text-slate-400 text-sm mt-1">체험단에 당첨되셨다면 방문일과 포스팅 마감일을 등록해보세요!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-bold text-lg text-slate-800">{schedule.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          {schedule.visitDate && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={14} className="text-indigo-400" />
                              방문일: {schedule.visitDate}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={14} className="text-pink-400" />
                            마감일: <strong className="text-pink-500">{schedule.deadlineDate}</strong>
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(schedule.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors self-start md:self-center bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">💰 쏠쏠한 체험단 가계부</h2>
                <button 
                  onClick={() => alert('가계부 추가 기능은 다음 업데이트에 추가됩니다!')}
                  className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
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
                <a href="https://www.revu.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-indigo-50 group-hover:text-indigo-500">
                    REVU
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">레뷰 (REVU)</h3>
                    <p className="text-xs text-slate-500 mt-1">국내 최대 규모, 맛집/뷰티/제품</p>
                  </div>
                </a>

                <a href="https://dinnerqueen.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-pink-50 group-hover:text-pink-500">
                    디너
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-pink-600">디너의여왕</h3>
                    <p className="text-xs text-slate-500 mt-1">맛집 체험단 최강자</p>
                  </div>
                </a>
                
                <a href="https://www.seoulouba.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                    서울
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600">서울오빠</h3>
                    <p className="text-xs text-slate-500 mt-1">초보 블로거도 당첨률 높은 곳</p>
                  </div>
                </a>
                
                <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-500">+ 더 많은 사이트 업데이트 예정</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">새 일정 추가</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">체험단(캠페인) 이름 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="예: 강남역 OOO 맛집"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">방문/예약일 (선택)</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={newVisitDate}
                  onChange={(e) => setNewVisitDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">포스팅 마감일 <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={newDeadlineDate}
                  onChange={(e) => setNewDeadlineDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
