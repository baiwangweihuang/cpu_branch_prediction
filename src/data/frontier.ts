export interface FrontierWork {
  id: string
  year: string
  venue: string
  name: string
  cn: string
  idea: string
  why: string
  hardware: string[]
  accent: string
  source: string
}

export const FRONTIER_WORKS: FrontierWork[] = [
  {
    id: 'tage-sc-l',
    year: '2014 / 2016',
    venue: 'CBP-4 / CBP-5 冠军',
    name: 'TAGE-SC-L / MTAGE+SC',
    cn: 'TAGE + 统计校正 + 循环预测',
    idea: '在 TAGE 的几何历史表之上，再加 Statistical Corrector 纠正低置信预测，用 Loop Predictor 吃定常迭代循环； unlimited 赛道则用 MTAGE/Multi-poTAGE 继续推极限。',
    why: 'CBP-4 与 CBP-5 的 32Kbits/256Kbits 冠军，至今仍是“固定存储预算下学术精度天花板”的常见基线。',
    hardware: ['TAGE 多表', 'SC 校正器', 'Loop predictor', 'Useful/置信'],
    accent: '#e879f9',
    source: 'https://team.inria.fr/alf/members/andre-seznec/branch-prediction-research/',
  },
  {
    id: 'imli',
    year: '2015 / 2016',
    venue: 'MICRO 2015 · IEEE Micro Top Picks 2016',
    name: 'IMLI / Multidimensional BP',
    cn: '最内层循环迭代计数历史',
    idea: '把“当前最内层循环跑到第几轮”也当成一维历史，和分支方向历史一起参与预测，专门改善循环边界与规则循环体。',
    why: '给 branch history 增加了新的上下文维度，是从“只看方向序列”走向“看结构化执行上下文”的代表。',
    hardware: ['IMLI counter', '多维历史索引', '循环上下文'],
    accent: '#f59e0b',
    source: 'https://utoronto.scholaris.ca/server/api/core/bitstreams/bec364c3-494f-48f7-bb92-cda68fe275f6/content',
  },
  {
    id: 'branchnet',
    year: '2020',
    venue: 'MICRO 2020',
    name: 'BranchNet',
    cn: '用 CNN 攻难预测分支',
    idea: '把分支预测当成分类问题，用卷积网络从更长的历史/上下文里学习 hard-to-predict branches 的模式。',
    why: '证明深度模型能显著超过感知机，甚至挑战 TAGE 类基线；同时也把延迟、存储和更新带宽问题摆上台面。',
    hardware: ['CNN/DBN', '长历史特征', '离线/在线训练权衡'],
    accent: '#60a5fa',
    source: 'https://link.springer.com/content/pdf/10.1007/s13369-022-07593-9.pdf',
  },
  {
    id: 'realistic-tage-sc',
    year: '2025',
    venue: 'CBP2025 现实化设计',
    name: 'Realistic TAGE-SC',
    cn: '可上硬件的 TAGE-SC',
    idea: '把 CBP2016 那种为比赛堆很多逻辑表的 TAGE-SC-L，压成有限物理表共享、少 SC 表、低额外延迟的工程版本。',
    why: '正面回应“冠军预测器不能直接上芯片”的批评：精度不掉太多，时序和表访问次数先过关。',
    hardware: ['物理表共享', '1–5 个 SC 表', '单端口 bank', '低延迟 mux'],
    accent: '#34d399',
    source: 'https://ericrotenberg.wordpress.ncsu.edu/files/2025/06/cbp2025-final37-Seznec.pdf',
  },
  {
    id: 'bullseye',
    year: '2025',
    venue: 'arXiv / CBP 风格研究',
    name: 'Bullseye',
    cn: '盯住 H2P 长尾分支',
    idea: '先用 H2P Identification Table 找出贡献大多数误预测的少数 PC，再把这些 PC 交给按局部/全局历史索引的小型 perceptron 专营。',
    why: '代表一个新共识：继续平均加大 TAGE 表收益有限，精度长尾藏在少量 hard-to-predict branches 里。',
    hardware: ['HIT', 'H2P cache', '双 perceptron', 'TAGE 更新抑制'],
    accent: '#fb7185',
    source: 'https://arxiv.org/html/2506.06773v1',
  },
  {
    id: 'lvcp',
    year: '2025',
    venue: 'CBP2025',
    name: 'LVCP / LVC-TAGE-SC-L',
    cn: '装载值相关预测',
    idea: '不只利用分支历史，还跟踪 load address/value 等执行上下文；对“循环退出条件依赖装载值”的 H2P 分支尤其有效。',
    why: '把预测信息源从 control history 扩展到 data/value context，是近年前沿里最明确的方向之一。',
    hardware: ['Load tracking', 'Value context', 'TAGE-SC-L 外挂'],
    accent: '#22d3ee',
    source: 'https://ericrotenberg.wordpress.ncsu.edu/files/2025/06/cbp2025-final15-Man.pdf',
  },
]
