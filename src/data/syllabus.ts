import { SubjectId, SubjectInfo } from "../types";

export interface SyllabusNode {
  id: string;
  title: string;
  importance: "high" | "medium" | "low";
  hotspots: string[]; // Highly tested concepts
  summary: string;
}

export const SUBJECTS: Record<SubjectId, SubjectInfo> = {
  [SubjectId.INTERNAL]: {
    id: SubjectId.INTERNAL,
    name: "内科护理学",
    iconName: "HeartPulse",
    color: "from-rose-500 to-red-600",
    description: "占分重、考点密。重点关注呼吸、循环、消化系统及经典发病机制与护理措施。",
    ratio: "约 40% (120分)",
    totalSections: 8,
  },
  [SubjectId.SURGICAL]: {
    id: SubjectId.SURGICAL,
    name: "外科护理学",
    iconName: "Activity",
    color: "from-amber-500 to-orange-600",
    description: "重在围手术期评估与特异性外科疾患护理，考察水电解质失衡及急腹症等。",
    ratio: "约 30% (90分)",
    totalSections: 10,
  },
  [SubjectId.BASIC]: {
    id: SubjectId.BASIC,
    name: "基础护理学",
    iconName: "ShieldCheck",
    color: "from-blue-500 to-indigo-600",
    description: "考察扎实的基本操作要点、核心用氧与输液指标，是得高分的“必拿高地”。",
    ratio: "约 20% (60分)",
    totalSections: 12,
  },
  [SubjectId.INTRO]: {
    id: SubjectId.INTRO,
    name: "护理学导论",
    iconName: "BookOpen",
    color: "from-teal-500 to-emerald-600",
    description: "偏向理论、伦理和程序。重点在于奥瑞姆自理模式、罗伊适应模式、法律及护理程序各环节。",
    ratio: "约 10% (30分)",
    totalSections: 6,
  },
};

export const SYLLABUS_DATA: Record<SubjectId, SyllabusNode[]> = {
  [SubjectId.INTERNAL]: [
    {
      id: "int-1",
      title: "第一章 呼吸系统疾病患者的护理",
      importance: "high",
      hotspots: ["COPD（慢性阻塞性肺疾病）吸氧原则（低流量低浓度）", "重症哮喘的处理及药物吸入方法", "支气管扩张的体位引流规范", "呼吸衰竭Ⅱ型的血气诊断标准（PaO2<60mmHg, PaCO2>50mmHg）"],
      summary: "呼吸衰竭与COPD是绝对的高频考点，务必掌握体位引流的禁忌和排痰规范。"
    },
    {
      id: "int-2",
      title: "第二章 循环系统疾病患者的护理",
      importance: "high",
      hotspots: ["心力衰竭患者的饮食与洋地黄类药物中毒护理", "急性心肌梗死绝对卧床与再灌注治疗观察", "高血压发病分级与联合用药监护", "心律失常分类（阵发性室上速及室颤急救）"],
      summary: "循环重点主要是急性左心衰的抢救配合、心梗病人的溶栓指针及心律失常心电图。"
    },
    {
      id: "int-3",
      title: "第三章 消化系统疾病患者的护理",
      importance: "high",
      hotspots: ["消化性溃疡疼痛特点（餐后痛 vs 饥饿痛）", "肝硬化失代偿期并发症（上消化道出血、肝性脑病诱因）", "急性胰腺炎禁食与胃肠减压指征", "上消化道大出血的出血量估算及抢救护理"],
      summary: "肝性脑病的氨中毒学说与灌肠禁忌（禁用碱性肥皂水，改用弱酸性）是必考的临床细节。"
    },
    {
      id: "int-4",
      title: "第四章 泌尿系统疾病患者的护理",
      importance: "medium",
      hotspots: ["肾小球肾炎与肾病综合征（三高一低）判定", "急性肾衰竭少尿期与多尿期的电解质监测（高钾 vs 低钾）", "慢性肾衰竭饮食护理（优质低蛋白）"],
      summary: "重点关注各种电解质的紊乱监护，尤其是高钾血症的预防和紧急对抗。"
    }
  ],
  [SubjectId.SURGICAL]: [
    {
      id: "surg-1",
      title: "第一章 水、电解质及酸碱平衡失调患者的护理",
      importance: "high",
      hotspots: ["等渗性、低渗性、高渗性脱水的病因与补液选择", "高钾血症与低钾血症的心电图表现及补钾原则（见尿补钾）", "代谢性酸中毒的代偿呼吸（Kussmaul呼吸）与纠正"],
      summary: "补钾口诀：浓度不可过、速度不可快、见尿才补钾。这是外科考试第一硬核重地。"
    },
    {
      id: "surg-2",
      title: "第二章 外科休克患者的护理",
      importance: "high",
      hotspots: ["休克代偿期与抑制期的微循环变化特点", "休克的指数计算（脉率/收缩压）及体位选择（中凹卧位）", "中心静脉压（CVP）与血压结合判断进行补液调整"],
      summary: "中凹卧位要求：头胸抬高10°-20°，下肢抬高20°-30°。需要熟记CVP与BP对照表的应用。"
    },
    {
      id: "surg-3",
      title: "第三章 外科围手术期与麻醉护理",
      importance: "medium",
      hotspots: ["全身麻醉未清醒患者的体位（去枕平卧头偏向一侧）", "术后早期下床活动的活动禁忌与作用", "术后切口并发症（裂开、感染）处理"],
      summary: "全麻病人去枕平卧平偏一侧，是为了防止呕吐物吸入气管导致窒息。"
    },
    {
      id: "surg-4",
      title: "第四章 急腹症患者的护理",
      importance: "high",
      hotspots: ["外科急腹症（阵发性绞痛、先痛后吐）与内科急腹症（先吐后痛、多有发热）鉴别", "腹膜刺激征（压痛、反跳痛、肌紧张）", "急腹症尚未确诊前的“四禁”（禁食、禁灌肠、禁服泻药、禁用止痛药）"],
      summary: "外科急腹症绝对不能随意给予吗啡类强效镇痛，以免掩盖症状，贻误手术时机。"
    }
  ],
  [SubjectId.BASIC]: [
    {
      id: "base-1",
      title: "第一章 医院内感染的预防与控制",
      importance: "high",
      hotspots: ["无菌持物钳的使用要求与储存液更换频率", "无菌包盖包及开包有效期（24小时 vs 4小时）", "洗手法（七步洗手法）及隔离类别（接触隔离、空气隔离、飞沫隔离）"],
      summary: "无菌持物钳只能在无菌区内使用，不可向下倾斜，防止液体流过钳端污染无菌面。"
    },
    {
      id: "base-2",
      title: "第二章 患者安全与舒适、排泄、药疗",
      importance: "high",
      hotspots: ["压疮发生的四期临床表现及其对应的护理干预", "尿潴留与留置导尿的二次放尿量限定（不可超过1000ml，防虚脱及血尿）", "青霉素过敏试验（0.1ml药液、200-500U青霉素）与过敏性休克抢救首选药（0.1%盐酸肾上腺素）"],
      summary: "青霉素过敏实验及抢救流程是基础护理的第一重点。肾上腺素需皮下注射，成人常用量0.5-1.0mg。"
    },
    {
      id: "base-3",
      title: "第三章 静脉输液与输血护理",
      importance: "high",
      hotspots: ["静脉输液速度与滴速计算公式", "急性肺水肿（循环负荷过重）的典型特征（咳粉红色泡沫痰）与吸氧酒精湿化（20%-30%）", "空气栓塞的体位抢救（左侧卧位并头低足高位）", "输血反应（发热、过敏、溶血反应三期的病理和护理）"],
      summary: "出现空气栓塞要立即安置左侧卧位头低足高，使空气聚集到右心房尖，避免阻塞肺动脉。"
    }
  ],
  [SubjectId.INTRO]: [
    {
      id: "intro-1",
      title: "第一章 护理学基本概念及理论",
      importance: "medium",
      hotspots: ["健康与疾病的转化观", "人、环境、健康、护理四个基本概念的演变", "现代护理学发展的三个阶段（以疾病、以患者、以健康为中心）"],
      summary: "护理学四大概念：人、环境、健康、护理，其中“人”是护理的核心目标。"
    },
    {
      id: "intro-2",
      title: "第二章 护理理论及模式",
      importance: "high",
      hotspots: ["奥瑞姆（Orem）的自理学说与三大护理系统（完全补偿、部分补偿、辅助教育）", "罗伊（Roy）的适应模式（四大效应器：生理、自我概念、角色功能、相互依赖）", "纽曼（Neuman）的系统模式（三道防线：弹性防线、正常防线、抵抗线）"],
      summary: "自理学说与适应模式年年必考，必须理清各系统分别适用于什么疾病情境（例如全麻术后适用完全补偿）。"
    },
    {
      id: "intro-3",
      title: "第三章 护理程序与法律伦理",
      importance: "high",
      hotspots: ["护理诊断（NANDA）的写法与PES公式", "护理评估、目标的制定原则", "护患关系的基本类型及其适用阶段", "医疗事故分级与护理侵权法律定界"],
      summary: "PES公式：P（健康问题）、E（相关因素）、S（症状和体征）。"
    }
  ]
};
