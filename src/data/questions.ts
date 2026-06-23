import { PracticeQuestion, SubjectId } from "../types";

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "q-int-1",
    subjectId: SubjectId.INTERNAL,
    type: "A2",
    question: "患者，男性，68岁。慢性阻塞性肺疾病（COPD）病史12年。近日因受凉后气急加重、痰多且黄稠。查体：体温 38.2℃，神志恍惚，口唇发绀。血气分析结果示：PaO2 52 mmHg，PaCO2 68 mmHg。此时该患者最适宜的给氧方式是：",
    options: [
      "A. 高浓度、高流量间歇给氧",
      "B. 低浓度、低流量持续给氧（1~2 L/min）",
      "C. 高压氧舱给氧",
      "面罩吸氧，浓度不低于50%",
      "E. 纯氧中高滴速酒精湿化吸氧"
    ],
    correctAnswer: 1, // B
    explanation: "患者血气分析结果：PaO2 < 60 mmHg (52 mmHg) 且 PaCO2 > 50 mmHg (68 mmHg) ，确诊为Ⅱ型呼吸衰竭。由于Ⅱ型呼衰患者呼吸中枢对高浓度二氧化碳的敏感性下降，主要依靠低氧血症刺激外周化学感受器来维持呼吸。如果吸入高浓度氧，会迅速解除低氧血症的刺激，从而抑制呼吸中枢，导致呼吸变慢、变浅，甚至发生二氧化碳潴留加重、产生肺脑。因此必须持续低浓度、低流量给氧（流量1~2L/min，浓度25%~29%）。",
    topic: "Ⅱ型呼吸衰竭与吸氧原则"
  },
  {
    id: "q-int-2",
    subjectId: SubjectId.INTERNAL,
    type: "A2",
    question: "患者，女性，72岁。因慢性左心衰竭口服地高辛 0.25 mg/d 已有一周。今日自述头晕、心悸，看周围物体有绿发黄感觉（黄视或绿视），伴恶心。心电图提示：室性期前收缩。护士应立即采取的优先措施是：",
    options: [
      "A. 嘱咐患者多饮水，加速排泄",
      "B. 加快地高辛的滴速，使药物浓度匀速分布",
      "C. 立即停用洋地黄类药物（地高辛），并通知医生",
      "D. 给予静脉注射钙剂（葡萄糖酸钙）对抗",
      "E. 鼓励患者下地多活动"
    ],
    correctAnswer: 2, // C
    explanation: "该患者服用洋地黄制剂（地高辛）一周后，出现视力异常（黄视、绿视）、消化道反应（恶心）以及心律失常（室性期前收缩），为典型的洋地黄中毒表现。洋地黄中毒的首要和核心护理措施是立即停用洋地黄类药物及排钾利尿剂，并立刻报告医生进行抢救治疗。禁用钙剂，因为钙离子能增加地高辛的毒性效应。",
    topic: "洋地黄中毒的判定与护理"
  },
  {
    id: "q-surg-1",
    subjectId: SubjectId.SURGICAL,
    type: "A1",
    question: "在休克的微循环变化中，有关微循环扩张期的病理变化描述，下列哪项是正确的？",
    options: [
      "A. 微动脉、微静脉剧烈缩窄，组织不灌不流",
      "B. 毛细血管前括约肌舒张，而微静脉端仍处于收缩状态，导致血液滞留、“灌大于流”",
      "C. 组织细胞发生碱中毒",
      "D. 血液在毛细血管及微静脉中发生广泛的弥散性血管内凝血（DIC）",
      "E. 血管壁通透性降低，回心血量剧烈增加"
    ],
    correctAnswer: 1, // B
    explanation: "休克分为三期：微循环收缩期（缺血缺氧期，不灌不流，只流不灌）、微循环扩张期（淤血缺氧期，主要是毛细血管前括约肌对酸性物质敏感而舒张，而微静脉仍舒张不足、处于收缩，血液滞留，表现为灌大于流，红细胞积聚）以及微循环衰竭期（DIC期，不灌不流，发生广泛的弥散性血管内凝血）。",
    topic: "外科休克微循环病理机制"
  },
  {
    id: "q-surg-2",
    subjectId: SubjectId.SURGICAL,
    type: "A2",
    question: "患者，男性，42岁。因急腹症入院，表现为突发上腹部剧烈绞痛，伴恶心。在医生确诊之前，其病情可能处于危险期。此时对该急腹症患者，下列哪项护理操作是严格禁忌的？",
    options: [
      "A. 进行生命体征监测",
      "B. 遵医嘱给予哌替啶（度冷丁）进行镇痛治疗",
      "C. 保持胃肠减压通常",
      "D. 快速静脉开放补液",
      "E. 嘱患者绝对禁食"
    ],
    correctAnswer: 1, // B
    explanation: "外科急腹症在诊断尚未明确前，严禁“四禁”：禁食、禁灌肠或用泻药、禁用止痛药、禁用热水袋敷腹部。禁用吗啡、哌替啶（度冷丁）等麻醉性止痛剂是为了避免掩盖病情发展的真实特征（如腹痛性质变化及腹膜炎进展），从而造成误诊或延误最佳的手术时机。",
    topic: "外科急腹症确诊前的护理原则"
  },
  {
    id: "q-base-1",
    subjectId: SubjectId.BASIC,
    type: "A2",
    question: "患者，女性，34岁。因急性扁桃体炎遵医嘱行青霉素过敏试验（皮内注射）。皮试5分钟后，患者突然出现面色苍白、冷汗淋漓、发绀、血压降至 75/40 mmHg。此时首要抢救的核心用药及途径是：",
    options: [
      "A. 1% 盐酸肾上腺素 1 ml，皮下注射",
      "B. 0.1% 盐酸肾上腺素 0.5~1 ml，皮下注射（成人首选）",
      "C. 地塞米松 5 mg，静脉注射",
      "D. 10% 葡萄糖酸钙 10 ml，稀释后静注",
      "E. 多巴胺 20 mg，肌肉注射"
    ],
    correctAnswer: 1, // B
    explanation: "该患者属于极其典型的青霉素引起的I型过敏性休克（循环衰竭、血压下降、面色苍白等）。抢救青霉素过敏性休克的首选药物是 0.1% 的盐酸肾上腺素，成人剂量为 0.5~1.0 ml，首选给药途径为皮下注射或肌肉注射，能强效收缩外周血管，升压、解除支气管痉挛并改善心输出量。",
    topic: "青霉素过敏性休克抢救"
  },
  {
    id: "q-base-2",
    subjectId: SubjectId.BASIC,
    type: "A2",
    question: "护士在为急性肺水肿（循环负荷过重反应）患者进行给氧治疗时，为中和肺泡内粉红色泡沫状痰的表面张力，使气泡破裂以改善气体交换，湿化瓶内应注入的湿化液为：",
    options: [
      "A. 灭菌生理盐水",
      "B. 蒸馏水",
      "C. 20%~30%的乙醇（酒精）溶液",
      "D. 50%~70%的乙醇溶液",
      "E. 2%~4%的碳酸氢钠溶液"
    ],
    correctAnswer: 2, // C
    explanation: "急性肺水肿发生时，肺泡内会快速渗出大量黏性带泡沫的粉红色痰液，阻碍气体扩散。使用 20%~30% 乙醇溶液湿化给氧，可以通过乙醇降低肺泡内泡沫的表面张力，使气泡迅速破裂、崩解，减少气体阻力，增大散热和气体接触面积，有效改善严重缺氧状态。",
    topic: "急性肺水肿的给氧护理"
  },
  {
    id: "q-intro-1",
    subjectId: SubjectId.INTRO,
    type: "A1",
    question: "奥瑞姆（Orem）自理学说中，当患者身体处于完全不能自己活动、没有任何自理能力时（例如：全身麻醉未醒、深昏迷或极度衰弱状态），护士应该为患者建立并实施哪类护理系统？",
    options: [
      "A. 部分补偿系统 (Partially Compensatory System)",
      "B. 支持-教育系统 (Supportive-Educative System)",
      "C. 全补偿系统 (Wholly Compensatory System)",
      "D. 行为辅导系统 (Behavioral Coaching System)",
      "E. 临时观察系统 (Temporary Observation System)"
    ],
    correctAnswer: 2, // C
    explanation: "奥瑞姆提出了三大护理系统：①全补偿系统（Wholly compensatory system）：适用于患者没有任何自理能力无法满足其治疗性自理需求，如深昏迷、高位截瘫、全麻术后；②部分补偿系统（Partially compensatory system）：适用于患者有部分自理能力，如骨折术后、脑卒中偏瘫恢复期；③支持-教育系统（Supportive-educative system）：患者能自理但需要护士进行专业性指导和教育，如糖尿病控制、首次产检宣教等。",
    topic: "Orem自理学说三大护理系统"
  },
  {
    id: "q-intro-2",
    subjectId: SubjectId.INTRO,
    type: "A1",
    question: "在制定护理诊断（NANDA规范）时，最经典的多要素组合书写公式是“PES”形式。其中，“E”代表的含义是：",
    options: [
      "A. Problem (健康问题)",
      "B. Etiology (相关因素 / 病因)",
      "C. Symptoms (症状或体征)",
      "D. Evaluation (实施后評價)",
      "E. Environment (致病环境影响)"
    ],
    correctAnswer: 1, // B
    explanation: "在PES护理诊断公式中：P (Problem) 代表健康问题（诊断名称）；E (Etiology) 代表相关因素（即病因或促成健康问题的因素）；S (Symptoms or Signs) 代表相关的症状与体征（临床表现）。所以“E”代表的是相关因素或病因。",
    topic: "PES公式护理诊断书写"
  }
];
