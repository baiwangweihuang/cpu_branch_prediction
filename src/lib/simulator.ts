import type { Bit, PredictorId } from '@/data/predictors'

export interface TageEntry {
  tag: number
  ctr: number
  useful: number
}

export interface SimState {
  id: PredictorId
  step: number
  history: Bit[]
  localHistories: number[]
  counters: number[]
  altCounters: number[]
  chooser: number[]
  weights: number[]
  tage: TageEntry[][]
  btb: Array<{ tag: number; target: string }>
  ras: string[]
  correct: number
  total: number
  lastPrediction: Bit
  lastCorrect: boolean | null
  lastIndex: number
  flush: number
  message: string
}

const TABLE = 64
const clampCounter = (v: number) => Math.max(0, Math.min(3, v))
const bitSign = (b: Bit) => (b === 1 ? 1 : -1)
const bitsToNumber = (bits: Bit[]) => bits.reduce<number>((acc, b) => (acc << 1) | b, 0)
const hash = (pc: number, hist: number, salt: number) => {
  let x = (pc * 131 + hist * 17 + salt * 911) >>> 0
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return x >>> 0
}

const emptyTage = (): TageEntry[][] =>
  [0, 1, 2].map(() =>
    Array.from({ length: 8 }, () => ({ tag: -1, ctr: 1, useful: 0 })),
  )

export function createSimState(id: PredictorId): SimState {
  return {
    id,
    step: 0,
    history: Array.from({ length: 12 }, () => 0 as Bit),
    localHistories: Array.from({ length: 16 }, () => 0),
    counters: Array.from({ length: TABLE }, () => 1),
    altCounters: Array.from({ length: TABLE }, () => 1),
    chooser: Array.from({ length: TABLE }, () => 1),
    weights: Array.from({ length: 13 }, (_, i) => (i === 0 ? 0 : i % 2 === 0 ? 1 : -1)),
    tage: emptyTage(),
    btb: [
      { tag: 3, target: '0x1A20' },
      { tag: 7, target: '0x2C44' },
    ],
    ras: ['0x4010', '0x3FFC'],
    correct: 0,
    total: 0,
    lastPrediction: 1,
    lastCorrect: null,
    lastIndex: 0,
    flush: 0,
    message: '点击播放，让分支结果流入前端。',
  }
}

const bump = (arr: number[], idx: number, taken: Bit) => {
  arr[idx] = clampCounter(arr[idx] + (taken === 1 ? 1 : -1))
}

const predictFromCounter = (arr: number[], idx: number): Bit => (arr[idx] >= 2 ? 1 : 0)

const tagePredict = (state: SimState, pc: number, ghist: number) => {
  const lengths = [3, 6, 11]
  let provider = -1
  let providerTable = -1
  for (let t = 0; t < 3; t += 1) {
    const idx = hash(pc, ghist & ((1 << lengths[t]) - 1), t) % 8
    const tag = hash(pc, ghist, 40 + t) % 16
    if (state.tage[t][idx].tag === tag) {
      provider = idx
      providerTable = t
      break
    }
  }
  const baseIdx = (pc ^ ghist) % TABLE
  const base = predictFromCounter(state.counters, baseIdx)
  if (providerTable === -1) {
    return { prediction: base, providerTable, provider, baseIdx, alt: base }
  }
  const entry = state.tage[providerTable][provider]
  return {
    prediction: (entry.ctr >= 2 ? 1 : 0) as Bit,
    providerTable,
    provider,
    baseIdx,
    alt: base,
  }
}

export function stepPredictor(prev: SimState, outcome: Bit): SimState {
  const state: SimState = {
    ...prev,
    history: [...prev.history],
    localHistories: [...prev.localHistories],
    counters: [...prev.counters],
    altCounters: [...prev.altCounters],
    chooser: [...prev.chooser],
    weights: [...prev.weights],
    tage: prev.tage.map((table) => table.map((e) => ({ ...e }))),
    btb: prev.btb.map((e) => ({ ...e })),
    ras: [...prev.ras],
  }

  const pc = state.step % 16
  const ghist = bitsToNumber(state.history.slice(0, 10))
  let prediction: Bit = 1
  let index = pc
  let message = ''

  if (state.id === 'one-bit') {
    index = pc
    prediction = (state.counters[index] >= 2 ? 1 : 0) as Bit
    state.counters[index] = outcome === 1 ? 3 : 0
    message = `1 位表项直接改成最近一次结果：${outcome === 1 ? 'T' : 'NT'}。`
  } else if (state.id === 'two-bit' || state.id === 'bimodal') {
    index = state.id === 'bimodal' ? (pc * 4 + (state.step % 4)) % TABLE : pc
    prediction = predictFromCounter(state.counters, index)
    bump(state.counters, index, outcome)
    message = `饱和计数器 ${state.counters[index]}/3：单次反向不会立刻翻盘。`
  } else if (state.id === 'local') {
    const lh = state.localHistories[pc] & 0xf
    index = (pc * 16 + lh) % TABLE
    prediction = predictFromCounter(state.counters, index)
    bump(state.counters, index, outcome)
    state.localHistories[pc] = ((lh << 1) | outcome) & 0xf
    message = `该分支私有历史移到 ${state.localHistories[pc].toString(2).padStart(4, '0')}。`
  } else if (state.id === 'global') {
    index = ghist % TABLE
    prediction = predictFromCounter(state.counters, index)
    bump(state.counters, index, outcome)
    message = `全局历史指纹 ${ghist.toString(2).padStart(10, '0')} 决定查表位置。`
  } else if (state.id === 'gshare') {
    index = (pc ^ ghist) % TABLE
    prediction = predictFromCounter(state.counters, index)
    bump(state.counters, index, outcome)
    message = `PC ${pc.toString(2).padStart(4, '0')} XOR GHR 得到索引 ${index}。`
  } else if (state.id === 'tournament') {
    const lh = state.localHistories[pc] & 0xf
    const localIdx = (pc * 16 + lh) % TABLE
    const globalIdx = (pc ^ ghist) % TABLE
    const localPred = predictFromCounter(state.counters, localIdx)
    const globalPred = predictFromCounter(state.altCounters, globalIdx)
    const chooseGlobal = state.chooser[pc] >= 2
    prediction = chooseGlobal ? globalPred : localPred
    const localRight = localPred === outcome
    const globalRight = globalPred === outcome
    bump(state.counters, localIdx, outcome)
    bump(state.altCounters, globalIdx, outcome)
    if (localRight !== globalRight) {
      state.chooser[pc] = clampCounter(state.chooser[pc] + (globalRight ? 1 : -1))
    }
    state.localHistories[pc] = ((lh << 1) | outcome) & 0xf
    index = chooseGlobal ? globalIdx : localIdx
    message = `裁判选择 ${chooseGlobal ? 'Global' : 'Local'}；Local ${localRight ? '√' : '×'} / Global ${globalRight ? '√' : '×'}。`
  } else if (state.id === 'tage') {
    const r = tagePredict(state, pc, ghist)
    prediction = r.prediction
    index = r.providerTable === -1 ? r.baseIdx : r.provider
    const right = prediction === outcome
    if (r.providerTable === -1) {
      bump(state.counters, r.baseIdx, outcome)
    } else {
      const entry = state.tage[r.providerTable][r.provider]
      entry.ctr = clampCounter(entry.ctr + (outcome === 1 ? 1 : -1))
      entry.useful = Math.min(3, entry.useful + (right && r.alt !== prediction ? 1 : 0))
    }
    if (!right) {
      const longer = Math.min(2, r.providerTable + 1)
      const idx = hash(pc, ghist, 90 + longer) % 8
      state.tage[longer][idx] = { tag: hash(pc, ghist, 40 + longer) % 16, ctr: outcome === 1 ? 2 : 1, useful: 0 }
    }
    message = r.providerTable === -1 ? '无 tag 命中，退回短历史基表。' : `命中 T${r.providerTable}，最长历史优先提供预测。`
  } else if (state.id === 'perceptron') {
    const features = [1, ...state.history.slice(0, 12).map(bitSign)]
    let y = 0
    for (let i = 0; i < features.length; i += 1) y += state.weights[i] * features[i]
    prediction = y >= 0 ? 1 : 0
    const theta = 18
    if (prediction !== outcome || Math.abs(y) < theta) {
      for (let i = 0; i < features.length; i += 1) {
        state.weights[i] += bitSign(outcome) * features[i]
      }
    }
    index = Math.abs(y) % TABLE
    message = `加权和 y=${y}，符号判方向，幅值近似置信度。`
  } else {
    index = (pc ^ ghist) % TABLE
    prediction = predictFromCounter(state.counters, index)
    bump(state.counters, index, outcome)
    const event = state.step % 12
    if (event === 3) state.ras = [`0x${(4096 + state.step * 7).toString(16).toUpperCase()}`, ...state.ras].slice(0, 4)
    if (event === 9) state.ras = state.ras.slice(1)
    if (state.step % 5 === 0) {
      state.btb = [{ tag: pc, target: `0x${(8192 + state.step * 13).toString(16).toUpperCase()}` }, ...state.btb].slice(0, 4)
    }
    message = '方向由计数器给，目标由 BTB/RAS/间接表协同给出。'
  }

  const correct = prediction === outcome
  state.history = [outcome, ...state.history].slice(0, 12)
  state.correct += correct ? 1 : 0
  state.total += 1
  state.step += 1
  state.lastPrediction = prediction
  state.lastCorrect = correct
  state.lastIndex = index
  state.flush = correct ? 0 : 1
  state.message = `${correct ? '命中：流水线继续满速。' : '误预测：冲刷错误路径，前端重新 steering。'} ${message}`
  return state
}

export const accuracy = (state: SimState) => (state.total === 0 ? 0 : (state.correct / state.total) * 100)

export const counterLabel = (v: number) => ['强 NT', '弱 NT', '弱 T', '强 T'][Math.max(0, Math.min(3, v))]
