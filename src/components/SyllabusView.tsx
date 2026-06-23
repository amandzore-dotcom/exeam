import React, { useState } from "react";
import { SubjectId, SubjectInfo } from "../types";
import { SUBJECTS, SYLLABUS_DATA } from "../data/syllabus";
import { HeartPulse, Activity, ShieldCheck, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

interface SyllabusViewProps {
  onSelectSubject: (id: SubjectId) => void;
}

export default function SyllabusView({ onSelectSubject }: SyllabusViewProps) {
  const [activeSubject, setActiveSubject] = useState<SubjectId>(SubjectId.INTERNAL);
  const [completedChapters, setCompletedChapters] = useState<string[]>(["int-1"]); // Initially one checked

  const currentSubjectInfo = SUBJECTS[activeSubject];
  const list = SYLLABUS_DATA[activeSubject] || [];

  const toggleChapter = (chapterId: string) => {
    setCompletedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const subjectIcons: Record<SubjectId, React.ReactNode> = {
    [SubjectId.INTERNAL]: <HeartPulse className="w-5 h-5 text-rose-500" id="icon-internal" />,
    [SubjectId.SURGICAL]: <Activity className="w-5 h-5 text-amber-500" id="icon-surgical" />,
    [SubjectId.BASIC]: <ShieldCheck className="w-5 h-5 text-blue-500" id="icon-basic" />,
    [SubjectId.INTRO]: <BookOpen className="w-5 h-5 text-teal-500" id="icon-intro" />,
  };

  const getSyllabusProgress = (subId: SubjectId) => {
    const chapters = SYLLABUS_DATA[subId] || [];
    if (chapters.length === 0) return 0;
    const completed = chapters.filter((ch) => completedChapters.includes(ch.id)).length;
    return Math.round((completed / chapters.length) * 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6" id="syllabus-container">
      {/* Subject Select Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" id="subject-tabs">
        {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => {
          const info = SUBJECTS[subId];
          const isActive = activeSubject === subId;
          const progress = getSyllabusProgress(subId);
          return (
            <button
              key={subId}
              id={`tab-${subId}`}
              onClick={() => setActiveSubject(subId)}
              className={`p-4 rounded-xl text-left border transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2" id={`tab-header-${subId}`}>
                {subjectIcons[subId]}
                <span className="font-medium text-gray-900 text-sm md:text-base">{info.name}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1 mb-2">{info.ratio}</p>
              
              {/* Simple progress bar */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden" id={`prog-bar-container-${subId}`}>
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                  id={`prog-bar-fill-${subId}`}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block text-right">已掌握 {progress}%</span>
            </button>
          );
        })}
      </div>

      {/* Main Syllabus Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="syllabus-breakdown">
        {/* Left Side: Overview & Fast Actions */}
        <div className="lg:col-span-1 bg-gray-50/50 rounded-xl p-5 border border-gray-100" id="syllabus-summary-box">
          <div className="flex items-center gap-2 mb-4" id="subj-summary-header">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              {subjectIcons[activeSubject]}
            </span>
            <div id="subj-summary-meta">
              <h3 className="font-semibold text-gray-900 text-lg">{currentSubjectInfo.name}</h3>
              <p className="text-xs text-gray-500">考分占比: {currentSubjectInfo.ratio}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {currentSubjectInfo.description}
          </p>

          <div className="space-y-3" id="quick-actions-syllabus">
            <button
              onClick={() => onSelectSubject(activeSubject)}
              className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              id="action-start-quiz"
            >
              ✍️ 进行本章真题仿真练
            </button>
            <div className="p-3 bg-blue-50/50 rounded-lg text-xs leading-relaxed text-blue-800 flex gap-2 border border-blue-100">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
              <div>
                <span className="font-bold">备考支招</span>：
                {activeSubject === SubjectId.INTERNAL && "注重各类内科急症的急救程序、药物中毒指征与输液速度管理。"}
                {activeSubject === SubjectId.SURGICAL && "围手术期体位（如半坐卧位）、外科休克补液公式和麻醉监测是每年经典必考选择。"}
                {activeSubject === SubjectId.BASIC && "青霉素过敏试验和抢救、过失判定、隔离规范和核心无菌包时效年年考。"}
                {activeSubject === SubjectId.INTRO && "理清PES公式、Orem三大护理系统、Roy四大效应器，这些都是送分题。"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chapter List with Hotspots */}
        <div className="lg:col-span-2 space-y-4" id="chapter-list-container">
          <h4 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-2">大纲考试高频模块 🔍</h4>
          {list.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center bg-gray-50 rounded-lg">正在载入更多考纲细节...</p>
          ) : (
            list.map((chapter) => {
              const isDone = completedChapters.includes(chapter.id);
              return (
                <div
                  key={chapter.id}
                  id={`chapter-${chapter.id}`}
                  className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-xs ${
                    isDone
                      ? "border-emerald-100 bg-emerald-50/10"
                      : "border-gray-200/80 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3" id={`chapter-headline-${chapter.id}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1" id={`chapter-tag-row-${chapter.id}`}>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            chapter.importance === "high"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {chapter.importance === "high" ? "最高频核心点 × 必考" : "高频考点"}
                        </span>
                        <span className="text-xs text-gray-400">ID: {chapter.id}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-base">{chapter.title}</h4>
                    </div>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isDone
                          ? "bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      id={`btn-toggle-chapter-${chapter.id}`}
                    >
                      <CheckCircle className={`w-4 h-4 ${isDone ? "fill-emerald-500 text-emerald-100" : ""}`} />
                      {isDone ? "已攻克" : "标记掌握"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-lg border-l-2 border-emerald-400 mb-3 leading-relaxed">
                    🌟 总结要旨：{chapter.summary}
                  </p>

                  <div id={`chapter-spots-${chapter.id}`}>
                    <span className="text-xs font-semibold text-gray-700 block mb-1.5">核心高亮考查细目：</span>
                    <div className="flex flex-wrap gap-2" id={`hotspots-list-${chapter.id}`}>
                      {chapter.hotspots.map((spot, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-[11px] px-2.5 py-1 rounded-md border border-gray-200/60 font-medium transition duration-200"
                        >
                          📍 {spot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
