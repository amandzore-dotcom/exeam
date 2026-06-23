import React, { useState, useEffect } from "react";
import { PracticeQuestion, SubjectId, UserCustomQuestion } from "../types";
import { PRACTICE_QUESTIONS } from "../data/questions";
import { SUBJECTS } from "../data/syllabus";
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  RefreshCcw, 
  HelpCircle as HelpIcon, 
  ArrowRight, 
  Award,
  Plus,
  Trash2,
  Clock,
  BookOpen
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { bulkSyncQuizzesToCloud, uploadUserQuiz, removeUserQuiz } from "../lib/sync";

interface QuizViewProps {
  initialSubjectId?: SubjectId | null;
  currentUser?: FirebaseUser | null;
}

export default function QuizView({ initialSubjectId = null, currentUser = null }: QuizViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | "all">(initialSubjectId || "all");
  const [questions, setQuestions] = useState<PracticeQuestion[]>(PRACTICE_QUESTIONS);
  
  // Custom states for loading custom quizzes
  const [customQuizzes, setCustomQuizzes] = useState<UserCustomQuestion[]>([]);
  const [isQuizzesSyncing, setIsQuizzesSyncing] = useState(false);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>("all");
  const [quizLayoutMode, setQuizLayoutMode] = useState<"interactive" | "chapter-cards">("chapter-cards");

  // Custom Quiz Form adding states
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizFormSubject, setQuizFormSubject] = useState<SubjectId>(SubjectId.INTERNAL);
  const [quizFormChapter, setQuizFormChapter] = useState("");
  const [quizFormQuestion, setQuizFormQuestion] = useState("");
  const [quizFormOptA, setQuizFormOptA] = useState("");
  const [quizFormOptB, setQuizFormOptB] = useState("");
  const [quizFormOptC, setQuizFormOptC] = useState("");
  const [quizFormOptD, setQuizFormOptD] = useState("");
  const [quizFormOptE, setQuizFormOptE] = useState("");
  const [quizFormCorrectIdx, setQuizFormCorrectIdx] = useState<number>(0);
  const [quizFormExplanation, setQuizFormExplanation] = useState("");
  const [quizFormFeedback, setQuizFormFeedback] = useState<string | null>(null);

  // Custom delete inline confirm state
  const [quizIdToDelete, setQuizIdToDelete] = useState<string | null>(null);

  // Sync / local load custom quizzes
  useEffect(() => {
    let localQuizzes: UserCustomQuestion[] = [];
    const cached = localStorage.getItem("care_custom_quizzes");
    if (cached) {
      try {
        localQuizzes = JSON.parse(cached);
      } catch (e) {
        localQuizzes = [];
      }
    }

    if (currentUser) {
      setIsQuizzesSyncing(true);
      bulkSyncQuizzesToCloud(currentUser.uid, localQuizzes)
        .then((merged) => {
          setCustomQuizzes(merged);
          localStorage.setItem("care_custom_quizzes", JSON.stringify(merged));
        })
        .catch((e) => {
          console.error("Failed to sync custom quizzes: ", e);
          setCustomQuizzes(localQuizzes);
        })
        .finally(() => setIsQuizzesSyncing(false));
    } else {
      setCustomQuizzes(localQuizzes);
    }
  }, [currentUser]);

  const saveQuizzes = (newQuizzes: UserCustomQuestion[]) => {
    setCustomQuizzes(newQuizzes);
    localStorage.setItem("care_custom_quizzes", JSON.stringify(newQuizzes));
  };

  const handleAddCustomQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizFormQuestion.trim() || !quizFormOptA.trim() || !quizFormOptB.trim()) {
      setQuizFormFeedback("请完整填写[题面内容]及[至少选项 A 和选项 B]！");
      return;
    }

    const options = [quizFormOptA.trim(), quizFormOptB.trim()];
    if (quizFormOptC.trim()) options.push(quizFormOptC.trim());
    if (quizFormOptD.trim()) options.push(quizFormOptD.trim());
    if (quizFormOptE.trim()) options.push(quizFormOptE.trim());

    if (quizFormCorrectIdx >= options.length) {
      setQuizFormFeedback("正确答案索引超出了现有可用选项的配置量范围！");
      return;
    }

    const newQuiz: UserCustomQuestion = {
      id: `quiz-user-${Date.now()}`,
      subjectId: quizFormSubject,
      chapter: quizFormChapter.trim() || "自录重难点",
      question: quizFormQuestion.trim(),
      options,
      correctAnswer: quizFormCorrectIdx,
      explanation: quizFormExplanation.trim() || "本题暂无深度解析，随堂理解背诵为主。",
      createdAt: Date.now()
    };

    const updated = [newQuiz, ...customQuizzes];
    saveQuizzes(updated);

    if (currentUser) {
      uploadUserQuiz(currentUser.uid, newQuiz);
    }

    // Reset fields
    setQuizFormQuestion("");
    setQuizFormOptA("");
    setQuizFormOptB("");
    setQuizFormOptC("");
    setQuizFormOptD("");
    setQuizFormOptE("");
    setQuizFormExplanation("");
    setQuizFormFeedback("🎉 成功录入！当前题目已加载进智能练题舱中。");
    setTimeout(() => {
      setQuizFormFeedback(null);
      setShowQuizForm(false);
    }, 2500);
  };

  const handleDeleteCustomQuiz = (id: string) => {
    const updated = customQuizzes.filter((cq) => cq.id !== id);
    saveQuizzes(updated);
    
    if (currentUser) {
      removeUserQuiz(currentUser.uid, id);
    }
    
    // reset slider to 0
    setCurrentIdx(0);
    setQuizIdToDelete(null);
  };

  // Convert custom quizzes into practice questions
  const mappedCustomQuizzes: PracticeQuestion[] = customQuizzes.map((cq) => ({
    id: cq.id,
    subjectId: cq.subjectId,
    type: "A1",
    question: cq.question,
    options: cq.options,
    correctAnswer: cq.correctAnswer,
    explanation: cq.explanation,
    topic: cq.chapter ? `教师课后题 · ${cq.chapter}` : "自录随堂题"
  }));

  // Combine default practice pool AND custom added quizzes
  const combinedPool = [...mappedCustomQuizzes, ...questions];

  // Distinct Chapters list for dropdown chapters filter
  const customChapters = Array.from(new Set(customQuizzes.map((q) => q.chapter).filter(Boolean)));

  // Quiz tracking
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  
  // Scorecard tracking
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [attemptedCount, setAttemptedCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"quiz" | "history">("quiz");
  const [wrongQuestions, setWrongQuestions] = useState<PracticeQuestion[]>([]);

  // AI Gen state
  const [aiTopic, setAiTopic] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter questions based on selected subject AND chapter
  const currentFilteredQuestions = combinedPool.filter((q) => {
    const matchesSubject = selectedSubjectId === "all" || q.subjectId === selectedSubjectId;
    
    const matchesChapter = selectedChapterFilter === "all" || 
      (q.topic && q.topic.includes(selectedChapterFilter));

    return matchesSubject && matchesChapter;
  });


  const currentQuestion: PracticeQuestion | undefined = currentFilteredQuestions[currentIdx];

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);
    setAttemptedCount((prev) => prev + 1);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongQuestions((prev) => {
        if (prev.some((q) => q.id === currentQuestion.id)) return prev;
        return [...prev, currentQuestion];
      });
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (currentIdx < currentFilteredQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Reached end of current series, cycle back or wait for more
      setCurrentIdx(0);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCorrectCount(0);
    setAttemptedCount(0);
    setWrongQuestions([]);
    setQuestions(PRACTICE_QUESTIONS);
  };

  // Generate Custom AI Question
  const handleGenerateAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiLoading(true);
    setAiError(null);

    const targetSubject = selectedSubjectId === "all" ? SubjectId.INTERNAL : selectedSubjectId;
    const targetSubjectName = SUBJECTS[targetSubject].name;

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: targetSubject,
          subjectName: targetSubjectName,
          topic: aiTopic.trim() || undefined
        }),
      });

      if (!res.ok) {
        throw new Error("服务器生成错漏，请稍后刷新重做");
      }

      const newQuestionData = await res.json();
      
      const newQuestion: PracticeQuestion = {
        id: `ai-${Date.now()}`,
        subjectId: targetSubject,
        type: aiTopic ? "A2" : "A1",
        question: newQuestionData.question,
        options: newQuestionData.options,
        correctAnswer: newQuestionData.correctAnswer,
        explanation: newQuestionData.explanation,
        topic: aiTopic || "AI 重点推演题"
      };

      // Slide to the newly added AI question
      setQuestions((prev) => [newQuestion, ...prev]);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setAiTopic("");
      setActiveTab("quiz");
    } catch (err: any) {
      setAiError(err.message || "出题系统出现了一点偏离，请检查配置或稍后再试。");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="quiz-root">
      {/* Selection Header & AI generator box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md" id="quiz-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" id="quiz-filter-bar">
          <div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>308 护理真题演练舱</span>
            </div>
            <h3 className="text-xl font-bold">考题筛选 & 动态 AI 病例题定制</h3>
          </div>

          <div className="flex flex-wrap gap-2" id="subject-selector">
            <button
              onClick={() => { setSelectedSubjectId("all"); setCurrentIdx(0); setSelectedAnswer(null); setIsAnswerSubmitted(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedSubjectId === "all" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              id="btn-sub-all"
            >
              全部学科
            </button>
            {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => (
              <button
                key={subId}
                id={`btn-sub-${subId}`}
                onClick={() => { setSelectedSubjectId(subId); setCurrentIdx(0); setSelectedAnswer(null); setIsAnswerSubmitted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedSubjectId === subId 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {SUBJECTS[subId].name}
              </button>
            ))}
          </div>
        </div>

        {/* AI generator form input */}
        <form onSubmit={handleGenerateAiQuestion} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl mb-4" id="ai-question-generator-form">
          <label className="block text-xs text-slate-300 mb-2 font-medium">
            💡 输入你想复习的任何护理细节或微观考点（如：“青霉素过敏”、“休克补液”、“急性左心衰”）：
          </label>
          <div className="flex gap-2" id="ai-input-group">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="例如：洋地黄中毒、肝性脑病、压疮等 (留空则随机出高频题)"
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-white"
              disabled={isAiLoading}
              id="ai-topic-input"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shrink-0 flex items-center gap-2"
              id="btn-submit-ai-gen"
            >
              {isAiLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>AI 组卷中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI 专家出题</span>
                </>
              )}
            </button>
          </div>
          {aiError && (
            <p className="text-rose-400 text-xs mt-2" id="ai-error-text">❌ {aiError}</p>
          )}
        </form>

        {/* Custom Actions: Chapter filtering, manual record entry trigger */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-slate-800/80" id="custom-quiz-bar">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-450 font-bold">按章节分类特训:</span>
            <select
              value={selectedChapterFilter}
              onChange={(e) => { setSelectedChapterFilter(e.target.value); setCurrentIdx(0); }}
              className="text-xs bg-slate-950 border border-slate-700/60 text-white rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500"
              id="chapter-filter-select"
            >
              <option value="all">任意录入章节 (展示所有)</option>
              {customChapters.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowQuizForm(!showQuizForm)}
            className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-750 active:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            id="toggle-quiz-form-btn"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showQuizForm ? "收起录题窗口" : "随堂课·手动录题重温"}</span>
          </button>
        </div>
      </div>

      {/* Manual quiz entry form block */}
      {showQuizForm && (
        <form onSubmit={handleAddCustomQuiz} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in slide-in-from-top-2 duration-200" id="manual-quiz-form">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h4 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>录入教师重难点题目 / 课堂自制测验本</span>
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">
              {currentUser ? "⚡ 自动云同步开启 (ACTIVE)" : "💾 运行在本地离线模式"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">选择对应的科目分区</label>
              <select
                value={quizFormSubject}
                onChange={(e) => setQuizFormSubject(e.target.value as SubjectId)}
                className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-500"
              >
                {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => (
                  <option key={subId} value={subId}>{SUBJECTS[subId].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">章节/分类定位 (按本章节分类整理)</label>
              <input
                type="text"
                value={quizFormChapter}
                onChange={(e) => setQuizFormChapter(e.target.value)}
                placeholder="例如：第一章 循环系统 / 骨科特殊护理"
                className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg text-gray-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">测验问题干 Question</label>
            <textarea
              value={quizFormQuestion}
              onChange={(e) => setQuizFormQuestion(e.target.value)}
              placeholder="请输入具体的试卷原题或课后题面..."
              rows={2}
              className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg text-gray-855 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-0.5">选项 A *</label>
              <input
                type="text"
                value={quizFormOptA}
                onChange={(e) => setQuizFormOptA(e.target.value)}
                placeholder="选项 A"
                className="w-full text-xs p-2 bg-gray-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-0.5">选项 B *</label>
              <input
                type="text"
                value={quizFormOptB}
                onChange={(e) => setQuizFormOptB(e.target.value)}
                placeholder="选项 B"
                className="w-full text-xs p-2 bg-gray-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-405 mb-0.5">选项 C (选填)</label>
              <input
                type="text"
                value={quizFormOptC}
                onChange={(e) => setQuizFormOptC(e.target.value)}
                placeholder="选项 C"
                className="w-full text-xs p-2 bg-gray-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-405 mb-0.5">选项 D (选填)</label>
              <input
                type="text"
                value={quizFormOptD}
                onChange={(e) => setQuizFormOptD(e.target.value)}
                placeholder="选项 D"
                className="w-full text-xs p-2 bg-gray-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-405 mb-0.5">选项 E (选填修饰项)</label>
              <input
                type="text"
                value={quizFormOptE}
                onChange={(e) => setQuizFormOptE(e.target.value)}
                placeholder="选项 E"
                className="w-full text-xs p-2 bg-gray-50 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-0.5">设定的标准正确选项答案</label>
              <select
                value={quizFormCorrectIdx}
                onChange={(e) => setQuizFormCorrectIdx(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              >
                <option value={0}>选项 A</option>
                <option value={1}>选项 B</option>
                {quizFormOptC.trim() && <option value={2}>选项 C</option>}
                {quizFormOptD.trim() && <option value={3}>选项 D</option>}
                {quizFormOptE.trim() && <option value={4}>选项 E</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">随课老师要领点拨 / 复习指南 (Rationals)</label>
            <textarea
              value={quizFormExplanation}
              onChange={(e) => setQuizFormExplanation(e.target.value)}
              placeholder="请输入本题的出题人思路、答案解析或记忆口诀..."
              rows={2}
              className="w-full text-xs p-2.5 bg-gray-50 border rounded-lg text-gray-850 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-xs text-rose-500 font-semibold">{quizFormFeedback}</span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              💾 确认并封存入我的真题库
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200" id="quiz-tab-bar">
        <button
          onClick={() => setActiveTab("quiz")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
            activeTab === "quiz" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          id="btn-tab-practice"
        >
          ✍️ 在练题库（当前有 {currentFilteredQuestions.length} 道题）
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
            activeTab === "history" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          id="btn-tab-wrongbook"
        >
          📕 错题集与成绩单 ({wrongQuestions.length})
        </button>
      </div>

      {/* Primary Tab Body */}
      {activeTab === "quiz" ? (
        <div id="quiz-practice-tab" className="space-y-6">
          
          {/* Sub layout modes: chapter bento cards or interactive slides */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-200/60 shadow-xs" id="quiz-sub-menu">
            <div className="flex bg-gray-150 p-1 rounded-xl w-max" id="layout-mode-togglers">
              <button
                onClick={() => setQuizLayoutMode("chapter-cards")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  quizLayoutMode === "chapter-cards" 
                    ? "bg-white text-gray-950 shadow-xs" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                📚 按科目章节目录练习 (一目了然)
              </button>
              <button
                onClick={() => setQuizLayoutMode("interactive")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  quizLayoutMode === "interactive" 
                    ? "bg-white text-gray-950 shadow-xs" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                ✍️ 智能连阅自检题舱 ({currentFilteredQuestions.length} 道)
              </button>
            </div>

            {selectedChapterFilter !== "all" && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-100">
                <span>正在定向速练：<strong>{selectedChapterFilter}</strong></span>
                <button
                  onClick={() => { setSelectedChapterFilter("all"); setCurrentIdx(0); }}
                  className="text-rose-600 hover:text-rose-800 font-bold ml-1 cursor-pointer"
                  title="清除过滤，查看总题库"
                >
                  ✕ 解除锁定
                </button>
              </div>
            )}
          </div>

          {quizLayoutMode === "chapter-cards" ? (
            <div className="space-y-4 font-sans" id="chapter-cards-wrapper">
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 text-xs text-emerald-800 leading-relaxed font-semibold">
                💡 <strong>章节演练小助手</strong>：备考大纲精选章节与自录练习已完整列在下方。点击具体卡片即可开始，随时定向自查，提分更有针对性！
              </div>

              {/* Dynamic Grouped Chapters lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="chapter-bento-grid">
                {(() => {
                  const groupedChapters = (() => {
                    const map: Record<string, { subjectId: SubjectId; topic: string; questions: PracticeQuestion[] }> = {};
                    combinedPool.forEach((q) => {
                      let name = q.topic || "综合练习";
                      if (name.startsWith("教师课后题 · ")) {
                        name = name.replace("教师课后题 · ", "");
                      }
                      
                      const key = `${q.subjectId}-${name}`;
                      if (!map[key]) {
                        map[key] = {
                          subjectId: q.subjectId,
                          topic: name,
                          questions: []
                        };
                      }
                      map[key].questions.push(q);
                    });
                    return Object.values(map);
                  })();

                  const displayed = groupedChapters.filter(item => selectedSubjectId === "all" || item.subjectId === selectedSubjectId);

                  if (displayed.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 border border-gray-200 rounded-2xl" id="no-chapter-under-subject">
                        ⚠️ 该学科分类下暂无已整理题目，您可以点右上角“自动录入”功能，自录新题，章节标签可在这里全自动统计！
                      </div>
                    );
                  }

                  return displayed.map((item, index) => {
                    const sub = SUBJECTS[item.subjectId];
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-2xl border border-gray-150/80 p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden"
                        id={`chapter-card-${index}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-extrabold tracking-wider">{sub.name}</span>
                            <span className="text-[10.5px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                              {item.questions.length} 道试题
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors">
                            {item.topic}
                          </h4>

                          <p className="text-[11px] text-gray-400 font-mono leading-relaxed truncate">
                            预览: {item.questions[0]?.question.slice(0, 36)}...
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedChapterFilter(item.topic);
                            setCurrentIdx(0);
                            setQuizLayoutMode("interactive");
                          }}
                          className="mt-4 w-full py-2 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white transition-all text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          id={`btn-chapter-go-${index}`}
                        >
                          <span>🚀 定向演练本章</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            /* INTERACTIVE SLIDE DRILL VIEW */
            !currentQuestion ? (
              <div className="bg-white rounded-2xl border p-12 text-center" id="empty-questions-notice">
                <HelpIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-1">本学科下暂无练习题</h4>
                <p className="text-gray-500 text-sm mb-4">你可以试着在上方点击「AI 专家出题」让专属护理智囊现场为您定制一道真题！</p>
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg"
                >
                  重置题库
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="quiz-active-layout">
              {/* Question block */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6" id="quest-card">
                <div className="flex items-center justify-between" id="quest-header-meta">
                  <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">
                    第 {currentIdx + 1} / {currentFilteredQuestions.length} 题
                  </span>
                  <div className="flex flex-wrap items-center gap-2" id="quest-tags">
                    {customQuizzes.some((cq) => cq.id === currentQuestion.id) && (
                      <div className="inline-flex items-center gap-1">
                        {quizIdToDelete === currentQuestion.id ? (
                          <div className="bg-rose-50 border border-rose-200 rounded px-2 py-0.5 flex items-center gap-1.5 text-[10px] animate-in fade-in">
                            <span className="text-rose-600 font-bold">确定删除随录题？</span>
                            <button
                              onClick={() => handleDeleteCustomQuiz(currentQuestion.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-1.5 rounded text-[9px]"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => setQuizIdToDelete(null)}
                              className="text-gray-500 font-bold hover:text-gray-700 px-0.5 text-[9px]"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuizIdToDelete(currentQuestion.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-rose-100/65"
                            title="从我的真题库中抹去"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>删除此自录题</span>
                          </button>
                        )}
                      </div>
                    )}
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-sm font-semibold">
                      类型: {currentQuestion.type}题 ({currentQuestion.type === "A2" ? "病例实战" : "常识理论"})
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-sm font-semibold">
                      {SUBJECTS[currentQuestion.subjectId].name}
                    </span>
                  </div>
                </div>

                {/* The main Question body */}
                <div className="text-gray-900 font-medium text-base md:text-lg leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100" id="quest-question-text">
                  {currentQuestion.topic && (
                    <span className="inline-block bg-teal-100 text-teal-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm mr-2 align-middle">
                      {currentQuestion.topic}
                    </span>
                  )}
                  {currentQuestion.question}
                </div>

                {/* Multiple choice options */}
                <div className="space-y-3" id="quest-options-list">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = currentQuestion.correctAnswer === i;
                    
                    let bgStyle = "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/40 text-gray-700";
                    if (isSelected) {
                      bgStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
                    }
                    
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        bgStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        bgStyle = "bg-rose-100 border-rose-500 text-rose-900";
                      } else {
                        bgStyle = "bg-white border-gray-100 text-gray-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectAnswer(i)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center justify-between gap-3 ${bgStyle}`}
                        id={`option-btn-${i}`}
                      >
                        <span>{option}</span>
                        {isAnswerSubmitted && (
                          <span>
                            {isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            {!isCorrect && isSelected && <XCircle className="w-5 h-5 text-rose-600" />}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100" id="quest-actions-panel">
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
                    id="btn-restart-pool"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>重置成绩</span>
                  </button>

                  <div className="flex gap-2" id="action-right-btns">
                    {!isAnswerSubmitted ? (
                      <button
                        disabled={selectedAnswer === null}
                        onClick={handleSubmitAnswer}
                        className="px-6 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition"
                        id="btn-submit-answer"
                      >
                        提交答案
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition"
                        id="btn-next-question"
                      >
                        <span>下一题</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Rationale & stats sidebar */}
              <div className="space-y-6" id="quiz-sidebar-info">
                {/* Statistics Box */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="stats-box">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3">当前答题数据 📉</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4" id="stats-grid">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">总作答数</span>
                      <strong className="text-xl text-slate-800">{attemptedCount} 次</strong>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">正确率</span>
                      <strong className="text-xl text-emerald-600">
                        {attemptedCount > 0 ? `${Math.round((correctCount / attemptedCount) * 100)}%` : "0%"}
                      </strong>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden" id="stats-progress-container">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Explanation Rationale Panel (Show after submission) */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs" id="rational-box">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>试题精析 Rationale</span>
                  </h4>

                  {isAnswerSubmitted ? (
                    <div className="space-y-3" id="rational-body-active">
                      <p className="text-xs font-semibold uppercase inline-block bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm">
                        正确答案: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line" id="rational-text-content">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-xs leading-relaxed" id="rational-body-inactive">
                      🔒 提交你的选择后，专业拟真解析将在此呈现。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
      ) : (
        /* WRONG BOOK / LOG TAB */
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6" id="history-container-tab">
          <div className="flex items-center justify-between border-b pb-4 border-gray-100" id="wrongbook-header row">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">考前纠偏 · 自适应错题集</h3>
              <p className="text-xs text-gray-400">我们将您在模拟测试中选错的题目自动规整在此，协助临阵查漏补缺。</p>
            </div>
            <button
              onClick={handleResetQuiz}
              className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition"
              id="btn-wipe-wrongbook"
            >
              清空我的错题
            </button>
          </div>

          {wrongQuestions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm" id="wrongbook-empty">
              <Award className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 text-base mb-1">恭喜您，暂无积攒错题！</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                您的作答保持完美，或者是还未开始作答。继续保持，每天在【在练题库】答上10题来培养手感吧。
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100" id="wrongbook-list font-medium">
              {wrongQuestions.map((q, i) => (
                <div key={q.id} className="py-5 first:pt-0 last:pb-0 space-y-3" id={`wrong-item-${q.id}`}>
                  <div className="flex items-center gap-2 text-xs" id={`wrong-meta-${q.id}`}>
                    <span className="text-gray-400 font-bold">#错题 {i + 1}</span>
                    <span className="bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-xs">
                      {SUBJECTS[q.subjectId].name}
                    </span>
                    {q.topic && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xs font-semibold">{q.topic}</span>}
                  </div>
                  <h4 className="text-gray-900 font-medium text-sm md:text-base leading-relaxed">
                    {q.question}
                  </h4>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-xs text-rose-950 space-y-2">
                    <p className="font-semibold">
                      正确答案: <span className="text-emerald-700">{String.fromCharCode(65 + q.correctAnswer)}</span>
                    </p>
                    <p className="leading-relaxed whitespace-pre-line text-gray-700">
                      <strong>错题解析：</strong>{q.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
