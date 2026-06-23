import React, { useState, useEffect } from "react";
import { SubjectId } from "./types";
import SyllabusView from "./components/SyllabusView";
import QuizView from "./components/QuizView";
import FlashcardView from "./components/FlashcardView";
import TutorView from "./components/TutorView";
import ReviewDeckView from "./components/ReviewDeckView";
import AuthInterface from "./components/AuthInterface";
import { User as FirebaseUser } from "firebase/auth";
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Calendar, 
  User, 
  Award, 
  CheckCircle, 
  Clock, 
  GraduationCap, 
  HeartPulse,
  Bookmark,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  ShieldCheck,
  Bell
} from "lucide-react";

type ActiveTab = "syllabus" | "quiz" | "flashcard" | "tutor" | "deck";
type ViewMode = "mobile" | "desktop";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("syllabus");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | null>(null);
  
  // Custom Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App vs Desktop Layout mode
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  // Dynamic system clock inside Mobile Screen
  const [phoneTime, setPhoneTime] = useState("21:35");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setPhoneTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // When a user selects "进行本章真题仿真练" from Syllabus, we jump straight to Quiz view with filters
  const handleSelectSubjectForQuiz = (subId: SubjectId) => {
    setSelectedSubjectFilter(subId);
    setActiveTab("quiz");
  };

  // Switch tabs cleanly, resetting filter unless navigating to quiz
  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== "quiz") {
      setSelectedSubjectFilter(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-gray-800 flex flex-col antialiased selection:bg-emerald-600 selection:text-white" id="app-root">
      
      {/* Top Universal Control/Info bar */}
      <div className="bg-slate-950 text-gray-300 text-xs py-3 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-slate-800/60 z-50 shadow-md shrink-0" id="universal-header-switcher">
        <div className="flex items-center gap-2" id="switcher-brand">
          <HeartPulse className="w-5 h-5 text-emerald-500 animate-pulse" />
          <span className="font-bold text-white tracking-tight">👩‍⚕️ 护理硕士 (308 护理综合) 伴学特训辅助舱</span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-950">
            艾宾浩斯终身抗阻
          </span>
        </div>

        {/* High-Contrast Interactive Slider to switch between Desktop/Mobile View */}
        <div className="flex items-center gap-3" id="controller-view-btns">
          <span className="text-[11px] text-gray-400 font-medium">切换视图模式：</span>
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-850 flex gap-1 shadow-inner" id="view-mode-pill">
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "mobile" 
                  ? "bg-emerald-600 text-white shadow-md scale-102" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 APP 极简手机版</span>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "desktop" 
                  ? "bg-emerald-605 text-white bg-emerald-600 shadow-md scale-102" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>💻 PC 黄金宽屏版</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER MODE A: PORTABLE PHONE IMMERSIVE DESIGN MOCKUP */}
      {viewMode === "mobile" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden relative" id="mobile-mockup-wrapper">
          
          {/* Backdrop decorative lights */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[20%] left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Core realistic iPhone-pro Device Bezel Wrapper */}
          <div className="w-full max-w-[405px] h-[835px] bg-slate-950 rounded-[3.3rem] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[10px] border-slate-800 flex flex-col relative overflow-hidden shrink-0" id="bezel-frame">
            
            {/* Upper screen notch pill "Dynamic Island" representing medical premium tech */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 h-5.5 w-32 bg-slate-950 rounded-full z-100 flex items-center justify-between px-3 border border-slate-900/80 shadow-inner" id="dynamic-island">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[7.5px] text-emerald-400 font-mono tracking-wider">308 APP READY</span>
              <span className="w-2 h-2 rounded-full bg-slate-900" />
            </div>

            {/* Simulated upper screen bezel reflection */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[2.5rem]" />

            {/* Inner Simulated Screen Area with exact mobile sizing */}
            <div className="flex-1 rounded-[2.5rem] bg-gray-50 flex flex-col overflow-hidden relative border border-slate-900 bg-linear-to-b from-gray-50 to-slate-50 shadow-inner" id="inner-phone-viewport">
              
              {/* Phone System Status Bar */}
              <div className="h-10 bg-white px-6 flex items-center justify-between text-slate-800 text-[10.5px] font-bold tracking-tight select-none border-b border-gray-100/30 z-30 shrink-0 pt-3" id="phone-status-bar">
                <span className="font-mono text-slate-950 leading-none">{phoneTime}</span>
                <div className="flex items-center gap-1.5" id="status-indicators">
                  <span className="text-[8.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold font-sans">5G 满格</span>
                  <Wifi className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <Battery className="w-4 h-4 text-slate-800 shrink-0" />
                  <span className="font-mono text-[9px] text-slate-800">100%</span>
                </div>
              </div>

              {/* Dynamic Phone Top Header / Sub Title inside App */}
              <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white shrink-0 z-20 shadow-xs" id="phone-header">
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1.5 rounded-lg flex items-center justify-center">
                    <HeartPulse className="w-4 h-4 text-emerald-300 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-200 font-bold">2026中国医护研考辅特训APP</span>
                    <h2 className="text-xs font-black tracking-tight flex items-center gap-1">
                      308 护理考研宝典 <span className="text-[7.5px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-xs">高分通关版</span>
                    </h2>
                  </div>
                </div>

                {/* Cloud Auth and Status Badge inside Phone Header */}
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className={`flex items-center justify-center p-1.5 rounded-full transition-transform active:scale-95 ${
                    currentUser ? "bg-emerald-500 border border-emerald-400" : "bg-slate-950 border border-slate-800"
                  }`}
                  id="phone-header-auth"
                  title="云端自动数据同步"
                >
                  <User className={`w-3.5 h-3.5 ${currentUser ? "text-white" : "text-slate-300"}`} />
                </button>
              </div>

              {/* Inner Dynamic Notification alert (Simulating actual study reminders) */}
              <div className="bg-slate-900 text-[10px] text-slate-200 px-4 py-2 flex items-center justify-between font-medium select-none border-b border-slate-800" id="phone-scrolling-noti">
                <span className="truncate flex items-center gap-1">
                  <Bell className="w-3 h-3 text-emerald-400 animate-bounce shrink-0" />
                  <span>艾宾浩斯：记忆曲线动态调整中，今日有超期温临界卡片！</span>
                </span>
                <span className="text-[8px] text-emerald-400 font-mono tracking-widest shrink-0">大考护航</span>
              </div>

              {/* PHONE VIEWPORT MAIN CONTENT CANVAS (Fully Scrollable inside App) */}
              <div className="flex-1 overflow-y-auto scrollbar-none pb-20 p-3.5 relative" id="phone-main-scrollbox">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" id="phone-tab-content">
                  {activeTab === "syllabus" && (
                    <SyllabusView onSelectSubject={handleSelectSubjectForQuiz} />
                  )}

                  {activeTab === "quiz" && (
                    <QuizView initialSubjectId={selectedSubjectFilter} currentUser={currentUser} />
                  )}

                  {activeTab === "flashcard" && (
                    <FlashcardView />
                  )}

                  {activeTab === "tutor" && (
                    <TutorView />
                  )}

                  {activeTab === "deck" && (
                    <ReviewDeckView currentUser={currentUser} />
                  )}
                </div>
              </div>

              {/* FIXED MOBILE NATIVE BOTTOM STICKY TAB-BAR BAR (Fingertip optimized for iOS/Android style) */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-150/90 h-[74px] pb-4 flex items-center justify-around z-50 rounded-b-[2.5rem] px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.06)]" id="phone-sticky-tabs">
                
                {/* Tab: Syllabus */}
                <button
                  onClick={() => handleTabChange("syllabus")}
                  className={`flex flex-col items-center justify-center w-14 h-12 transition-all rounded-xl ${
                    activeTab === "syllabus" 
                      ? "text-emerald-600 scale-102 font-black" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="phone-btn-syllabus"
                >
                  <Layers className={`w-5 h-5 ${activeTab === "syllabus" ? "stroke-[2.5] text-emerald-600" : "stroke-[1.8]"}`} />
                  <span className="text-[8.5px] mt-1 tracking-tighter">考纲速览</span>
                </button>

                {/* Tab: Quiz */}
                <button
                  onClick={() => handleTabChange("quiz")}
                  className={`flex flex-col items-center justify-center w-14 h-12 transition-all rounded-xl relative ${
                    activeTab === "quiz" 
                      ? "text-emerald-600 scale-102 font-black" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="phone-btn-quiz"
                >
                  <HelpCircle className={`w-5 h-5 ${activeTab === "quiz" ? "stroke-[2.5] text-emerald-600" : "stroke-[1.8]"}`} />
                  <span className="text-[8.5px] mt-1 tracking-tighter">真题模拟</span>
                  <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                </button>

                {/* Tab: Flashcard */}
                <button
                  onClick={() => handleTabChange("flashcard")}
                  className={`flex flex-col items-center justify-center w-14 h-12 transition-all rounded-xl ${
                    activeTab === "flashcard" 
                      ? "text-emerald-600 scale-102 font-black" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="phone-btn-flashcard"
                >
                  <BookOpen className={`w-5 h-5 ${activeTab === "flashcard" ? "stroke-[2.5] text-emerald-600" : "stroke-[1.8]"}`} />
                  <span className="text-[8.5px] mt-1 tracking-tighter">背诵口诀</span>
                </button>

                {/* Tab: Tutor */}
                <button
                  onClick={() => handleTabChange("tutor")}
                  className={`flex flex-col items-center justify-center w-14 h-12 transition-all rounded-xl relative ${
                    activeTab === "tutor" 
                      ? "text-emerald-600 scale-102 font-black" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="phone-btn-tutor"
                >
                  <MessageSquare className={`w-5 h-5 ${activeTab === "tutor" ? "stroke-[2.5] text-emerald-600" : "stroke-[1.8]"}`} />
                  <span className="text-[8.5px] mt-1 tracking-tighter">AI导师</span>
                  <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[6.5px] scale-90 px-1 rounded-full font-bold">AI</span>
                </button>

                {/* Tab: Deck */}
                <button
                  onClick={() => handleTabChange("deck")}
                  className={`flex flex-col items-center justify-center w-14 h-12 transition-all rounded-xl ${
                    activeTab === "deck" 
                      ? "text-emerald-600 scale-102 font-black" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="phone-btn-deck"
                >
                  <Bookmark className={`w-5 h-5 ${activeTab === "deck" ? "stroke-[2.5] text-emerald-600" : "stroke-[1.8]"}`} />
                  <span className="text-[8.5px] mt-1 tracking-tighter">复习手记</span>
                </button>

              </div>

            </div>
          </div>

          {/* Quick instructions below the device frame */}
          <div className="mt-4 text-center text-gray-400 text-xs flex items-center gap-1 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800" id="bezel-instruction">
            <span className="text-emerald-500 font-bold">👍 手机端真机渲染中:</span>
            <span>如果您在移动设备或狭长窗口浏览，极简设计会完美充满视图！</span>
          </div>
        </div>
      ) : (
        
        /* RENDER MODE B: REGULAR GOLDEN WIDESCREEN PC WORKSPACE */
        <div className="flex-1 flex flex-col bg-gray-50/50" id="desktop-widescreen-wrapper">
          {/* Announcement Bar */}
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 flex justify-between items-center font-medium shadow-xs shrink-0" id="upper-banner">
            <div className="flex items-center gap-1.5" id="banner-text">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>中国护理学硕士招生（308 护理综合）全息特训辅助智能舱已经开启运行。</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]" id="banner-date">
              <Clock className="w-3 h-3" />
              <span>目标：2026年12月全国终极大考</span>
            </div>
          </div>

          {/* Primary Header */}
          <header className="bg-white border-b border-gray-100 py-6 px-4 md:px-8 shadow-xs shrink-0" id="main-header">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4" id="header-container">
              {/* Logo Brand Section */}
              <div className="flex items-center gap-3.5" id="brand-logo-section">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs animate-pulse" id="logo-shell">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="text-left" id="brand-labels">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                    护理考研备考助手 <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">308 护理双辅模式</span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">内科护理 · 外科护理 · 基础护理 · 护理导论 一体化考点攻坚</p>
                </div>
              </div>

              {/* Control bar including Countdown and Cloud Auth button */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 ml-auto" id="header-controls">
                {/* Cloud Sync Status Button */}
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-2xl border transition-all ${
                    currentUser 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100" 
                      : "bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
                  }`}
                  id="header-auth-trigger"
                >
                  <User className={`w-4 h-4 ${currentUser ? "text-emerald-600 animate-bounce" : "text-slate-300"}`} />
                  <div className="text-left leading-tight">
                    <span className="block text-[8px] font-extrabold uppercase tracking-wider text-emerald-600">
                      {currentUser ? "⚡ 已连接云端同步" : "☁️ 登录同步"}
                    </span>
                    <span className="block text-xs truncate max-w-[120px] font-medium">
                      {currentUser ? currentUser.email : "记录在多设备互通"}
                    </span>
                  </div>
                </button>

                {/* Target Countdown Widget */}
                <div className="flex items-center gap-4 bg-gray-55 bg-white p-2.5 rounded-2xl border border-gray-100" id="countdown-widget">
                  <div className="text-right" id="countdown-labels">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none">大考倒计时</span>
                    <span className="text-[11px] font-semibold text-gray-700">2026 届硕士研究生招生</span>
                  </div>
                  <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-xl font-mono text-center shrink-0" id="countdown-digit-box">
                    <strong className="text-sm font-black block text-emerald-400 leading-none">6 个月</strong>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 block mt-0.5">研途有你</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main navigation Tabs (PC version) */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shrink-0" id="main-nav">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex overflow-x-auto gap-1 md:gap-4 scrollbar-none" id="tabs-navigation-panel">
              <button
                onClick={() => handleTabChange("syllabus")}
                className={`py-4 px-3 md:px-5 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "syllabus"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                id="tab-btn-syllabus"
              >
                <Layers className="w-4 h-4" />
                <span>大纲要点速览</span>
              </button>

              <button
                onClick={() => handleTabChange("quiz")}
                className={`py-4 px-3 md:px-5 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "quiz"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                id="tab-btn-quiz"
              >
                <HelpCircle className="w-4 h-4" />
                <span>智能真题模拟</span>
              </button>

              <button
                onClick={() => handleTabChange("flashcard")}
                className={`py-4 px-3 md:px-5 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "flashcard"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                id="tab-btn-flashcard"
              >
                <BookOpen className="w-4 h-4" />
                <span>背诵记忆口诀</span>
              </button>

              <button
                onClick={() => handleTabChange("tutor")}
                className={`py-4 px-3 md:px-5 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "tutor"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                id="tab-btn-tutor"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  AI 专属导师
                  <span className="bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase scale-90">LIVE</span>
                </span>
              </button>

              <button
                onClick={() => handleTabChange("deck")}
                className={`py-4 px-3 md:px-5 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "deck"
                    ? "border-emerald-600 text-emerald-600 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                id="tab-btn-deck"
              >
                <Bookmark className="w-4 h-4" />
                <span>随堂复习手记</span>
              </button>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8" id="primary-content-frame">
            <div className="space-y-6" id="view-switching-box">
              {activeTab === "syllabus" && (
                <SyllabusView onSelectSubject={handleSelectSubjectForQuiz} />
              )}

              {activeTab === "quiz" && (
                <QuizView initialSubjectId={selectedSubjectFilter} currentUser={currentUser} />
              )}

              {activeTab === "flashcard" && (
                <FlashcardView />
              )}

              {activeTab === "tutor" && (
                <TutorView />
              )}

              {activeTab === "deck" && (
                <ReviewDeckView currentUser={currentUser} />
              )}
            </div>
          </main>

          {/* Elegant minimalist footer */}
          <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 shrink-0" id="main-footer">
            <div className="max-w-7xl mx-auto px-4" id="footer-inner">
              <p>© 2026 👩‍🎓 护理考研备考助手. 研途漫漫，愿你破浪乘风，凯旋归岸。</p>
            </div>
          </footer>
        </div>
      )}

      {/* Auth Modal Integration */}
      <AuthInterface 
        onUserChanged={setCurrentUser} 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}
