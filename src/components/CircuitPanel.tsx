import type { ReactNode } from 'react'
import { UI, type Lang } from '@/data/i18n-content'
import type { PredictorId } from '@/data/predictors'
import type { SimState } from '@/lib/simulator'

const bitText = (b: number) => (b === 1 ? 'T' : 'NT')

function CircuitNode({
  label,
  children,
  accent,
  active = false,
  className = '',
}: {
  label: string
  children: ReactNode
  accent: string
  active?: boolean
  className?: string
}) {
  return (
    <div className={`circuit-node ${className}`} style={{ borderColor: active ? `${accent}99` : undefined }}>
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Wire({ accent }: { accent: string }) {
  return <div className="circuit-wire" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
}

export default function CircuitPanel({ selected, sim, accent, lang }: { selected: PredictorId; sim: SimState; accent: string; lang: Lang }) {
  const t = UI[lang]
  const isEn = lang === 'en'
  const lastPc = sim.total === 0 ? sim.step % 16 : (sim.step - 1) % 16
  const outcome = sim.history[0] ?? 0
  const counter = sim.counters[sim.lastIndex] ?? 0
  const localHistory = sim.localHistories[lastPc] & 0xf
  const chooser = sim.chooser[lastPc] ?? 0
  const outputColor = sim.lastCorrect === null ? accent : sim.lastCorrect ? '#34d399' : '#fb7185'

  const historyLabel = selected === 'local'
    ? (isEn ? 'local BHR' : '局部 BHR')
    : selected === 'perceptron'
      ? (isEn ? 'feature history' : '特征历史')
      : 'GHR'

  const logicLabel = (() => {
    switch (selected) {
      case 'one-bit': return isEn ? 'PC → 1-bit table' : 'PC → 1 位表'
      case 'two-bit': return isEn ? 'PC → counter FSM' : 'PC → 计数器 FSM'
      case 'bimodal': return isEn ? 'PC low bits → PHT' : 'PC 低位 → PHT'
      case 'local': return 'PC + BHR → PHT'
      case 'global': return 'GHR → PHT'
      case 'gshare': return 'PC XOR GHR'
      case 'tournament': return isEn ? 'local/global → chooser' : 'Local/Global → 选择器'
      case 'tage': return isEn ? 'tag match → provider' : 'tag 匹配 → provider'
      case 'perceptron': return isEn ? 'Σ wi·xi → sign' : 'Σ wi·xi → 符号'
      case 'indirect': return isEn ? 'BTB/RAS → target' : 'BTB/RAS → 目标'
    }
  })()

  const stateLines = (() => {
    switch (selected) {
      case 'one-bit':
        return [`bit[${sim.lastIndex}] = ${counter >= 2 ? 1 : 0}`, `${t.circuitUpdate}: ${bitText(outcome)}`]
      case 'two-bit':
      case 'bimodal':
      case 'global':
      case 'gshare':
        return [`ctr[${sim.lastIndex}] = ${counter}/3`, `${t.circuitUpdate}: ${outcome === 1 ? '+1' : '-1'}`]
      case 'local':
        return [`BHR[${lastPc}] = ${localHistory.toString(2).padStart(4, '0')}`, `ctr[${sim.lastIndex}] = ${counter}/3`]
      case 'tournament':
        return [`chooser[${lastPc}] = ${chooser}/3`, `ctr[${sim.lastIndex}] = ${counter}/3`]
      case 'tage':
        return [`valid ${sim.tage.map((table) => table.filter((e) => e.tag >= 0).length).join('/')}`, `idx ${sim.lastIndex}`]
      case 'perceptron':
        return [sim.weights.slice(0, 5).map((w, i) => `w${i}=${w}`).join(' '), `idx ${sim.lastIndex}`]
      case 'indirect':
        return [`BTB ${sim.btb[0]?.target ?? '—'}`, `RAS ${sim.ras[0] ?? '—'}`]
    }
  })()

  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t.circuit}</p>
          <p className="mt-1 text-xs text-slate-500">{t.circuitNote}</p>
        </div>
        <p className="font-mono text-xs text-slate-500">clk #{sim.step}</p>
      </div>

      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
        <CircuitNode label={t.circuitInput} accent={accent} className="min-w-28">
          <div key={`pc-${sim.step}`} className="circuit-value font-mono text-xs text-slate-200">
            PC {lastPc.toString(2).padStart(4, '0')}
          </div>
          <div key={`outcome-${sim.step}`} className="circuit-value font-mono text-xs" style={{ color: outcome === 1 ? '#6ee7b7' : '#fda4af' }}>
            {t.circuitOutcome}: {sim.total === 0 ? '—' : bitText(outcome)}
          </div>
        </CircuitNode>

        <Wire accent={accent} />

        <CircuitNode label={`${t.circuitHistory} · ${historyLabel}`} accent={accent} className="min-w-64">
          <div className="flex gap-1">
            {sim.history.slice(0, 10).map((b, i) => (
              <span
                key={`${i}-${b}`}
                className={`circuit-bit ${i === 0 && sim.total > 0 ? 'history-new' : ''}`}
                style={{ borderColor: `${accent}55`, color: b === 1 ? '#6ee7b7' : '#fda4af' }}
              >
                {b}
              </span>
            ))}
          </div>
        </CircuitNode>

        <Wire accent={accent} />

        <CircuitNode label={t.circuitLogic} accent={accent} active className="min-w-36">
          <div className="text-xs text-slate-200">{logicLabel}</div>
          <div key={`idx-${sim.step}`} className="circuit-value font-mono text-xs" style={{ color: accent }}>
            idx {sim.lastIndex}
          </div>
        </CircuitNode>

        <Wire accent={accent} />

        <CircuitNode label={t.circuitState} accent={accent} className="min-w-40">
          {stateLines.map((line, i) => (
            <div key={`${sim.step}-${i}`} className="circuit-value font-mono text-xs text-slate-200">
              {line}
            </div>
          ))}
        </CircuitNode>

        <Wire accent={accent} />

        <div
          className="circuit-node min-w-28"
          style={{
            borderColor: `${outputColor}aa`,
            boxShadow: sim.lastCorrect === false ? '0 0 24px rgba(251,113,133,0.18)' : undefined,
          }}
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">{t.circuitOutput}</p>
          <div key={`pred-${sim.step}`} className="circuit-value font-mono text-lg" style={{ color: outputColor }}>
            {sim.total === 0 ? '—' : bitText(sim.lastPrediction)}
          </div>
          <div className="font-mono text-[10px] text-slate-500">flush {sim.flush}</div>
          <div className="text-[10px]" style={{ color: outputColor }}>
            {sim.lastCorrect === null ? '—' : sim.lastCorrect ? t.hit : t.miss}
          </div>
        </div>
      </div>
    </div>
  )
}
