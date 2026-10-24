'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  PenTool, 
  Search, 
  X, 
  Trash2, 
  Send, 
  Menu, 
  MessageCircle,
  Clock
} from 'lucide-react';
import { 
  Post, 
  Comment, 
  CATEGORIES, 
  CATEGORY_LABELS, 
  getPosts, 
  savePosts 
} from '@/lib/community';
import CoupangBanner from '@/components/CoupangBanner';
import { useSiteSettings } from '@/lib/settings';

export default function CommunityPage() {
  const { settings, isLoaded } = useSiteSettings();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 글쓰기 폼 상태
  const [newCategory, setNewCategory] = useState<Post['category']>('free');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newContent, setNewContent] = useState('');

  // 댓글 폼 상태
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    const loaded = getPosts();
    setPosts(loaded);

    const draftStr = sessionStorage.getItem('gifty_community_draft');
    if (draftStr) {
      sessionStorage.removeItem('gifty_community_draft');
      try {
        const draft = JSON.parse(draftStr);
        if (draft.category) setNewCategory(draft.category);
        if (draft.title) setNewTitle(draft.title);
        if (draft.author) setNewAuthor(draft.author);
        if (draft.content) setNewContent(draft.content);
        setIsWriteModalOpen(true);
      } catch (e) {
        console.warn('Failed to parse community draft', e);
      }
    }
  }, []);

  // 글 작성 핸들러
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) {
      alert('제목, 작성자, 내용을 모두 입력해 주세요!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: newAuthor.trim(),
      password: newPassword.trim() || '1234',
      views: 1,
      likes: 0,
      comments: [],
      createdAt: dateStr
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);

    // 초기화
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setNewPassword('');
    setIsWriteModalOpen(false);
    alert('게시글이 성공적으로 등록되었습니다!');
  };

  // 상세 보기 및 조회수 증가
  const handleOpenPost = (post: Post) => {
    const updated = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p);
    setPosts(updated);
    savePosts(updated);
    setSelectedPost({ ...post, views: post.views + 1 });
  };

  // 추천(좋아요) 핸들러
  const handleLikePost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    });
    setPosts(updated);
    savePosts(updated);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
    }
  };

  // 글 삭제 핸들러
  const handleDeletePost = (postId: string) => {
    const inputPw = prompt('글 작성 시 입력한 비밀번호(4자리)를 입력해주세요:');
    if (inputPw === null) return;

    const target = posts.find(p => p.id === postId);
    if (!target) return;

    if (target.password && target.password !== inputPw && inputPw !== 'admin999') {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    savePosts(updated);
    setSelectedPost(null);
    alert('게시글이 삭제되었습니다.');
  };

  // 댓글 등록 핸들러
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentAuthor.trim() || !commentContent.trim()) {
      alert('닉네임과 댓글 내용을 입력해주세요!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: commentAuthor.trim(),
      content: commentContent.trim(),
      createdAt: dateStr
    };

    const updatedPosts = posts.map(p => {
      if (p.id === selectedPost.id) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, newComment]
    });

    setCommentContent('');
  };

  // 필터링된 게시글
  const filteredPosts = posts.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/community" className="text-indigo-600 font-extrabold flex items-center gap-1">
              커뮤니티 💬 <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            </Link>
            <Link href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">체험단 다이어리 📓</Link>
            <Link href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">누끼따기(AI) ✂️</Link>
            <Link href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">블로그 스티커 🎨</Link>
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
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0 z-50">
            <Link href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</Link>
            <Link href="/community" className="text-indigo-600 bg-indigo-50 p-3 rounded-xl">커뮤니티 💬</Link>
            <Link href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</Link>
            <Link href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</Link>
            <Link href="/sticker" className="text-pink-600 hover:bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold mb-3 border border-indigo-400/20">
                <MessageSquare size={13} /> 블로거 & 크리에이터 소통 광장
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                Gifty 커뮤니티 💬
              </h1>
              <p className="text-indigo-200 text-sm md:text-base max-w-xl leading-relaxed">
                체험단 정산 인증, 블로그 지수 상승 꿀팁, 나만의 멋진 움짤 공유부터 Gifty 기능 건의까지 자유롭게 소통해보세요!
              </p>
            </div>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="self-start md:self-auto flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
            >
              <PenTool size={18} /> 새 글 쓰기
            </button>
          </div>
        </div>

        {/* Categories & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="제목, 내용, 작성자 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {/* Post List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-base font-bold mb-1">등록된 게시글이 없습니다.</p>
              <p className="text-xs">첫 번째 글의 주인공이 되어보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPosts.map(post => (
                <article
                  key={post.id}
                  onClick={() => handleOpenPost(post)}
                  className="p-5 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                      {post.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          {post.badge}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={12} /> {post.createdAt.split(' ')[0]}
                      </span>
                    </div>

                    <h2 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                      {post.title}
                    </h2>

                    <p className="text-xs md:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Metadata Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 self-end md:self-center">
                    <span className="text-slate-600 font-bold">{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {post.views}
                    </span>
                    <span className="flex items-center gap-1 text-pink-500">
                      <ThumbsUp size={14} /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                      <MessageCircle size={14} /> {post.comments.length}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Coupang Banner */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="mb-12 flex justify-center">
            {settings.coupangBannerHtml && (
              <div className="hidden md:flex max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
                <CoupangBanner htmlCode={settings.coupangBannerHtml} />
              </div>
            )}
            {settings.coupangBannerHtmlMobile && (
              <div className="flex md:hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-2 justify-center">
                <CoupangBanner htmlCode={settings.coupangBannerHtmlMobile} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* 글 상세 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {CATEGORY_LABELS[selectedPost.category]}
                  </span>
                  <span className="text-xs text-slate-400">{selectedPost.createdAt}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                  <span>작성자: <strong>{selectedPost.author}</strong></span>
                  <span>조회 {selectedPost.views}</span>
                  <span>추천 {selectedPost.likes}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 flex-grow">
              <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line mb-8 min-h-[120px]">
                {selectedPost.content}
              </div>

              {/* Actions (Like / Delete) */}
              <div className="flex justify-between items-center py-4 border-y border-slate-100 mb-8">
                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-extrabold text-sm transition-colors active:scale-95 shadow-sm"
                >
                  <ThumbsUp size={16} /> 추천 {selectedPost.likes}
                </button>
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                >
                  <Trash2 size={14} /> 글 삭제
                </button>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                  댓글 <span>({selectedPost.comments.length})</span>
                </h3>

                {/* Comment List */}
                <div className="space-y-3 mb-6">
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">첫 번째 댓글을 남겨보세요!</p>
                  ) : (
                    selectedPost.comments.map(c => (
                      <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-slate-800">{c.author}</span>
                          <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input Form */}
                <form onSubmit={handleAddComment} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input 
                    type="text" 
                    placeholder="닉네임 (예: 맛집탐험가)"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <div className="flex gap-2">
                    <textarea 
                      placeholder="따뜻한 댓글 한마디를 남겨주세요."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-medium"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새 글 작성 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">새 글 작성 ✍️</h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">카테고리 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['settlement', 'meme', 'tips', 'feedback', 'free'] as Post['category'][]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                        newCategory === cat 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author & Password */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">작성자 닉네임 <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    placeholder="예: 초보블로거"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">삭제 비밀번호 <span className="text-slate-400 font-normal">(4자리)</span></label>
                  <input 
                    type="password"
                    maxLength={8}
                    placeholder="예: 1234"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">글 제목 <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="제목을 입력해 주세요"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">본문 내용 <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={6}
                  placeholder="내용을 자유롭게 작성해 주세요. (체험단 후기, 움짤 사용 팁, 질문 등)"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md text-sm"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
