import React, { useState, useEffect } from "react";
import { UserCustomCard, SubjectId } from "../types";
import { SUBJECTS } from "../data/syllabus";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Sparkles, 
  Eye, 
  HelpCircle, 
  Check, 
  Layers, 
  RotateCw,
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  Bookmark,
  Lightbulb,
  CloudLightning,
  RefreshCw,
  TrendingUp,
  Brain
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { bulkSyncCardsToCloud, uploadUserCard, removeUserCard } from "../lib/sync";

export const EBBINGHAUS_INTERVALS = [
  { stage: 0, label: "新录入待学 🆕", ms: 0 },
  { stage: 1, label: "5M 记忆瞬时区 🕒", ms: 5 * 60 * 1000 },
  { stage: 2, label: "30M 核心唤醒区 🕒", ms: 30 * 60 * 1000 },
  { stage: 3, label: "12H 长效启动期 🕒", ms: 12 * 60 * 60 * 1000 },
  { stage: 4, label: "1D 记忆沉淀期 🕒", ms: 24 * 60 * 60 * 1000 },
  { stage: 5, label: "2D 深度整合期 🕒", ms: 2 * 24 * 60 * 60 * 1000 },
  { stage: 6, label: "4D 定期抗阻度 🕒", ms: 4 * 24 * 60 * 60 * 1000 },
  { stage: 7, label: "7D 潜意识存备 🌟", ms: 7 * 24 * 60 * 60 * 1000 },
  { stage: 8, label: "15D 终极考点掌握 💯", ms: 15 * 24 * 60 * 60 * 1000 }
];

// Pre-populate some realistic high-yield Bo'ao Nursing School exam notes to provide great initial visuals
const PRE_POPULATED_BOAO_NOTES: UserCustomCard[] = [
  {
    id: "boao-1",
    subjectId: SubjectId.INTERNAL,
    type: "noun",
    title: "阿斯综合征 (Adams-Stokes Syndrome)",
    answer: "指由于心律失常导致的心排出量急剧减少，引起脑组织发生暂时性、严重的急性缺血而发生的突然晕厥、自发抽搐、呼吸困难甚至心脏骤停的临床综合征。",
    hint: "博傲高频提醒：常由高度房室传导阻滞或心室颤动引起，抢救中要极其警惕心脏猝死。",
    createdAt: Date.now() - 500000,
    ebbinghausStage: 1,
    nextReviewTime: Date.now() - 60000, // ready to review
    recyclesCount: 0
  },
  {
    id: "boao-2",
    subjectId: SubjectId.SURGICAL,
    type: "noun",
    title: "倾倒综合征 (Dumping Syndrome)",
    answer: "胃大部切除术后，由于幽门失去控制，高渗性快速排空的胃内容物迅速流向空肠，导致静脉回心血量减低、血糖急剧变动产生的一系列消化道（腹胀、恶心、腹泻）和血管舒缩症状（出冷汗、心悸、全身无力）。",
    hint: "博傲主讲口诀：餐后半小时内发生称‘早期倾倒’，餐后2-4小时低血糖发生称‘晚期倾倒’。复游多注意平卧位休息。",
    createdAt: Date.now() - 400000,
    ebbinghausStage: 2,
    nextReviewTime: Date.now() - 30000, // ready to review
    recyclesCount: 0
  },
  {
    id: "boao-3",
    subjectId: SubjectId.BASIC,
    type: "cloze",
    title: "抢救青霉素过敏性休克时，成人首选皮下注射 0.1% 盐酸肾上腺素的常用剂量是 ___ ml。若病情未缓解，可行隔 ___ 分钟重复注射一次，直至脱离危险。",
    answer: "0.5~1.0; 15~20",
    hint: "基护必背核心抢救数值，绝对不容有失，注意是皮下或肌肉注射，不可直接推注静脉（除非危重）。",
    createdAt: Date.now() - 300000,
    ebbinghausStage: 3,
    nextReviewTime: Date.now() - 10000, // ready to review
    recyclesCount: 0
  },
  {
    id: "boao-4",
    subjectId: SubjectId.INTRO,
    type: "noun",
    title: "压力源 (Stressor / 紧张源)",
    answer: "指能导致机体产生压力反应（包括生理和心理的不平衡及紧张状态）的一切外界和内部刺激物，包括物理的、生理的、社会文化的、心理和脑力的各种因素。",
    hint: "纽曼模型核心词，纽曼关注压力源对正常防线 and 抵抗线发起的冲击程度。",
    createdAt: Date.now() - 200000,
    ebbinghausStage: 0,
    nextReviewTime: Date.now() - 5000, // ready
    recyclesCount: 0
  },
  {
    id: "boao-5",
    subjectId: SubjectId.BASIC,
    type: "cloze",
    title: "高压蒸汽灭菌法中，灭菌包的有效期在一般常温干燥环境下为 ___ 天；而无菌持物钳若是干燥保存，则每次开封使用期限通常是 ___ 小时。",
    answer: "7~14; 4",
    hint: "博傲常温考点：潮湿季节缩短。湿保存的持物钳每周更换2次。干燥法仅限4小时更换，防止细菌滋长。",
    createdAt: Date.now() - 100000,
    ebbinghausStage: 1,
    nextReviewTime: Date.now() + 500000, // not yet due
    recyclesCount: 0
  }
];

interface ReviewDeckProps {
  currentUser?: FirebaseUser | null;
}

export default function ReviewDeckView({ currentUser = null }: ReviewDeckProps) {
  const [deck, setDeck] = useState<UserCustomCard[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId | "all">("all");
  const [activeType, setActiveType] = useState<"all" | "noun" | "cloze">("all");
  const [ebbinghausFilter, setEbbinghausFilter] = useState<"all" | "due" | "mastered">("due");
  const [searchQuery, setSearchQuery] = useState("");
  const [simulatedTimeOffsetMs, setSimulatedTimeOffsetMs] = useState(0);

  // Self test player states
  const [studyMode, setStudyMode] = useState<"list" | "learn" | "review">("list");
  const [testIdx, setTestIdx] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [clozeUserAnswer, setClozeUserAnswer] = useState("");
  const [isClozeCorrect, setIsClozeCorrect] = useState<boolean | null>(null);

  // Form Adding State
  const [formType, setFormType] = useState<"noun" | "cloze">("noun");
  const [formSubject, setFormSubject] = useState<SubjectId>(SubjectId.INTERNAL);
  const [formTitle, setFormTitle] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formHint, setFormHint] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  // Delete & default-restore interactive fallbacks (Avoid window.confirm!)
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);


  // Load and manage custom review cards (local and cloud sync auto-handling)
  useEffect(() => {
    let localCards: UserCustomCard[] = [];
    const cached = localStorage.getItem("care_custom_review_deck");
    if (cached) {
      try {
        localCards = JSON.parse(cached);
      } catch (e) {
        localCards = PRE_POPULATED_BOAO_NOTES;
      }
    } else {
      localCards = PRE_POPULATED_BOAO_NOTES;
      localStorage.setItem("care_custom_review_deck", JSON.stringify(PRE_POPULATED_BOAO_NOTES));
    }

    if (currentUser) {
      setIsSyncing(true);
      bulkSyncCardsToCloud(currentUser.uid, localCards)
        .then((merged) => {
          setDeck(merged);
          localStorage.setItem("care_custom_review_deck", JSON.stringify(merged));
        })
        .catch((e) => {
          console.error("Cloud sync cards failed, falling back to local: ", e);
          setDeck(localCards);
        })
        .finally(() => setIsSyncing(false));
    } else {
      setDeck(localCards);
    }
  }, [currentUser]);

  const saveDeck = (newDeck: UserCustomCard[]) => {
    setDeck(newDeck);
    localStorage.setItem("care_custom_review_deck", JSON.stringify(newDeck));
  };


  // Add custom study card
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAnswer.trim()) {
      setAddFeedback("请完整填写[名词/题面]和[对应的解释/填空答案]！");
      return;
    }

    const newCard: UserCustomCard = {
      id: `user-${Date.now()}`,
      subjectId: formSubject,
      type: formType,
      title: formTitle.trim(),
      answer: formAnswer.trim(),
      hint: formHint.trim() || undefined,
      createdAt: Date.now(),
      ebbinghausStage: 0, // Start at 0 (Unlearned/New!)
      nextReviewTime: Date.now(),
      recyclesCount: 0
    };

    const updated = [newCard, ...deck];
    saveDeck(updated);

    if (currentUser) {
      uploadUserCard(currentUser.uid, newCard);
    }
    
    // Reset Form
    setFormTitle("");
    setFormAnswer("");
    setFormHint("");
    setAddFeedback("🎉 成功录入！此考点已同步载入您的待学清单，首次自测过关后将送入艾宾浩斯复习卡盒。");
    
    // Clear feedback after 3 seconds
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const confirmDeleteCard = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = deck.filter((c) => c.id !== id);
    saveDeck(updated);

    if (currentUser) {
      removeUserCard(currentUser.uid, id);
    }
    
    // Safety wrap for active test navigation
    if (testIdx >= updated.length) {
      setTestIdx(Math.max(0, updated.length - 1));
    }
    setCardIdToDelete(null);
  };

  // Mark a new card as learned and transition it to Stage 1 (Ebbinghaus curve begins)
  const markAsLearned = (cardId: string) => {
    const updated = deck.map((c) => {
      if (c.id !== cardId) return c;
      const updatedCard: UserCustomCard = {
        ...c,
        ebbinghausStage: 1, // Start on Stage 1 (5 mins)
        nextReviewTime: Date.now() + 5 * 60 * 1000,
        recyclesCount: 0
      };
      if (currentUser) {
        uploadUserCard(currentUser.uid, updatedCard);
      }
      return updatedCard;
    });

    saveDeck(updated);

    setAddFeedback("🎉 恭喜！该考点已成功‘自测过关’，进入艾宾浩斯复习曲线轮转！");
    setTimeout(() => setAddFeedback(null), 3000);

    setIsAnswerRevealed(false);
    setClozeUserAnswer("");
    setIsClozeCorrect(null);

    // Dynamic index adjustment
    const remainingCount = updated.filter(c => (c.ebbinghausStage || 0) === 0).length;
    if (testIdx >= remainingCount) {
      setTestIdx(Math.max(0, remainingCount - 1));
    }
  };

  const updateEbbinghaus = (cardId: string, isCorrect: boolean) => {
    const updated = deck.map((c) => {
      if (c.id !== cardId) return c;
      const currentStage = c.ebbinghausStage || 0;
      let nextStage = 0;
      let recycles = c.recyclesCount || 0;
      
      if (isCorrect) {
        nextStage = Math.min(8, currentStage + 1);
      } else {
        nextStage = 1; // Forget resets back to Stage 1 (5 mins)
        recycles += 1;
      }
      
      const intervalMs = EBBINGHAUS_INTERVALS[nextStage].ms;
      const nextReview = Date.now() + intervalMs;
      
      const updatedCard: UserCustomCard = {
        ...c,
        ebbinghausStage: nextStage,
        nextReviewTime: nextReview,
        recyclesCount: recycles
      };

      if (currentUser) {
        uploadUserCard(currentUser.uid, updatedCard);
      }
      return updatedCard;
    });
    
    saveDeck(updated);
  };

  const handleNextTest = () => {
    setIsAnswerRevealed(false);
    setClozeUserAnswer("");
    setIsClozeCorrect(null);
    if (testIdx < filteredDeck.length - 1) {
      setTestIdx((prev) => prev + 1);
    } else {
      setTestIdx(0); // wrap around
    }
  };

  // Evaluate cloze answer
  const checkClozeAnswer = () => {
    if (filteredDeck.length === 0) return;
    const card = filteredDeck[testIdx];
    setIsAnswerRevealed(true);
    
    // A simple normalized check
    const cleanUser = clozeUserAnswer.trim().toLowerCase();
    const cleanSystem = card.answer.toLowerCase();
    
    if (cleanUser && (cleanSystem.includes(cleanUser) || cleanUser.includes(cleanSystem))) {
      setIsClozeCorrect(true);
    } else {
      setIsClozeCorrect(false);
    }
  };

  // Reset to original pre-populated set
  const handleRestoreDefaults = () => {
    saveDeck(PRE_POPULATED_BOAO_NOTES);
    setTestIdx(0);
    setStudyMode("list");
    setShowRestoreConfirm(false);

    if (currentUser) {
      // Sync defaults to Cloud Firestore
      for (const card of PRE_POPULATED_BOAO_NOTES) {
        uploadUserCard(currentUser.uid, card);
      }
    }
  };

  // Filter strategy
  const filteredDeck = deck.filter((card) => {
    const matchesSubject = activeSubjectId === "all" || card.subjectId === activeSubjectId;
    const matchesType = activeType === "all" || card.type === activeType;
    
    // Segment by studyMode tabs
    if (studyMode === "learn") {
      // Only unlearned cards (Stage 0) in learning tab
      if ((card.ebbinghausStage || 0) !== 0) return false;
    } else if (studyMode === "review") {
      // Only learned cards (Stage > 0) in review tab
      if ((card.ebbinghausStage || 0) === 0) return false;

      // STRICT RULE: Only filter by due time when the user specifically selects "due" (今日超期温故) or "mastered" (已通关且待温故)
      if (ebbinghausFilter === "due" || ebbinghausFilter === "mastered") {
        const isDue = card.nextReviewTime ? (Date.now() + simulatedTimeOffsetMs) >= card.nextReviewTime : true;
        if (!isDue) return false;
      }

      // Ebbinghaus filter logic inside review mode
      if (ebbinghausFilter === "mastered") {
        // Completed / mastered on Stage 8
        if ((card.ebbinghausStage || 0) !== 8) return false;
      }
    }

    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      card.title.toLowerCase().includes(term) || 
      card.answer.toLowerCase().includes(term) || 
      (card.hint && card.hint.toLowerCase().includes(term));

    return matchesSubject && matchesType && matchesSearch;
  });

  // Defensive check for testIdx safety
  useEffect(() => {
    if (filteredDeck.length > 0 && testIdx >= filteredDeck.length) {
      setTestIdx(filteredDeck.length - 1);
    }
  }, [filteredDeck.length, testIdx]);

  const activeTestCard = filteredDeck[testIdx];

  // Ebbinghaus perpetual exam planning variables
  const targetExamDate = new Date("2026-12-26T00:00:00");
  const diffTime = targetExamDate.getTime() - Date.now();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const countStage0 = deck.filter((c) => (c.ebbinghausStage || 0) === 0).length;
  const countStage1to3 = deck.filter((c) => (c.ebbinghausStage || 0) >= 1 && (c.ebbinghausStage || 0) <= 3).length;
  const countStage4to7 = deck.filter((c) => (c.ebbinghausStage || 0) >= 4 && (c.ebbinghausStage || 0) <= 7).length;
  const countStage8 = deck.filter((c) => (c.ebbinghausStage || 0) === 8).length;

  // Weighted retention calculation reflecting probability curve of real Ebbinghaus curve values, decaying if time-travelled past due time without reviewing
  const retentionScore = deck.length === 0 ? 0 : Math.round(
    deck.reduce((sum, c) => {
      const st = c.ebbinghausStage || 0;
      let baseRet = 10;
      if (st === 8) baseRet = 99;
      else if (st === 7) baseRet = 90;
      else if (st === 6) baseRet = 80;
      else if (st === 5) baseRet = 70;
      else if (st === 4) baseRet = 55;
      else if (st === 3) baseRet = 40;
      else if (st === 2) baseRet = 25;
      else baseRet = 15;

      // Scientific forgetting curve decay
      if (c.nextReviewTime && (Date.now() + simulatedTimeOffsetMs) > c.nextReviewTime) {
        const overDueHours = ((Date.now() + simulatedTimeOffsetMs) - c.nextReviewTime) / (1000 * 60 * 60);
        const halfLifeHours = st === 8 ? 360 : st === 7 ? 168 : st === 6 ? 96 : st === 5 ? 48 : st === 4 ? 24 : st === 3 ? 12 : st === 2 ? 4 : 1;
        const decayFactor = Math.pow(0.5, overDueHours / halfLifeHours);
        baseRet = Math.max(8, Math.round(baseRet * decayFactor));
      }

      return sum + baseRet;
    }, 0) / deck.length
  );

  return (
    <div className="space-y-6" id="review-deck-container">
      {/* Banner Intro */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-sm border border-slate-800" id="deck-header-banner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6" id="deck-banner-meta">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold uppercase tracking-wider mb-3">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>博傲课后课随堂手记 👩‍⚕️</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" id="deck-tab-headline">
              自研知识卡盒 & 挖空仿真特训
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
              觉得死记硬背效率低下？把博傲随堂听、重难点、名词解释随手载入进来，
              系统将自动生成<strong>「名词自测卡」</strong>和<strong>「填空/挖空检测机制」</strong>，帮您突破临界记忆值，提分百分百！
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0" id="deck-top-actions">
            {currentUser && (
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  setSyncFeedback(null);
                  try {
                    const localCards = JSON.parse(localStorage.getItem("care_custom_review_deck") || "[]");
                    const merged = await bulkSyncCardsToCloud(currentUser.uid, localCards);
                    setDeck(merged);
                    localStorage.setItem("care_custom_review_deck", JSON.stringify(merged));
                    setSyncFeedback("同步成功！");
                    setTimeout(() => setSyncFeedback(null), 3000);
                  } catch (e) {
                    console.error("Cloud card sync failed: ", e);
                    setSyncFeedback("同步失败！");
                    setTimeout(() => setSyncFeedback(null), 3000);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSyncing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <span>☁️</span>}
                <span>
                  {isSyncing ? "云端同步中..." : syncFeedback ? `🎉 ${syncFeedback}` : "手动同步备份卡盒"}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
                showAddForm 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "收起输入框" : "手动录入新知识点"}</span>
            </button>
            {showRestoreConfirm ? (
              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-rose-500/80 animate-in fade-in duration-200">
                <span className="text-[10px] text-rose-300 font-bold px-2">将清空您自建的所有卡片，确认恢复吗？</span>
                <button
                  onClick={handleRestoreDefaults}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] rounded-lg font-bold transition"
                >
                  确定恢复
                </button>
                <button
                  onClick={() => setShowRestoreConfirm(false)}
                  className="px-2.5 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-lg transition"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRestoreConfirm(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition font-medium border border-slate-700/60"
              >
                恢复样条错题卡
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ⏰ Ebbinghaus Exam Perpetual Planner and Retention Predictor Section */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs space-y-4" id="ebbinghaus-exam-planner">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100" id="ebbinghaus-meta-header">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span className="font-extrabold text-sm sm:text-base text-gray-900">⏰ 艾宾浩斯研途全国大考通关决策面板</span>
          </div>
          <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[10.5px] font-extrabold px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono">
            <span>2026年终大考倒计时:</span>
            <span className="text-xs text-rose-600 animate-pulse">{diffDays} 天</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ebbinghaus-data-grid">
          
          {/* Card Box stats Column */}
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 flex flex-col justify-between" id="ebbinghaus-col-box">
            <div>
              <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider mb-1">随堂记忆卡盒荷载</span>
              <div className="flex items-baseline gap-1" id="total-card-stats">
                <span className="text-2xl font-black text-slate-900 font-mono">{deck.length}</span>
                <span className="text-xs text-gray-500 font-semibold">个核心要害词</span>
              </div>
            </div>
            <p className="text-[10.5px] text-gray-400 leading-relaxed mt-2">
              建议结合“随堂听、重难考点、错解定义”进行不间断录入，卡盒深度越佳，知识覆盖率就越完美！
            </p>
          </div>

          {/* Retention and Curve forecasting Column */}
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-2 flex flex-col justify-between" id="ebbinghaus-col-curve">
            <div>
              <div className="flex justify-between items-center" id="retention-score-lbl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">大考瞬时记忆存备率</span>
                <span className="text-xs text-emerald-700 font-black font-mono">{retentionScore}%</span>
              </div>
              <div className="w-full bg-gray-250 h-2 rounded-full overflow-hidden mt-1.5" id="retention-score-progress bg">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${retentionScore}%` }}
                  id="retention-score-progress-fill"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              系统根据您每张卡盒当前所处的复习深度（根据艾宾浩斯遗忘权重 0.2 至 15天阶段）加权推演出的理论大考存留百分比。
            </p>
          </div>

          {/* Perpetual standard description Column */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between" id="ebbinghaus-col-perpetual">
            <h4 className="font-extrabold text-[11px] text-emerald-850 flex items-center gap-1">
              <span>🎯 终身不老记忆轮流温故说明</span>
              <span className="bg-emerald-600 text-white font-mono text-[7px] px-1.5 py-0.2 rounded-full">CORE</span>
            </h4>
            <p className="text-[10.5px] text-emerald-800 leading-relaxed mt-1.5 font-sans font-semibold">
              为保障复习自考模式<strong>彻底一直持续到考前</strong>，即使卡片达到最高 <strong>Stage 8 (终极熟记 💯)</strong>，也会遵循艾宾浩斯终极保护，每隔 <strong>15 天</strong>全自动轮出复查一次，保证长期记忆链条绝不退化瓦解！
            </p>
          </div>
        </div>

        {/* ⏱️ Ebbinghaus Time Travel Simulator (Scientific Forgetting Verification Desk) */}
        <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3" id="ebbinghaus-time-machine">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 animate-pulse text-xs">⏱️</span>
              <span className="text-xs font-black">艾宾浩斯科学遗忘模拟时光机</span>
              <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                SIMULATION
              </span>
            </div>
            {simulatedTimeOffsetMs > 0 && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-900/40">
                已向后飞跃：{(simulatedTimeOffsetMs / (1000 * 60 * 60 * 24)).toFixed(1)} 天后
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400 leading-relaxed">
            由于大考记忆是一个持续性过程，通过下方飞跃按钮可测试由于<strong>“时间流逝而不断遗忘”</strong>的科学规律。您将直观看见随着天数变迁，卡片何时会批量变为<strong>“⚡ 超期需温”</strong>，以及记忆存备率的真实消退！
          </p>
          
          <div className="flex flex-wrap gap-2 pt-1" id="time-travel-actions">
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(0)}
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 0 
                  ? "bg-emerald-600 text-white shadow-xs" 
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🔄 重置到此刻
            </button>
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(1 * 60 * 60 * 1000)} // 1 hour
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 1 * 60 * 60 * 1000 ? "bg-amber-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🚀 1小时后
            </button>
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(1 * 24 * 60 * 60 * 1000)} // 1 day
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 1 * 24 * 60 * 60 * 1000 ? "bg-amber-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🚀 1天后 (24h)
            </button>
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(4 * 24 * 60 * 60 * 1000)} // 4 days
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 4 * 24 * 60 * 60 * 1000 ? "bg-amber-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🚀 4天后
            </button>
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(7 * 24 * 60 * 60 * 1000)} // 7 days
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 7 * 24 * 60 * 60 * 1000 ? "bg-amber-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🚀 7天后
            </button>
            <button
              type="button"
              onClick={() => setSimulatedTimeOffsetMs(15 * 24 * 60 * 60 * 1000)} // 15 days
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                simulatedTimeOffsetMs === 15 * 24 * 60 * 60 * 1000 ? "bg-amber-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              🚀 15天后 (终极轮转温故)
            </button>
          </div>
        </div>

        {/* Dynamic stage distribution visual dots timeline */}
        <div className="bg-slate-50 p-3 rounded-xl border border-gray-150 flex flex-wrap gap-4 items-center justify-between text-xs" id="ebbinghaus-timeline-belt">
          <span className="text-[10px] font-bold text-gray-400 tracking-wide">记忆曲段分布：</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5" id="ebbinghaus-dots-row">
            <div className="flex items-center gap-1.5" id="lbl-stage-0">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
              <span>待启学 {countStage0}</span>
            </div>
            <div className="flex items-center gap-1.5" id="lbl-stage-1to3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>短期启动区 {countStage1to3}</span>
            </div>
            <div className="flex items-center gap-1.5" id="lbl-stage-4to7">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>潜意识中效区 {countStage4to7}</span>
            </div>
            <div className="flex items-center gap-1.5" id="lbl-stage-8">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
              <span>终身锁定抗退化 {countStage8}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input Add Form Widget */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-300" id="card-addition-form-box">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100" id="form-heading-row">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm md:text-base">新增我的博傲随堂考点卡 (308 护理)</h3>
          </div>

          <form onSubmit={handleAddCard} className="space-y-4" id="add-card-inner-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-grid-top">
              {/* Type selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">卡片模式类型</label>
                <div className="flex gap-2" id="toggle-type-btns">
                  <button
                    type="button"
                    onClick={() => { setFormType("noun"); setFormTitle(""); setFormAnswer(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                      formType === "noun" 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    📝 名词解释
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType("cloze"); setFormTitle(""); setFormAnswer(""); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                      formType === "cloze" 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    🕳️ 挖空填空
                  </button>
                </div>
              </div>

              {/* Subject selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">目标对应科目</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value as SubjectId)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                  id="form-subject-select"
                >
                  {(Object.keys(SUBJECTS) as SubjectId[]).map((id) => (
                    <option key={id} value={id}>
                      {SUBJECTS[id].name} (考分 {SUBJECTS[id].ratio})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mnemonic / Course source */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">随堂提示/背诵口诀/第几讲 (选填)</label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="例如：博傲主讲口诀：见尿补钾 / 难点容易混"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                  id="form-hint-input"
                />
              </div>
            </div>

            {/* Title description depending on type */}
            <div id="form-title-block">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                {formType === "noun" ? "请输入需要背诵的名词 (名词定义)" : "请输入需要记忆的挖空题面 (请用 ___ 符号代表挖空位置)"}
              </label>
              <textarea
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={
                  formType === "noun" 
                    ? "例如：麦氏点 (McBurney 点)" 
                    : "例如：留置单次导尿患者，第一次放尿量严格限制不可超过 ___ ml，以防发生虚脱及血尿。"
                }
                rows={2}
                className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white leading-relaxed"
                id="form-title-textarea"
              />
            </div>

            {/* Answer details depending on type */}
            <div id="form-answer-block">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                {formType === "noun" ? "请输入此名词的教科书级标准解释：" : "请输入正确的挖空标准答案："}
              </label>
              <textarea
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder={
                  formType === "noun" 
                    ? "例如：指右髂前上棘与脐连线的中外1/3交界处，为急性阑尾炎的典型压痛反应区。" 
                    : "例如：1000"
                }
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white leading-relaxed font-mono"
                id="form-answer-textarea"
              />
            </div>

            {/* Feedbacks & Submit button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100" id="form-submit-row">
              <span className="text-xs font-semibold text-emerald-600" id="form-feedback-text">
                {addFeedback && addFeedback}
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                id="btn-add-card-submit"
              >
                💾 确认保存并录入卡盒
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode Switches & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 border-b border-gray-100" id="deck-filters-bar">
        {/* Toggle Mode: 3 Windows */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-gray-200/50" id="toggle-study-mode-box">
          <button
            onClick={() => { setStudyMode("list"); setTestIdx(0); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              studyMode === "list" 
                ? "bg-white text-emerald-950 shadow-xs" 
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            📋 手记库 ({deck.length})
          </button>
          <button
            onClick={() => { setStudyMode("learn"); setTestIdx(0); setIsAnswerRevealed(false); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              studyMode === "learn" 
                ? "bg-emerald-600 text-white shadow-xs" 
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            🆕 新词待学 ({deck.filter(c => (c.ebbinghausStage || 0) === 0).length})
          </button>
          <button
            onClick={() => { setStudyMode("review"); setTestIdx(0); setIsAnswerRevealed(false); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              studyMode === "review" 
                ? "bg-indigo-650 bg-indigo-600 text-white shadow-xs" 
                : "text-indigo-600 hover:text-indigo-900 bg-indigo-50/60"
            }`}
          >
            🎯 艾氏复习 (已入轨: {deck.filter(c => (c.ebbinghausStage || 0) > 0).length} | 待温故: {deck.filter(c => (c.ebbinghausStage || 0) > 0 && (c.nextReviewTime ? (Date.now() + simulatedTimeOffsetMs) >= c.nextReviewTime : true)).length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2" id="filter-dropdowns">
          {/* Ebbinghaus Filter (Only shown for Review mode) */}
          {studyMode === "review" && (
            <select
              value={ebbinghausFilter}
              onChange={(e) => { setEbbinghausFilter(e.target.value as any); setTestIdx(0); }}
              className="text-xs p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold"
              id="filter-ebbinghaus-dropdown"
            >
              <option value="due">🚀 艾氏复习 (仅看今日到期温故)</option>
              <option value="all">📊 艾氏复习 (查看全部复习卡)</option>
              <option value="mastered">🏆 艾氏复习 (仅看已彻底通关考点)</option>
            </select>
          )}

          {/* Card filter Type */}
          <select
            value={activeType}
            onChange={(e) => { setActiveType(e.target.value as any); setTestIdx(0); }}
            className="text-xs p-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold"
            id="filter-type-dropdown"
          >
            <option value="all">所有卡片类型</option>
            <option value="noun">仅看【名词解释】</option>
            <option value="cloze">仅看【挖空填空】</option>
          </select>

          {/* Subject filter */}
          <select
            value={activeSubjectId}
            onChange={(e) => { setActiveSubjectId(e.target.value as any); setTestIdx(0); }}
            className="text-xs p-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold"
            id="filter-subject-dropdown"
          >
            <option value="all">全部考点学科</option>
            {(Object.keys(SUBJECTS) as SubjectId[]).map((id) => (
              <option key={id} value={id}>
                {SUBJECTS[id].name}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="relative" id="filter-search-container">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索考点名词、答案要害词..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-hidden focus:border-emerald-500"
              id="search-deck-input"
            />
          </div>
        </div>
      </div>

      {/* CORE DISPLAY (Three paths depending on selected study mode) */}
      {studyMode === "list" ? (
        /* GRID DECK LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="deck-grid-items">
          {filteredDeck.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white border border-gray-200 rounded-2xl text-gray-400" id="filtered-deck-empty">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">未找到符合当前条件的考点卡片</h4>
              <p className="text-xs text-gray-500 mt-1 mb-4">您可以清除搜索筛选项，或在上方点击“手动录入新知识点”建立自己的首张卡片。</p>
            </div>
          ) : (
            filteredDeck.map((card) => {
              const sub = SUBJECTS[card.subjectId];
              return (
                <div
                  key={card.id}
                  id={`review-card-${card.id}`}
                  className="bg-white rounded-2xl border border-gray-100/90 shadow-xs hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subject and Card Type ribbons */}
                  <div className="flex items-center justify-between mb-3" id={`review-card-top-${card.id}`}>
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">
                      {sub.name}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                      card.type === "noun" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {card.type === "noun" ? "名词解释" : "挖空填空"}
                    </span>
                  </div>

                  {/* Body Title/Prompt */}
                  <div className="flex-1 space-y-2 mb-4" id={`review-card-body-${card.id}`}>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base leading-relaxed">
                      {card.title}
                    </h4>

                    {/* Ebbinghaus info in list card */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-[10px] text-slate-600">
                      <Brain className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold shrink-0">记忆阶段:</span>
                      <span className="text-emerald-800 font-extrabold px-1.5 py-0.5 bg-emerald-50 rounded-sm shrink-0">
                        {EBBINGHAUS_INTERVALS[card.ebbinghausStage || 0].label}
                      </span>
                      {card.ebbinghausStage === 0 ? (
                        <span className="bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded-sm shrink-0 animate-pulse">
                          🆕 待学新词
                        </span>
                      ) : card.nextReviewTime && (Date.now() + simulatedTimeOffsetMs) >= card.nextReviewTime ? (
                        <span className="bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.5 rounded-sm animate-pulse shrink-0">
                          ⚡ 超期需温
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-sm shrink-0">
                          🎯 仍在巩固
                        </span>
                      )}
                    </div>

                    {/* Show hidden reveal block */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200/50 space-y-1.5 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto font-mono">
                      <span className="text-[9px] uppercase font-bold text-emerald-700 block mb-1">精要记诵答案：</span>
                      <p>{card.answer}</p>
                    </div>

                    {card.hint && (
                      <div className="p-2 bg-rose-50 text-rose-700 text-[10px] rounded-md border border-rose-100 flex gap-1 items-start">
                        <Lightbulb className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>博傲重点: {card.hint}</span>
                      </div>
                    )}
                  </div>

                  {/* Date and Delete actions represent the footer */}
                  <div className="flex items-center justify-between border-t border-gray-100/80 pt-3 text-[10px] text-gray-400" id={`review-card-foot-${card.id}`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      自建日期: {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                    {cardIdToDelete === card.id ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] text-rose-500 font-bold">确认删除此随记吗？</span>
                        <button
                          onClick={() => confirmDeleteCard(card.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setCardIdToDelete(null)}
                          className="bg-gray-250 hover:bg-gray-300 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCardIdToDelete(card.id); }}
                        className="text-rose-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="从手记本中删去"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : studyMode === "learn" ? (
        /* LEARN WINDOW (ONLY UNLEARNED CARDS) */
        <div className="max-w-3xl mx-auto" id="self-learn-player-container">
          {filteredDeck.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs" id="learn-empty-notice">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 text-base">🎉 太棒了！新词待学过关清单已清空！</h4>
              <p className="text-gray-500 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                您录入的所有知识考点均已通过首次自学自测，并且成功送入了艾宾浩斯科学记忆曲线中。
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  ➕ 录入新考点
                </button>
                <button
                  onClick={() => { setStudyMode("review"); setTestIdx(0); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  🎯 前往艾宾浩斯复习窗口
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" id="learn-active-deck">
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden" id="active-learn-shell">
                
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-gray-100 gap-3" id="learn-meta-bar">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs font-bold text-gray-400">
                      🆕 新词初学过关: {testIdx + 1} / {filteredDeck.length} 道
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-max">
                      <Brain className="w-3 h-3" />
                      当前状态：未学新词 (Stage 0)
                    </span>
                  </div>
                  
                  <div className="flex gap-2 text-right justify-end" id="learn-tags-row">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase">
                      {SUBJECTS[activeTestCard.subjectId].name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase ${
                      activeTestCard.type === "noun" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {activeTestCard.type === "noun" ? "名词解释 📚" : "挖空填空 🕳️"}
                    </span>
                  </div>
                </div>

                {/* Question stage */}
                <div className="py-6 space-y-4 text-center" id="learn-question-box">
                  {activeTestCard.type === "noun" ? (
                    <div id="learn-noun-text">
                      <span className="text-xs text-gray-400 block mb-2 font-medium">请闭眼回忆，并试着口述解释以下医学名词的含义：</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        {activeTestCard.title}
                      </h3>
                    </div>
                  ) : (
                    <div id="learn-cloze-text">
                      <span className="text-xs text-gray-400 block mb-2 font-medium">请阅读题干，并在脑海中拼写或在下方打字写出缺省内容：</span>
                      <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-semibold bg-gray-50/50 p-4 rounded-xl border border-gray-100" id="learn-cloze-content-para">
                        {activeTestCard.title}
                      </p>
                    </div>
                  )}

                  {activeTestCard.hint && (
                    <div className="inline-flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full text-left" id="learn-hint-block">
                      <Lightbulb className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>博傲背诵诀窍：{activeTestCard.hint}</span>
                    </div>
                  )}
                </div>

                {/* Cloze input for learning */}
                {activeTestCard.type === "cloze" && !isAnswerRevealed && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-3 text-left" id="learn-cloze-check-box">
                    <label className="block text-xs font-bold text-gray-500">✍️ 拼写我的备考自测词：</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={clozeUserAnswer}
                        onChange={(e) => setClozeUserAnswer(e.target.value)}
                        placeholder="在此尝试输入答案..."
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
                        id="learn-cloze-input"
                      />
                      <button
                        onClick={checkClozeAnswer}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                      >
                        核对答案
                      </button>
                    </div>
                  </div>
                )}

                {/* Answer reveal container */}
                <div className="border-t border-gray-100 pt-6">
                  {isAnswerRevealed ? (
                    <div className="bg-emerald-50 bg-opacity-70 p-5 rounded-2xl border border-emerald-100 space-y-4 text-left animate-in fade-in duration-300">
                      {activeTestCard.type === "cloze" && isClozeCorrect !== null && (
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {isClozeCorrect ? (
                            <span className="text-emerald-700 text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              拼写完全匹配！记忆过关。
                            </span>
                          ) : (
                            <span className="text-rose-700 text-xs flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-rose-500 fill-rose-100" />
                              略有差异，让我们对照官方精准大纲：
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                          教科书/博傲标准答案：
                        </span>
                        <p className="text-slate-900 font-mono text-sm leading-relaxed whitespace-pre-line">
                          {activeTestCard.answer}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] text-gray-400 italic">
                        理解该定义之后，请点击下方「自测已过关」将其移入艾宾浩斯曲线，进入循环复习。
                      </div>
                    </div>
                  ) : (
                    activeTestCard.type === "noun" && (
                      <button
                        onClick={() => setIsAnswerRevealed(true)}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 transition text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>🧐 我想好了，点击核对标准教科书释义</span>
                      </button>
                    )
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {isAnswerRevealed ? (
                      <button
                        onClick={() => markAsLearned(activeTestCard.id)}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>🚀 自测已过关，送入复习通道</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAnswerRevealed(true)}
                        className="px-4 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        亮出标准答案
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleNextTest}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>看下一个</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      ) : (
        /* REVIEW WINDOW (ONLY LEARNED CARDS IN EBBINGHAUS) */
        <div className="max-w-3xl mx-auto" id="self-review-player-container">
          {filteredDeck.length === 0 ? (
            <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-12 text-center shadow-xs" id="review-empty-notice">
              <CheckCircle2 className="w-14 h-14 text-indigo-500 mx-auto mb-3" />
              {deck.filter(c => (c.ebbinghausStage || 0) > 0).length === 0 ? (
                <>
                  <h4 className="font-black text-indigo-900 text-base">
                    🎯 您的艾宾浩斯复习库目前还是空的
                  </h4>
                  <p className="text-gray-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                    您录入的所有新考点目前都在「🆕 新词待学」清单中。请先前往待学清单进行首次自测，一旦自测过关，考点就会被自动送入艾宾浩斯记忆曲线并在这里开始复习！
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-black text-indigo-900 text-base">
                    🎉 绝妙！当前筛选条件/到期时间下没有需要温故的卡片！
                  </h4>
                  <p className="text-gray-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                    全库共有 <strong>{deck.filter(c => (c.ebbinghausStage || 0) > 0).length}</strong> 张考点卡片已载入记忆曲线中稳步轮转。由于暂未到期，它们被智能隐藏了。您可以切换上方筛选下拉框为「📊 查看全部复习卡」以预览它们，或拉动上方的「科学遗忘时光机」模拟未来遗忘走势！
                  </p>
                </>
              )}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => { setStudyMode("list"); setTestIdx(0); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  📋 浏览手记库全量卡片
                </button>
                <button
                  onClick={() => { setStudyMode("learn"); setTestIdx(0); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  🆕 前往「新词待学过关」
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
                
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-gray-100 gap-3">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs font-bold text-indigo-950">
                      艾氏复习轮转: {testIdx + 1} / {filteredDeck.length} 道
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-max">
                      <Brain className="w-3 h-3 text-indigo-500" />
                      当前记忆阶段：{EBBINGHAUS_INTERVALS[activeTestCard.ebbinghausStage || 0].label}
                      {activeTestCard.recyclesCount && activeTestCard.recyclesCount > 0 ? ` (已巩固重温过 ${activeTestCard.recyclesCount} 回)` : ""}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 text-right justify-end">
                    <span className="bg-indigo-50 text-indigo-800 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase">
                      {SUBJECTS[activeTestCard.subjectId].name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase ${
                      activeTestCard.type === "noun" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {activeTestCard.type === "noun" ? "名词解释 📚" : "挖空填空 🕳️"}
                    </span>
                  </div>
                </div>

                {/* Question stage */}
                <div className="py-6 space-y-4 text-center">
                  {activeTestCard.type === "noun" ? (
                    <div>
                      <span className="text-xs text-gray-400 block mb-2 font-medium">请自我对照回忆，并口头核验以下医学名词的含义：</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        {activeTestCard.title}
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-gray-400 block mb-2 font-medium">请阅读，并尝试回忆空缺的考点内容：</span>
                      <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-semibold bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        {activeTestCard.title}
                      </p>
                    </div>
                  )}

                  {activeTestCard.hint && (
                    <div className="inline-flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full text-left">
                      <Lightbulb className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>博傲讲义重点：{activeTestCard.hint}</span>
                    </div>
                  )}
                </div>

                {/* Cloze test in review */}
                {activeTestCard.type === "cloze" && !isAnswerRevealed && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-3 text-left">
                    <label className="block text-xs font-bold text-gray-500">✍️ 请拼写进行温故对照：</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={clozeUserAnswer}
                        onChange={(e) => setClozeUserAnswer(e.target.value)}
                        placeholder="打字输入您的印象词汇..."
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        onClick={checkClozeAnswer}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                      >
                        核对答案
                      </button>
                    </div>
                  </div>
                )}

                {/* Answer reveal container */}
                <div className="border-t border-gray-100 pt-6">
                  {isAnswerRevealed ? (
                    <div className="bg-indigo-50 bg-opacity-70 p-5 rounded-2xl border border-indigo-100 space-y-4 text-left animate-in fade-in duration-300">
                      {activeTestCard.type === "cloze" && isClozeCorrect !== null && (
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {isClozeCorrect ? (
                            <span className="text-emerald-700 text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              印象契合！记诵完全正确。
                            </span>
                          ) : (
                            <span className="text-rose-750 text-rose-800 text-xs flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-rose-500 fill-rose-100" />
                              有一些细节偏差，让我们来核验教科书级答案：
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-extrabold text-indigo-850 uppercase tracking-wider block mb-1">
                          博傲大纲标准解剖：
                        </span>
                        <p className="text-slate-900 font-mono text-sm leading-relaxed whitespace-pre-line">
                          {activeTestCard.answer}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] text-gray-400 italic">
                        核对完毕了吗？请点击下方反馈，完成艾宾浩斯阶梯提升或重温巩固：
                      </div>
                    </div>
                  ) : (
                    activeTestCard.type === "noun" && (
                      <button
                        onClick={() => setIsAnswerRevealed(true)}
                        className="w-full py-4 bg-indigo-950 hover:bg-indigo-900 transition text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>🧐 细想几秒并口述，点击比对教科书标准定义</span>
                      </button>
                    )
                  )}
                </div>

                {/* Flip helpers and next */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {isAnswerRevealed && (
                      <>
                        <button
                          onClick={() => { updateEbbinghaus(activeTestCard.id, true); handleNextTest(); }}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>顺利记起 (晋级下一个阶段)</span>
                        </button>
                        <button
                          onClick={() => { updateEbbinghaus(activeTestCard.id, false); handleNextTest(); }}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-rose-100 cursor-pointer"
                        >
                          <span>残缺/忘了 (重温巩固)</span>
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleNextTest}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>换下一张</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Encouragement disclaimer */}
      <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl border border-amber-100 text-xs leading-relaxed flex gap-2" id="deck-helper-notes">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-bold">博傲随学心得：</span>
          护理学硕士考试对于医学专业词汇要求极高，尤其是各种并发症和诊断数值。对于像
          <strong>「高钾低钾心电图」</strong>、<strong>「门静脉高压侧支循环」</strong>、<strong>「隔离预防色标」</strong>建议多多录入此卡盒，
          反复调取「新词待学过关」与「艾氏复习窗口」进行循环磨砺，在考场抢分绝对得心应手！
        </div>
      </div>
    </div>
  );
}
