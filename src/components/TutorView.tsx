import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, SubjectId } from "../types";
import { SUBJECTS } from "../data/syllabus";
import { Send, Sparkles, MessageSquare, HelpCircle, ArrowRight, RefreshCcw, Smile } from "lucide-react";

export default function TutorView() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(SubjectId.INTERNAL);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLlmLoading, setIsLlmLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message when component loads or when selectedSubject changes
  useEffect(() => {
    const welcomeMessages: Record<SubjectId, string> = {
      [SubjectId.INTERNAL]: "您好！我是您的 308 内科护理学特训教练。内科护理在考研中占分极重（大纲占约40%），尤以呼吸、循环、消化系统及经典发病机制为核心要领。任何内科机制判定、多系统功能、药物警戒或重症抢救流程，都可以随时问我！让我们开始今天的攻坚吧！",
      [SubjectId.SURGICAL]: "您好！我是您的 308 外科护理学特训教练。外科更偏向围手术期抢救、水溶液离子平衡、急腹症分级及各器官肿瘤根治术后并发症监护。遇到复杂的休克指数计算、中心静脉压对抗，抑或腹膜刺激征辨别，随时向我提问！",
      [SubjectId.BASIC]: "您好！我是您的 308 基础护理学特训教练。由于基本操作及用药标准往往在选择题中占比极高，这里没有捷径。青霉素皮试过敏性休克急救、无菌器械失效期限及临床导尿、灌肠剂量等琐碎点，我都为你想好了背诵攻略。来，你想复习哪个技能？",
      [SubjectId.INTRO]: "您好！我是您的 308 护理学导论特训教练。护理学导论偏理论重逻辑。不论是奥瑞姆（Orem）三大护理系统的临床情境适用、罗伊（Roy）适应模式四大效应推演、PES公式写法，还是执业法律判定，有任何不理解的逻辑分支，告诉我即刻为您剖析！"
    };

    setMessages([
      {
        id: "welcome",
        role: "model",
        content: welcomeMessages[selectedSubject],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [selectedSubject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLlmLoading]);

  // Click suggestions list to talk
  const suggestions: Record<SubjectId, string[]> = {
    [SubjectId.INTERNAL]: [
      "帮我解释：洋地黄中毒的临床表现与救治核心要害 🫀",
      "什么是：呼吸衰竭Ⅱ型的诊断指标与持续低流量吸氧机制？",
      "请帮我梳理：肝硬化患者门静脉高压三大侧支循环与上消化道出血护理 🩸"
    ],
    [SubjectId.SURGICAL]: [
      "请给出：高钾血症的心电图经典表现与‘见尿补钾’的外科原则 ⚡",
      "什么是：中心静脉压（CVP）与血压（BP）结合判断补液调整对照表 📊",
      "如何区分：外科急腹症（先痛后吐）与内科急腹症的临床特征 🔍"
    ],
    [SubjectId.BASIC]: [
      "请详细解释：青霉素皮试液规格、皮内注射细节及过敏性休克抢救首选药用量 💉",
      "急性肺水肿（循环负荷过重反应）的泡沫痰为什么用乙醇湿化？浓度多少？",
      "留置单次导尿放尿量为什么严格限定不得超过 1000 ml？"
    ],
    [SubjectId.INTRO]: [
      "请以糖尿病患者为例，详细讲解奥瑞姆自理理论三大补偿系统该如何适用 📘",
      "讲解：罗伊（Roy）适应模式四大效应器指的是什么？怎么背得牢？",
      "护理诊断中经典的PES公式各部分字母代表什么？请演示一个正确诊断的书写 ✍️"
    ]
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLlmLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Update screen locally
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLlmLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          selectedSubject: SUBJECTS[selectedSubject].name,
        }),
      });

      if (!response.ok) {
        throw new Error("教练信号微弱，请尝试用简单词汇复提问");
      }

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          content: `【信号调整提示】:${err.message || "由于通信波动，教练未能当即回复。您可以重新点按上方的典型备考建议，或稍微简化输入进行提问。"}\n提示：请检查 Secrets 面板是否填写了有效的 GEMINI_API_KEY。`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLlmLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col md:grid md:grid-cols-4 h-[600px] overflow-hidden" id="tutor-chat-container">
      {/* Sidebar: Subject Selection & Shortcuts */}
      <div className="md:col-span-1 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex flex-col justify-between" id="chat-sidebar-left">
        <div className="space-y-4" id="chat-sidebar-tabs">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">切换辅导专区 🏢</h4>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" id="sidebar-tab-buttons bg-slate-900">
            {(Object.keys(SUBJECTS) as SubjectId[]).map((subId) => {
              const info = SUBJECTS[subId];
              const isSelected = selectedSubject === subId;
              return (
                <button
                  key={subId}
                  id={`btn-tutor-sub-${subId}`}
                  onClick={() => setSelectedSubject(subId)}
                  className={`w-full text-left p-3 rounded-xl border transition shrink-0 md:shrink ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-bold text-xs" id={`tutor-sub-title-${subId}`}>{info.name}</div>
                  <div className={`text-[9px] mt-0.5 ${isSelected ? "text-slate-300" : "text-gray-400"}`}>
                    大纲占比 {info.ratio}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block p-3 bg-emerald-50 rounded-lg text-[11px] leading-relaxed text-emerald-800 border border-emerald-100" id="chat-coach-tips">
          <Smile className="w-4 h-4 text-emerald-600 mb-1" />
          <strong>学习提示：</strong>
          护理学主观解答重在结合病理和具体患者表征，建议利用 PES 写法进行思路梳理，并在考场作答中分条分点列示。祝您顺利上岸！
        </div>
      </div>

      {/* Main chat window */}
      <div className="md:col-span-3 flex flex-col h-full bg-white relative" id="chat-room-right">
        {/* Active Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white" id="chat-header-active">
          <div className="flex items-center gap-2" id="tutor-active-status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-gray-800 text-sm">
              护理学 308 智囊导师（面向【{SUBJECTS[selectedSubject].name}】）
            </span>
          </div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-50 px-2 py-0.5 rounded-sm">
            搭载 Gemini 3.5
          </span>
        </div>

        {/* Suggestion shortcut bubbles inside scroll room if empty */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" id="chat-scroller-room">
          <div className="space-y-4" id="message-bubbles-render">
            {messages.map((m) => {
              const isAi = m.role === "model";
              return (
                <div
                  key={m.id}
                  id={`msg-${m.id}`}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                    isAi
                      ? "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none font-medium text-xs md:text-sm whitespace-pre-wrap"
                      : "bg-emerald-600 text-white rounded-tr-none font-medium"
                  }`}
                  >
                    {isAi && (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1.5 text-[10px] uppercase border-b border-emerald-100 pb-1" id="model-sender-tag">
                        <span>👩‍🏫 AI 特训导师</span>
                      </div>
                    )}
                    <div id={`msg-content-${m.id}`} className="whitespace-pre-line leading-relaxed">{m.content}</div>
                    <span className="text-[9px] opacity-40 mt-1 block text-right">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isLlmLoading && (
              <div className="flex justify-start" id="msg-bubble-loading">
                <div className="bg-slate-50 text-slate-400 p-4 rounded-xl rounded-tl-none flex items-center gap-2 border border-slate-100 text-xs">
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>导师正在结合最新考纲深入推演中...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Shortcuts Bubble Area (Render suggestions below the screen as helpful anchors!) */}
          {messages.length === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100" id="prompt-shortcuts-panel">
              <h5 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>点选快速问答（点击直接发起）：</span>
              </h5>
              <div className="flex flex-col gap-2" id="shortcuts-bubble list">
                {suggestions[selectedSubject].map((sug, idx) => (
                  <button
                    key={idx}
                    id={`shortcut-${selectedSubject}-${idx}`}
                    onClick={() => handleSendMessage(sug)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-900 transition flex items-center justify-between group font-medium"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transform group-hover:translate-x-1 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="p-4 bg-white border-t border-gray-100 flex gap-2"
          id="chat-input-row"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLlmLoading}
            placeholder="在此输入你想了解的问题 (例如：左心衰起抢救原则、压疮一期和二期的区别)..."
            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-800 transition"
            id="chat-text-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLlmLoading}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
            id="btn-chat-send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
