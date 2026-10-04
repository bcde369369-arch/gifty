'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, Calculator, Link as LinkIcon, ArrowLeft, Plus, X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';
import CoupangBanner from '@/components/CoupangBanner';
import { useSiteSettings } from '@/lib/settings';

interface Schedule {
  id: string;
  title: string;
  visitDate: string;
  deadlineDate: string;
  benefitAmount?: number; // 제공받은 혜택 (식사권/제품 등)
  cashAmount?: number;    // 원고료/지원금 (현금 수익)
  extraExpense?: number;  // 추가 지출 (내돈내산)
}

export default function ExperienceDiary() {
  const { settings, isLoaded } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'sites'>('schedule');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newCash, setNewCash] = useState('');
  const [newExpense, setNewExpense] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('gifty_schedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    }
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  }, []);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadlineDate) return alert('캠페인 이름과 포스팅 마감일은 필수입니다!');

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      title: newTitle,
      visitDate: newVisitDate,
      deadlineDate: newDeadlineDate,
      benefitAmount: newBenefit ? parseInt(newBenefit.replace(/,/g, ''), 10) : 0,
      cashAmount: newCash ? parseInt(newCash.replace(/,/g, ''), 10) : 0,
      extraExpense: newExpense ? parseInt(newExpense.replace(/,/g, ''), 10) : 0,
    };

    const updated = [newSchedule, ...schedules];
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));
    
    // 초기화
    setNewTitle('');
    setNewVisitDate('');
    setNewDeadlineDate('');
    setNewBenefit('');
    setNewCash('');
    setNewExpense('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));
  };

  // 캘린더 로직
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const formatDateString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const filteredSchedules = selectedDate 
    ? schedules.filter(s => s.visitDate === selectedDate || s.deadlineDate === selectedDate)
    : schedules;

  // 금액 계산 (전체 일정 기준)
  const totalBenefit = schedules.reduce((acc, cur) => acc + (cur.benefitAmount || 0), 0);
  const totalCash = schedules.reduce((acc, cur) => acc + (cur.cashAmount || 0), 0);
  const totalExpense = schedules.reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);
  
  // 총 이득 = 혜택 + 지원금 - 초과지출
  const netTotal = totalBenefit + totalCash - totalExpense;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 pb-20">
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
            <a href="/" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">체험단 다이어리 📓</a>
            <a href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">누끼따기(AI) ✂️</a>
            <a href="/guide" className="hover:text-indigo-600 transition-colors text-indigo-600">움짤 꿀팁 📚</a>
          </div>
          <button 
            className="md:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0">
            <a href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</a>
            <a href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</a>
            <a href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</a>
            <a href="/guide" className="text-indigo-600 hover:bg-indigo-50 p-3 rounded-xl">움짤 꿀팁 📚</a>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">블로거를 위한 체험단 다이어리</h1>
            <p className="text-slate-500">일정 관리부터 가계부 작성, 유용한 사이트 모음까지 한 번에 해결하세요!</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-5 py-4 rounded-2xl flex items-center gap-4 border border-indigo-100">
            <div className="bg-white p-3 rounded-xl shadow-sm"><Sparkles size={24} className="text-indigo-500"/></div>
            <div className="text-left">
              <p className="text-sm font-bold text-indigo-500 mb-0.5">총 이득 금액 (순수익)</p>
              <p className="text-2xl font-black">{netTotal.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarIcon size={18} /> 내 일정
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'ledger' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calculator size={18} /> 가계부
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sites' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={18} /> 체험단 모음
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[400px]">
          
          {/* 1. Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">📅 내 일정</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  <Plus size={16} /> 추가
                </button>
              </div>

              {/* Calendar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 select-none">
                <div className="flex justify-between items-center mb-4 px-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronLeft size={20}/></button>
                  <h3 className="font-bold text-lg text-slate-800">{year}년 {month + 1}월</h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronRight size={20}/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                  <div className="text-red-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-400">토</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => {
                    if (!d) return <div key={i} className="aspect-square"></div>;
                    const dateStr = formatDateString(d);
                    const isSelected = selectedDate === dateStr;
                    const isToday = formatDateString(new Date()) === dateStr;
                    
                    const hasVisit = schedules.some(s => s.visitDate === dateStr);
                    const hasDeadline = schedules.some(s => s.deadlineDate === dateStr);

                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all relative ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md' 
                          : isToday ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {d.getDate()}
                        <div className="flex gap-1 mt-1">
                          {hasVisit && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`}></div>}
                          {hasDeadline && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-400'}`}></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">
                    {selectedDate ? `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일 일정` : '전체 일정'}
                  </h3>
                  {selectedDate && (
                    <button onClick={() => setSelectedDate('')} className="text-xs text-indigo-600 font-semibold hover:underline">
                      전체 보기
                    </button>
                  )}
                </div>

                {filteredSchedules.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl py-8 text-center text-slate-400 text-sm border border-slate-100">
                    해당 날짜에 일정이 없습니다.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredSchedules.map((schedule) => {
                      const isDeadlineToday = schedule.deadlineDate === selectedDate;
                      return (
                        <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {isDeadlineToday && <span className="bg-pink-100 text-pink-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">마감일</span>}
                              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{schedule.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                              {schedule.visitDate && (
                                <span className={`flex items-center gap-1 ${schedule.visitDate === selectedDate ? 'text-indigo-600 font-bold' : ''}`}>
                                  <CalendarIcon size={12} /> 방문: {schedule.visitDate}
                                </span>
                              )}
                              <span className={`flex items-center gap-1 ${schedule.deadlineDate === selectedDate ? 'text-pink-600 font-bold' : ''}`}>
                                <CalendarIcon size={12} /> 마감: {schedule.deadlineDate}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(schedule.id)}
                            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors mt-3 md:mt-0 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">💰 쏠쏠한 체험단 가계부</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  + 내역 추가
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                  <p className="text-green-700 text-xs font-bold mb-1">🎁 혜택 (현물)</p>
                  <p className="text-xl font-black text-green-700">+{totalBenefit.toLocaleString()}원</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-blue-700 text-xs font-bold mb-1">💸 지원금 (현금/원고료)</p>
                  <p className="text-xl font-black text-blue-700">+{totalCash.toLocaleString()}원</p>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                  <p className="text-red-700 text-xs font-bold mb-1">💳 초과 지출 (내돈내산)</p>
                  <p className="text-xl font-black text-red-700">-{totalExpense.toLocaleString()}원</p>
                </div>
              </div>

              {/* 가계부 리스트 */}
              <div>
                <h3 className="font-bold text-slate-700 mb-4">상세 내역</h3>
                {schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-slate-400 text-sm">기록된 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{schedule.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{schedule.visitDate || schedule.deadlineDate}</p>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          {(schedule.benefitAmount || 0) > 0 && (
                            <p className="text-xs font-bold text-green-600">혜택 +{schedule.benefitAmount?.toLocaleString()}원</p>
                          )}
                          {(schedule.cashAmount || 0) > 0 && (
                            <p className="text-xs font-bold text-blue-600">지원금 +{schedule.cashAmount?.toLocaleString()}원</p>
                          )}
                          {(schedule.extraExpense || 0) > 0 && (
                            <p className="text-xs font-bold text-red-500">지출 -{schedule.extraExpense?.toLocaleString()}원</p>
                          )}
                          {!schedule.benefitAmount && !schedule.extraExpense && !schedule.cashAmount && (
                            <p className="text-xs text-slate-400 font-medium">금액 미입력</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                
                <a href="https://강남맛집.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-orange-50 group-hover:text-orange-500">
                    강남
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-orange-600">강남맛집</h3>
                    <p className="text-xs text-slate-500 mt-1">블로거 필수 맛집 체험단</p>
                  </div>
                </a>

                <a href="https://www.supermembers.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-emerald-50 group-hover:text-emerald-500">
                    슈퍼
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-600">슈퍼멤버스</h3>
                    <p className="text-xs text-slate-500 mt-1">예약 없이 앱으로 바로 할인 혜택</p>
                  </div>
                </a>

                <a href="https://www.reviewnote.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-sky-50 group-hover:text-sky-500">
                    리뷰
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-sky-600">리뷰노트</h3>
                    <p className="text-xs text-slate-500 mt-1">최근 가장 핫한 신흥 체험단</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 쿠팡 파트너스 광고 배너 영역 */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="mt-10 mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center overflow-hidden">
            <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider self-start">AD</p>
            <div className="w-full max-w-[680px]">
              {settings.coupangBannerHtml && (
                <div className="hidden md:block w-full">
                  <CoupangBanner htmlCode={settings.coupangBannerHtml} />
                </div>
              )}
              {settings.coupangBannerHtmlMobile && (
                <div className="md:hidden w-full">
                  <CoupangBanner htmlCode={settings.coupangBannerHtmlMobile} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 일정 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">새 체험단 등록</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule} className="flex flex-col gap-4">
              {/* 기본 정보 */}
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-indigo-500 mb-3 tracking-wide">기본 정보</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">체험단(캠페인) 이름 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="예: 강남역 OOO 맛집"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">방문/예약일</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newVisitDate}
                        onChange={(e) => setNewVisitDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">포스팅 마감일 <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newDeadlineDate}
                        onChange={(e) => setNewDeadlineDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 가계부 정보 */}
              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50">
                <h4 className="text-xs font-bold text-green-600 mb-3 tracking-wide">가계부 정보 (선택)</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">제공 혜택(현물) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 30000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">지원금(원고료) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 10000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                        value={newCash}
                        onChange={(e) => setNewCash(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">초과 지출 내돈내산 <span className="text-slate-400 font-normal">원</span></label>
                    <input 
                      type="number" 
                      placeholder="예: 5000"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-sm"
                      value={newExpense}
                      onChange={(e) => setNewExpense(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
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
