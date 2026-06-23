import React, { useState } from "react";
import { Flashcard, SubjectId } from "../types";
import { FLASHCARDS } from "../data/flashcards";
import { SUBJECTS } from "../data/syllabus";
import { BookOpen, Sparkles, Check, HelpCircle, AlertCircle, RefreshCcw, Smile } from "lucide-react";

export default function FlashcardView() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | "all">("all");
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);

  const filteredCards = FLASHCARDS.filter(
    (fc) => selectedSubjectId === "all" || fc.subjectId === selectedSubjectId
  );

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleMastery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid flipping when clicking the mastery button
    setMasteredCards((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const resetAllFlashcards = () => {
    setFlippedCards([]);
    setMasteredCards([]);
  };

  return (
    <div className="space-y-6" id="flashcard-root">
      {/* Top Banner */}
      <div className="bg-emerald-900 rounded-3xl p-6 text-white text-center md:text-left md:flex justify-between items-center shadow-xs" id="flashcard-banner">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800 text-emerald-200 text-xs rounded-full font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>考前记忆特训</span>
          </div>
          <h2 className="text-2xl font-black mb-1">护理考研口诀背诵卡</h2>
          <p className="text-slate-200 text-xs max-w-xl leading-relaxed">
            临床细节极其繁杂？医学特训记忆卡帮您解决。点击背诵卡即可直接360°旋转翻动，背熟后打勾标记，高效攻克最后一百天！
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2 justify-center" id="flashcard-b-actions">
          <button
            onClick={resetAllFlashcards}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700/80 text-xs rounded-lg font-semibold transition flex items-center gap-1"
            id="btn-cards-reset"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>重置卡盒进度</span>
          </button>
        </div>
      </div>

      {/* Subject categories filter */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100" id="cards-filter-row">
        <button
          onClick={() => setSelectedSubjectId("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedSubjectId === "all"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
          id="btn-fc-all"
        >
          🗂️ 全部卡片 ({FLASHCARDS.length})
        </button>
        {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => (
          <button
            key={subId}
            id={`btn-fc-${subId}`}
            onClick={() => setSelectedSubjectId(subId)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              selectedSubjectId === subId
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {SUBJECTS[subId].name}
          </button>
        ))}
      </div>

      {/* Progress review indicators */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3.5 rounded-xl border" id="cards-indicators">
        <span>已加载本项卡片：<strong>{filteredCards.length}</strong> 张</span>
        <span>当前已记住：<strong className="text-emerald-600">{masteredCards.filter(id => FLASHCARDS.some(c => c.id === id)).length}</strong> 张芯片卡</span>
      </div>

      {/* Main Flashcard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="flashcard-grid">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border rounded-2xl text-gray-400 text-xs" id="fc-grid-empty">
            <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <span>此类别暂未载入内置记忆芯片卡。你可以往其他学科发掘。</span>
          </div>
        ) : (
          filteredCards.map((card) => {
            const isFlipped = flippedCards.includes(card.id);
            const isMastered = masteredCards.includes(card.id);
            const sub = SUBJECTS[card.subjectId];

            return (
              <div
                key={card.id}
                id={`card-container-${card.id}`}
                onClick={() => toggleFlip(card.id)}
                className="cursor-pointer group relative h-64 w-full"
                style={{ perspective: "1000px" }}
              >
                {/* Custom card body with flippable CSS transforms */}
                <div
                  id={`card-flipper-${card.id}`}
                  className={`relative w-full h-full transition-transform duration-500 rounded-2xl shadow-xs border ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT UPPER LAYER */}
                  <div
                    className={`absolute inset-0 w-full h-full p-6 rounded-2xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden ${
                      isMastered ? "bg-emerald-50/10 border-emerald-100" : ""
                    }`}
                    style={{ backfaceVisibility: "hidden" }}
                    id={`card-front-${card.id}`}
                  >
                    {/* Top elements */}
                    <div className="flex items-center justify-between" id={`card-front-top-${card.id}`}>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {sub.name}
                      </span>
                      <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                        {card.category}
                      </span>
                    </div>

                    {/* Middle title text */}
                    <div className="text-gray-900 font-bold text-lg text-center py-4 px-2" id={`card-front-question-${card.id}`}>
                      {card.front}
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between" id={`card-front-bottom-${card.id}`}>
                      <span className="text-[10px] text-gray-400">点击卡片翻转答案 🔄</span>
                      <button
                        onClick={(e) => toggleMastery(card.id, e)}
                        className={`p-2 rounded-full transition ${
                          isMastered
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-700"
                        }`}
                        title="标记此卡为已背熟"
                        id={`btn-fc-mastery-${card.id}`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* BACK UPPER LAYER */}
                  <div
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-slate-900 text-white flex flex-col justify-between overflow-y-auto"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                    id={`card-back-${card.id}`}
                  >
                    {/* Top elements on back */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2" id={`card-back-top-${card.id}`}>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {card.category}
                      </span>
                      <span className="text-[10px] text-slate-500">再次点击卡面转回表层 🔄</span>
                    </div>

                    {/* Main content scrollable */}
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line flex-1 text-left" id={`card-back-content-${card.id}`}>
                      {card.back}
                    </div>

                    {/* Mastered tick sign on back */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800" id={`card-back-bottom-${card.id}`}>
                      <div className="flex items-center gap-1.5" id="card-back-user-status">
                        {isMastered ? (
                          <>
                            <Smile className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-semibold">此条已牢记在心！</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] text-slate-500">还不太熟...多加温习</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={(e) => toggleMastery(card.id, e)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-sm transition ${
                          isMastered ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                        id={`btn-fc-toggle-mastery-back-${card.id}`}
                      >
                        {isMastered ? "设为未熟记" : "记住了"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
