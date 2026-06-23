import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (Only server-side is allowed)
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not set or using placeholder, AI features will use graceful fallbacks.");
  }
} catch (err) {
  console.error("Failed to initialize GoogleGenAI:", err);
}

// 1. AI Tutor Chat Endpoint
app.post("/api/tutor", async (req: Request, res: Response): Promise<void> => {
  const { messages, selectedSubject } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid messages format" });
    return;
  }

  if (!ai) {
    // Graceful offline fallback tutor response
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    res.json({
      content: `【离线仿真学术助手为您解答】\n由于系统正在进行微调或网络不可达，当前处于简易应答状态。关于您提问的：“${lastUserMessage}”，此内容是护理硕士考研 308 期课程的核心重点。请您重点复习病因而采取的各项特异性护理措施（如体位、引流、病情监测等）。\n\n提示：配置有效的 Gemini API Key 即可重启高级 AI 智能导师的实时探讨和答疑。`
    });
    return;
  }

  try {
    const systemPrompt = `你是一位顶尖的护理学考研（国家 308 护理综合）专属特训教练。
你的学生正在备考，涉及科目包括：《内科护理学》、《外科护理学》、《基础护理学》、《护理学导论》。
当前正在探讨的学科是：${selectedSubject || "全部 308 科目"}。

你需要：
1. 始终使用客观、资深、极具亲和力、温和有鼓励性的中文回答。
2. 结合历年真题的出题特征，用结构化的排版（使用 Markdown 标题、加粗重点、列表等）进行深度剖析。
3. 如果解答疾病护理，一定要涵盖：病理特征/临床表现（特别是“金标准”及典型体征）、首要强救药物/护理重点、易错干扰项。
4. 适时附赠备考背诵口诀（韵律助记法）来帮其记忆。`;

    // Map client messages to Gemini content format ({ role, parts: [{ text }] })
    // In @google/genai SDK, chat history or model generate content takes standard structure.
    // We will formulate the contents as an array of objects
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in Tutor:", error);
    res.status(500).json({ error: "AI 导师响应失败，请稍后重试", details: error.message });
  }
});

// 2. AI Question Generator Endpoint
app.post("/api/generate-question", async (req: Request, res: Response): Promise<void> => {
  const { subjectId, subjectName, topic } = req.body;

  if (!subjectId || !subjectName) {
    res.status(400).json({ error: "Missing subject information" });
    return;
  }

  if (!ai) {
    // Generate an instant high-quality static mock question as fallback
    const mockFallbacks: Record<string, any> = {
      internal: {
        question: "【备考模拟题】患者，男性，65岁。因慢性支气管炎并发肺气肿入院。近日气促、发绀明显，伴头痛、昼睡夜醒。血气分析示：PaO2 50 mmHg，PaCO2 70 mmHg。此时不宜随意采取下列哪种湿化吸氧指导：",
        options: [
          "A. 1~2 L/min 低流量持续给氧",
          "B. 3~5 L/min 中流量吸氧，加速恢复氧分压",
          "C. 遵医嘱给予解痉平喘药",
          "D. 患者取半坐卧位休息",
          "E. 保持呼吸道引流及通畅"
        ],
        correctAnswer: 1,
        explanation: "由于患者出现明显的二氧化碳潴留（PaCO2达到70 mmHg）合并缺氧，属于Ⅱ型呼衰与肺源性脑病前兆。若给予3~5L/min中浓度给氧，会削弱低氧血症对颈动脉体调节器的兴奋，使呼吸进一步受到抑制，引发严重的肺脑，故禁用中高浓度给氧。此题为离线应急真题储备，连接 API Key 即可启动精密的 AI 拟真题库生成！"
      },
      surgical: {
        question: "【备考模拟题】患者，女性，45岁。因急性阑尾炎急诊入院，护士体检触及右下腹麦氏点明显压痛、反跳痛和肌紧张。这三种症状在临床病理学中共同被称为：",
        options: [
          "A. 墨菲征 (Murphy征)",
          "B. 腹膜刺激征",
          "C. 查德威克征",
          "D. 雷诺五联征",
          "E. 阑尾移位征"
        ],
        correctAnswer: 1,
        explanation: "压痛、反跳痛及肌紧张是急腹症腹膜壁层受到炎症或消化液刺激后产生的特征性躯体反应，合称为腹膜刺激征（Peritoneal irritation sign），是诊断腹膜炎或空腔脏器穿孔的外科首要特征，属于高频考点。此题为离线应急真题储备，连接 API Key 即可启动精密的 AI 拟真题库生成！"
      }
    };

    const fallback = mockFallbacks[subjectId] || {
      question: `【简易备考题】关于 《${subjectName}》 中 ${topic || "常用指标"} 这一主题，下列哪项属于高频考核要素：`,
      options: [
        "A. 详细的诊断治疗界限值与抢救原则",
        "B. 随便应付就可以",
        "C. 纯粹靠临考前一晚进行背诵",
        "D. 考研几乎不考这一块的内容",
        "E. 导论比重占到50%以上"
      ],
      correctAnswer: 0,
      explanation: "308 护理学硕士全面考核对护理细节的扎实把握。考前应建立紧凑的记忆时间轴与系统化的错题梳理。配置 API Key 即可生成与本学科高度贴合的特定临床案例题。"
    };

    res.json(fallback);
    return;
  }

  try {
    const prompt = `你是一位国家 308 护理硕士考研专业造题专家。
请根据以下条件，出一道最符合护理考研真题水平均一的、高质量的五选一单项选择题（A1/A2卷形）。

科目：${subjectName} 
指定微观考点（如果提供）：${topic || "本学科最核心的、临床上具有代表性的疾病/原则高频考点"}

你的输出必须完全为 JSON 结构，属性如下：
1. "question": 必须是极其贴合考研大纲的题目。强烈推荐病例型单选题（A2型题），描述患者性别、真实年龄、主诉、临床生化标志物理化指标，并要求做出判断或是最恰当的护理干预。
2. "options": 包含5个选项的数组，必须分别以 "A. ", "B. ", "C. ", "D. ", "E. " 开头。干扰项要极具迷惑性，考点指向明确。
3. "correctAnswer": 正确答案的索引号 (0代表选项A, 1代表选项B, 2代表选项C, 3代表选项D, 4代表选项E)。
4. "explanation": 极尽详实的专业护理学剖析。说明为什么这个备选项入选、为什么其余选项属于典型错项、复习关联的临床诊断金标准、口诀或误区提醒。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The multi-choice question containing patients profile, symptoms and nursing context."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 5 strings, starting with A., B., C., D., E."
            },
            correctAnswer: {
              type: Type.INTEGER,
              description: "Index of the correct option (0 to 4)"
            },
            explanation: {
              type: Type.STRING,
              description: "Comprehensive step-by-step nursing clinical explanation."
            }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        },
        temperature: 0.8
      }
    });

    const questionData = JSON.parse(response.text || "{}");
    res.json(questionData);
  } catch (err: any) {
    console.error("Gemini API Error in Question Generation:", err);
    res.status(500).json({ error: "AI 出题失败，请稍后重试", details: err.message });
  }
});


// 3. Vite development vs serving static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server connected as middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static build from /dist and enabling direct CJS start");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 CarePostgrad server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
