import type { ReactNode } from 'react'
import type { PredictorMeta } from '@/data/predictors'
import type { SimState } from '@/lib/simulator'

const bitText = (b: number) => (b === 1 ? 'T' : 'NT')
const bitSign = (b: number) => (b === 1 ? 1 : -1)

function LiveValue({ step, children, color, className = '' }: { step: number; children: ReactNode; color?: string; className?: string }) {
  return (
    <span key={step} className={`live-value ${className}`} style={{ color }}>
      {children}
    </span>
  )
}

function Node({ label, accent, hot = false }: { label: ReactNode; accent: string; hot?: boolean }) {
  return (
    <div
      className={`diagram-node ${hot ? 'node-hot' : ''}`}
      style={{ borderColor: `${accent}88`, boxShadow: hot ? `0 0 24px ${accent}55` : undefined }}
    >
      {label}
    </div>
  )
}

function Wire({ accent, vertical = false, pulseKey }: { accent: string; vertical?: boolean; pulseKey?: number }) {
  return (
    <div
      className={vertical ? 'wire-v' : 'wire-h'}
      style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
    >
      <i
        key={pulseKey}
        className={vertical ? 'flow-pulse flow-pulse-v' : 'flow-pulse'}
        style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
      />
    </div>
  )
}

export default function LivePredictorDiagram({ meta, sim }: { meta: PredictorMeta; sim: SimState }) {
  const a = meta.accent
  const step = sim.step
  const lastPc = sim.total === 0 ? sim.step % 16 : (sim.step - 1) % 16
  const outcome = sim.history[0] ?? 0
  const idx = sim.lastIndex
  const counter = sim.counters[idx] ?? 0
  const pred = sim.lastPrediction
  const resultMark = sim.lastCorrect === null ? '—' : sim.lastCorrect ? '✓' : '×'
  const resultColor = sim.lastCorrect === null ? a : sim.lastCorrect ? '#34d399' : '#fb7185'
  const localHistory = sim.localHistories[lastPc] & 0xf

  const bitCell = (value: number, delay = 0, hot = false) => (
    <span
      key={`${step}-${delay}-${value}`}
      className={`bit-cell ${hot ? 'history-new' : ''}`}
      style={{ borderColor: `${a}66`, animationDelay: `${delay}ms` }}
    >
      {value}
    </span>
  )

  const outputLabel = (
    <LiveValue step={step} color={resultColor}>
      {bitText(pred)} {resultMark}
    </LiveValue>
  )

  if (meta.diagram === 'flipflop') {
    return (
      <div className="diagram-wrap">
        <Node label={<LiveValue step={step}>PC {lastPc.toString(2).padStart(4, '0')}</LiveValue>} accent={a} />
        <Wire accent={a} pulseKey={step} />
        <div className="flipflop" style={{ borderColor: `${a}aa` }}>
          <span key={`q-${step}`} className="ff-q live-value" style={{ background: a }}>Q{pred}</span>
          <span key={`d-${step}`} className="ff-d live-value">D{outcome}</span>
        </div>
        <Wire accent={a} pulseKey={step} />
        <Node label={outputLabel} accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'counter') {
    return (
      <div className="diagram-wrap">
        <Node label={<LiveValue step={step}>PC {lastPc}</LiveValue>} accent={a} />
        {['SNT', 'WNT', 'WT', 'ST'].map((s, i) => (
          <div
            key={s}
            className={`counter-state ${i === counter ? 'node-hot' : ''}`}
            style={{
              animationDelay: `${i * 260}ms`,
              borderColor: i === counter ? a : `${a}88`,
              boxShadow: i === counter ? `0 0 18px ${a}55` : undefined,
            }}
          >
            <span>{s}</span>
            <i style={{ background: a, width: `${(i + 1) * 25}%` }} />
          </div>
        ))}
        <Node label={<LiveValue step={step} color={resultColor}>ctr {counter}/3 → {bitText(pred)}</LiveValue>} accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'table') {
    const start = Math.max(0, Math.min(52, idx - 5))
    return (
      <div className="diagram-wrap table-wrap">
        <Node label={<LiveValue step={step}>PC {lastPc}</LiveValue>} accent={a} />
        <Wire accent={a} pulseKey={step} />
        <div className="mini-table">
          {Array.from({ length: 12 }, (_, i) => {
            const cell = start + i
            const value = sim.counters[cell] ?? 0
            const hot = cell === idx
            return (
              <span
                key={`${step}-${cell}`}
                className={hot ? 'cell-hot' : ''}
                style={hot ? { borderColor: a, boxShadow: `0 0 18px ${a}66` } : undefined}
              >
                {value.toString(2).padStart(2, '0')}
              </span>
            )
          })}
        </div>
        <Node label={<LiveValue step={step}>idx {idx}</LiveValue>} accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'local-history') {
    const localBits = localHistory.toString(2).padStart(4, '0').split('').map(Number)
    return (
      <div className="diagram-col">
        <div className="diagram-wrap">
          <Node label={<LiveValue step={step}>PC {lastPc}</LiveValue>} accent={a} hot />
          <div className="shift-reg">{localBits.map((v, i) => bitCell(v, i * 90, i === 0))}</div>
          <Node label={<LiveValue step={step}>PHT {idx}</LiveValue>} accent={a} />
        </div>
        <div className="diagram-wrap">
          <Node label="other" accent={a} />
          <div className="shift-reg dim">{sim.history.slice(0, 6).map((v, i) => bitCell(v, i * 90))}</div>
        </div>
      </div>
    )
  }

  if (meta.diagram === 'global-history') {
    return (
      <div className="diagram-col">
        <div className="shift-reg global">{sim.history.slice(0, 8).map((v, i) => bitCell(v, i * 70, i === 0))}</div>
        <div className="diagram-wrap">
          <Node label="GHR" accent={a} hot />
          <Wire accent={a} pulseKey={step} />
          <Node label={<LiveValue step={step}>PHT {idx}</LiveValue>} accent={a} />
        </div>
      </div>
    )
  }

  if (meta.diagram === 'xor') {
    return (
      <div className="diagram-wrap">
        <div className="diagram-col tight">
          <Node label={<LiveValue step={step}>PC {lastPc.toString(2).padStart(4, '0')}</LiveValue>} accent={a} />
          <Node label={<LiveValue step={step}>GHR {sim.history.slice(0, 4).join('')}</LiveValue>} accent={a} />
        </div>
        <div className="xor-gate" style={{ borderColor: `${a}aa`, color: a }}>⊕</div>
        <Node label={<LiveValue step={step}>idx {idx}</LiveValue>} accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'tournament') {
    const ghistNum = sim.history.slice(0, 10).reduce<number>((acc, b) => (acc << 1) | b, 0)
    const localIdx = (lastPc * 16 + localHistory) % 64
    const globalIdx = (lastPc ^ ghistNum) % 64
    const localPred = (sim.counters[localIdx] ?? 0) >= 2 ? 1 : 0
    const globalPred = (sim.altCounters[globalIdx] ?? 0) >= 2 ? 1 : 0
    const chooser = sim.chooser[lastPc] ?? 0
    return (
      <div className="diagram-col">
        <div className="diagram-wrap">
          <Node label={<LiveValue step={step}>Local {bitText(localPred)}</LiveValue>} accent={a} />
          <Node label={<LiveValue step={step}>Global {bitText(globalPred)}</LiveValue>} accent={a} />
        </div>
        <div className="diagram-wrap">
          <Wire accent={a} pulseKey={step} />
          <div className="chooser" style={{ borderColor: `${a}aa` }}>
            <LiveValue step={step}>C{chooser}/3</LiveValue>
          </div>
          <Wire accent={a} pulseKey={step} />
          <Node label={outputLabel} accent={a} hot />
        </div>
      </div>
    )
  }

  if (meta.diagram === 'tage') {
    return (
      <div className="diagram-col">
        <div className="shift-reg global">{sim.history.slice(0, 8).map((v, i) => bitCell(v, i * 70, i === 0))}</div>
        {[3, 6, 11].map((n, ti) => (
          <div key={n} className="tage-row" style={{ animationDelay: `${ti * 180}ms` }}>
            <span style={{ color: a }}>H{n}</span>
            <div className="mini-table grow">
              {sim.tage[ti].slice(0, 6).map((e, j) => (
                <span
                  key={`${step}-${ti}-${j}`}
                  className={e.tag >= 0 ? 'cell-hot' : ''}
                  style={e.tag >= 0 ? { borderColor: a } : undefined}
                >
                  {e.tag >= 0 ? `${e.tag}:${e.ctr}` : '—'}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="diagram-wrap">
          <Node label={<LiveValue step={step}>idx {idx}</LiveValue>} accent={a} />
          <Wire accent={a} pulseKey={step} />
          <Node label={outputLabel} accent={a} hot />
        </div>
      </div>
    )
  }

  if (meta.diagram === 'perceptron') {
    const y = sim.weights.reduce<number>((sum, w, i) => sum + w * (i === 0 ? 1 : bitSign(sim.history[i - 1] ?? 0)), 0)
    return (
      <div className="diagram-wrap">
        <div className="diagram-col tight">
          {[0, 1, 2].map((i) => (
            <span key={`${step}-${i}`} className="weight-chip live-value" style={{ borderColor: `${a}77`, animationDelay: `${i * 140}ms` }}>
              h{i}={sim.history[i] ?? 0}×w{i}={sim.weights[i]}
            </span>
          ))}
        </div>
        <div className="sum-node" style={{ borderColor: `${a}aa`, color: a }}>Σ</div>
        <Node label={<LiveValue step={step} color={resultColor}>y {y} → {bitText(pred)}</LiveValue>} accent={a} hot />
      </div>
    )
  }

  return (
    <div className="diagram-wrap">
      <div className="diagram-col tight">
        <Node label={<LiveValue step={step}>BTB {sim.btb[0]?.target ?? '—'}</LiveValue>} accent={a} />
        <Node label={<LiveValue step={step}>dir {bitText(pred)}</LiveValue>} accent={a} />
      </div>
      <div className="ras-stack" style={{ borderColor: `${a}88` }}>
        {sim.ras.slice(0, 3).map((r, i) => (
          <span key={`${step}-${r}-${i}`} style={{ animationDelay: `${i * 160}ms` }}>{r}</span>
        ))}
      </div>
      <Node label={<LiveValue step={step} color={resultColor}>target {sim.btb[0]?.target ?? 'PC'}</LiveValue>} accent={a} hot />
    </div>
  )
}
