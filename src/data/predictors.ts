export type Bit = 0 | 1

export type PredictorId =
  | 'one-bit'
  | 'two-bit'
  | 'bimodal'
  | 'local'
  | 'global'
  | 'gshare'
  | 'tournament'
  | 'tage'
  | 'perceptron'
  | 'indirect'

export type DiagramKind =
  | 'flipflop'
  | 'counter'
  | 'table'
  | 'local-history'
  | 'global-history'
  | 'xor'
  | 'tournament'
  | 'tage'
  | 'perceptron'
  | 'target-stack'

export interface PredictorMeta {
  id: PredictorId
  rank: number
  name: string
  cn: string
  era: string
  family: '经典奠基' | '相关历史' | '现代高性能' | '目标预测'
  tagline: string
  idea: string
  hardware: string[]
  goodAt: string
  blindSpot: string
  accent: string
  diagram: DiagramKind
}

export const PREDICTORS: PredictorMeta[] = [
  {
    id: 'one-bit',
    rank: 1,
    name: '1-bit Predictor',
    cn: '1 位预测器',
    era: '1970s 概念',
    family: '经典奠基',
    tagline: '记住上一次结果，下次照抄。',
    idea: '每个分支只存 1 位：上次 Taken 就猜 Taken，上次 Not-taken 就猜 Not-taken。硬件极少，但循环边界会连续错两次。',
    hardware: ['PC 索引', '1 位表项', '直接写回'],
    goodAt: '展示“预测 = 状态记忆”的最小闭环。',
    blindSpot: '短循环、交替序列很容易被打爆。',
    accent: '#38bdf8',
    diagram: 'flipflop',
  },
  {
    id: 'two-bit',
    rank: 2,
    name: '2-bit Saturating Counter',
    cn: '2 位饱和计数器',
    era: '1980s 成熟',
    family: '经典奠基',
    tagline: '用四个状态吸收单次抖动。',
    idea: '00/01 偏 Not-taken，10/11 偏 Taken；预测错才向另一头挪一格。需要连续两次反向才彻底翻转，抗噪声更强。',
    hardware: ['2 位计数器表', '饱和加减', '强/弱状态机'],
    goodAt: '稳定循环几乎只在进/出循环时错。',
    blindSpot: '仍不理解“历史模式”，只看局部门牌号。',
    accent: '#22c55e',
    diagram: 'counter',
  },
  {
    id: 'bimodal',
    rank: 3,
    name: 'Bimodal / Smith',
    cn: '双模态预测器',
    era: '1981 Smith',
    family: '经典奠基',
    tagline: '把 2 位计数器做成一张大表。',
    idea: '用 PC 低位索引一张计数器表，项数多了以后冲突下降。它是后续所有“PC 索引 + 计数器”结构的母体。',
    hardware: ['PC 低位索引', 'PHT 计数器表', '无历史寄存器'],
    goodAt: '简单、快、面积可扩展。',
    blindSpot: '不同分支共享相似 PC 低位时会互相踩踏。',
    accent: '#a78bfa',
    diagram: 'table',
  },
  {
    id: 'local',
    rank: 4,
    name: 'Local History / PAp',
    cn: '局部历史预测器',
    era: '1990s',
    family: '相关历史',
    tagline: '每个分支记住自己的最近走势。',
    idea: '每条分支维护私有历史寄存器，再用“PC + 私有历史”去查模式表。能认出某个分支自身的周期节奏。',
    hardware: ['BHR 局部历史', 'PHT 模式表', '两级索引'],
    goodAt: '单分支周期性、固定循环节奏。',
    blindSpot: '分支之间的相关性看不见。',
    accent: '#f59e0b',
    diagram: 'local-history',
  },
  {
    id: 'global',
    rank: 5,
    name: 'Global History / GAs',
    cn: '全局历史预测器',
    era: '1990s',
    family: '相关历史',
    tagline: '用整条程序最近的分支轨迹当上下文。',
    idea: '所有分支共享一条全局历史移位寄存器；结果不断左移/右移注入，形成“程序最近走法”的指纹。',
    hardware: ['GHR 移位寄存器', '全局 PHT', '历史注入'],
    goodAt: '捕捉跨分支相关，如 if/else 链。',
    blindSpot: '无关分支也会污染同一段历史。',
    accent: '#fb7185',
    diagram: 'global-history',
  },
  {
    id: 'gshare',
    rank: 6,
    name: 'gshare',
    cn: 'gshare 异或预测器',
    era: '1993 McFarling',
    family: '相关历史',
    tagline: '把 PC 和全局历史 XOR 在一起。',
    idea: '索引 = PC 低位 XOR GHR。既保留“我是谁”，又混入“我刚从哪来”，实现成本低、效果强，是很多设计的基线。',
    hardware: ['GHR', 'XOR 混合器', '计数器表'],
    goodAt: '用极小改动显著减少冲突。',
    blindSpot: '异或折叠会制造新的别名。',
    accent: '#34d399',
    diagram: 'xor',
  },
  {
    id: 'tournament',
    rank: 7,
    name: 'Tournament / Hybrid',
    cn: '锦标赛混合预测器',
    era: '1990s 中期',
    family: '现代高性能',
    tagline: '两个专家比赛，再选一个裁判。',
    idea: '局部预测器与全局预测器同时给出答案，选择器根据“谁最近更靠谱”动态站队。Alpha 21264 让这类结构名声大噪。',
    hardware: ['Local 预测器', 'Global 预测器', 'Chooser 计数器'],
    goodAt: '不同程序片段自动切换擅长的模型。',
    blindSpot: '选择器本身也会被噪声训练。',
    accent: '#f97316',
    diagram: 'tournament',
  },
  {
    id: 'tage',
    rank: 8,
    name: 'TAGE',
    cn: 'TAGE 标记几何历史',
    era: '2006 起，现代主力思想',
    family: '现代高性能',
    tagline: '多张表对应不同历史长度，最长命中优先。',
    idea: '用几何级数增长的历史长度查多张带 tag 的表；命中最长历史者作为 provider，短表兜底。当代高性能方向预测普遍吸收了这一思想。',
    hardware: ['多历史长度', 'Tag 匹配', 'Provider/Alt', 'Useful 位'],
    goodAt: '超长相关、稀疏但重要的远程历史。',
    blindSpot: '面积、时序与更新策略都非常讲究。',
    accent: '#e879f9',
    diagram: 'tage',
  },
  {
    id: 'perceptron',
    rank: 9,
    name: 'Perceptron / Neural',
    cn: '感知机神经预测器',
    era: '2001 Jiménez-Lin',
    family: '现代高性能',
    tagline: '把历史位当特征，做加权求和。',
    idea: '每个历史位变成 ±1 特征，与可学习权重相乘累加；符号即方向，绝对值像置信度。能用线性模型容纳很长历史。',
    hardware: ['权重表', '±1 特征', '加法树', '阈值训练'],
    goodAt: '长历史下的线性可分模式。',
    blindSpot: '加法延迟、存储与训练带宽是硬约束。',
    accent: '#60a5fa',
    diagram: 'perceptron',
  },
  {
    id: 'indirect',
    rank: 10,
    name: 'BTB + RAS + ITTAGE',
    cn: '间接跳转与返回预测',
    era: '现代 CPU 标配',
    family: '目标预测',
    tagline: '方向猜对了还不够，目标地址也要猜。',
    idea: 'BTB 给出“是不是分支/目标是什么”，RAS 匹配 call/return，间接跳转用 ITTAGE 类目标预测。缺了它们，前端会在 jmp/call/ret 上频繁失速。',
    hardware: ['BTB 目标缓存', 'RAS 返回栈', '间接目标表', '类型识别'],
    goodAt: '虚函数、函数指针、switch 跳转、深层调用返回。',
    blindSpot: '目标别名与恶意训练会带来性能和安全问题。',
    accent: '#f43f5e',
    diagram: 'target-stack',
  },
]

export type PatternId = 'loop' | 'alternating' | 'nested' | 'correlated' | 'noisy'

export interface PatternMeta {
  id: PatternId
  name: string
  desc: string
  outcome: (i: number) => Bit
}

const pseudoRandom = (i: number): Bit => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x) > 0.56 ? 1 : 0
}

export const PATTERNS: PatternMeta[] = [
  {
    id: 'loop',
    name: '稳定循环',
    desc: '长时间 Taken，偶尔退出：最像 for/while 热点。',
    outcome: (i) => (i % 16 === 15 ? 0 : 1),
  },
  {
    id: 'alternating',
    name: '交替序列',
    desc: 'T/NT 来回切换，考验历史相关性。',
    outcome: (i) => (i % 2 === 0 ? 1 : 0),
  },
  {
    id: 'nested',
    name: '嵌套循环',
    desc: '内层 4 拍 + 外层慢变，局部与全局历史都有戏。',
    outcome: (i) => {
      const inner = i % 4 === 3 ? 0 : 1
      const outerKick = i % 20 >= 16 ? 0 : 1
      return inner === 1 && outerKick === 1 ? 1 : 0
    },
  },
  {
    id: 'correlated',
    name: '跨分支相关',
    desc: '前一个结果会影响后一个，利于全局历史/TAGE。',
    outcome: (i) => {
      const a = i % 5 === 0 ? 0 : 1
      const b = i % 7 < 3 ? 0 : 1
      return a === 1 && b === 1 ? 1 : 0
    },
  },
  {
    id: 'noisy',
    name: '噪声混合',
    desc: '确定模式里掺随机反转，观察谁更稳。',
    outcome: (i) => {
      const base = i % 8 < 6 ? 1 : 0
      const noise = pseudoRandom(i)
      return i % 11 === 0 ? noise : base
    },
  },
]

export const predictorById = (id: PredictorId): PredictorMeta => {
  const found = PREDICTORS.find((p) => p.id === id)
  if (!found) throw new Error(`unknown predictor ${id}`)
  return found
}
