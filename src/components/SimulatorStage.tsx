import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, StepForward, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import LivePredictorDiagram from '@/components/LivePredictorDiagram'
import { PATTERN_EN, PREDICTOR_EN, UI, type Lang } from '@/data/i18n-content'
import { PATTERNS, predictorById, type PatternId, type PredictorId } from '@/data/predictors'
import { accuracy, counterLabel, createSimState, stepPredictor, type SimState } from '@/lib/simulator'

const bitText = (b: number) => (b === 1 ? 'T' : 'NT')

export default function SimulatorStage({ selected, onSelect, lang }: { selected: PredictorId; onSelect: (id: PredictorId) => void; lang: Lang }) {
  const meta = predictorById(selected)
  const en = PREDICTOR_EN[selected]
  const isEn = lang === 'en'
  const t = UI[lang]
  const [patternId, setPatternId] = useState<PatternId>('loop')
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(650)
  const [sim, setSim] = useState<SimState>(() => createSimState(selected))
  const timer = useRef<number | null>(null)
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0]

  useEffect(() => {
    setSim(createSimState(selected))
  }, [selected])

  const resetSim = () => {
    setSim(createSimState(selected))
  }

  useEffect(() => {
    if (!running) {
      if (timer.current !== null) window.clearInterval(timer.current)
      timer.current = null
      return
    }
    timer.current = window.setInterval(() => {
      setSim((s) => stepPredictor(s, pattern.outcome(s.step)))
    }, speed)
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current)
      timer.current = null
    }
  }, [running, speed, pattern])

  const upcoming = useMemo(
    () => Array.from({ length: 24 }, (_, i) => pattern.outcome(sim.step + i)),
    [pattern, sim.step],
  )

  const acc = accuracy(sim)
  const hotCounters = sim.counters.slice(0, 16)
  const counterText = (v: number) => (isEn ? ['strong NT', 'weak NT', 'weak T', 'strong T'][Math.max(0, Math.min(3, v))] : counterLabel(v))
  const outcome = sim.history[0] ?? 0
  const baseMessage = sim.lastCorrect === null
    ? t.startHint
    : sim.lastCorrect
      ? 'Hit: the pipeline keeps running.'
      : 'Misprediction: flush the wrong path and re-steer the front-end.'
  const detailEn = (() => {
    if (sim.lastCorrect === null) return ''
    if (selected === 'one-bit') return `The single bit was rewritten to ${bitText(outcome)}.`
    if (selected === 'two-bit' || selected === 'bimodal') return `The saturating counter moved to ${sim.counters[sim.lastIndex]}/3, so one opposite outcome does not flip it.`
    if (selected === 'local') return `This branch shifted its private history; index ${sim.lastIndex} was updated.`
    if (selected === 'global') return `The shared global history fingerprint selected entry ${sim.lastIndex}.`
    if (selected === 'gshare') return `PC XOR GHR produced index ${sim.lastIndex}.`
    if (selected === 'tournament') return `The chooser compared local vs global experts and updated the winning side toward ${bitText(outcome)}.`
    if (selected === 'tage') return `The longest tagged match acted as provider; on a miss a longer-history entry may be allocated.`
    if (selected === 'perceptron') return `Weights were trained only when wrong or below the confidence threshold.`
    return `Direction came from counters while BTB/RAS/indirect tables supplied the target side.`
  })()
  const message = isEn ? `${baseMessage} ${detailEn}` : sim.message

  return (
    <Card className="overflow-hidden border-white/10 bg-slate-950/70 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Zap className="h-5 w-5" style={{ color: meta.accent }} />
              {t.stageTitle}{isEn ? meta.name : meta.cn}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-400">{isEn ? en.tagline : meta.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-slate-300">{t.step} {sim.step}</Badge>
            <Badge className="text-slate-950" style={{ background: meta.accent }}>
              {t.accuracy} {acc.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setRunning((v) => !v)} className="bg-white text-slate-950 hover:bg-slate-200">
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? t.pause : t.play}
            </Button>
            <Button variant="outline" onClick={() => setSim((s) => stepPredictor(s, pattern.outcome(s.step)))} className="border-white/15 text-slate-200">
              <StepForward className="mr-2 h-4 w-4" /> {t.oneStep}
            </Button>
            <Button variant="ghost" onClick={resetSim} className="text-slate-300">
              <RotateCcw className="mr-2 h-4 w-4" /> {t.reset}
            </Button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
              <span>{t.speed}</span>
              <span>{speed} {t.perBranch}</span>
            </div>
            <Slider value={[speed]} min={120} max={1400} step={20} onValueChange={(v) => setSpeed(v[0] ?? speed)} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">{t.stream}</p>
            <div className="grid grid-cols-2 gap-2">
              {PATTERNS.map((p) => {
                const pEn = PATTERN_EN[p.id]
                return (
                  <button
                    key={p.id}
                    onClick={() => setPatternId(p.id)}
                    className={`rounded-xl border p-3 text-left transition ${patternId === p.id ? 'border-cyan-300/60 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
                  >
                    <span className="block text-sm font-semibold text-slate-100">{isEn ? pEn.name : p.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{isEn ? pEn.desc : p.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{t.upcoming}</p>
            <div className="flex flex-wrap gap-1.5">
              {upcoming.map((b, i) => (
                <span
                  key={`${sim.step}-${i}`}
                  className={`rounded-md px-2 py-1 font-mono text-xs ${i === 0 ? 'text-slate-950' : 'text-slate-300'} ${b === 1 ? 'bg-emerald-400/90' : 'bg-rose-400/80'} ${i === 0 ? 'ring-2 ring-white/70' : 'opacity-70'}`}
                >
                  {bitText(b)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 transition ${sim.lastCorrect === false ? 'flush-shake border-rose-400/50 bg-rose-950/20' : 'border-white/10 bg-white/[0.03]'}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{t.lastPred}</p>
              <p className="mt-1 font-mono text-2xl text-white">
                {t.guess} <span style={{ color: meta.accent }}>{bitText(sim.lastPrediction)}</span>
                {sim.lastCorrect !== null && (
                  <span className={sim.lastCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                    {' '}→ {sim.lastCorrect ? t.hit : t.miss}
                  </span>
                )}
              </p>
            </div>
            <div className="w-48">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>{t.totalHit}</span>
                <span>{sim.correct}/{sim.total}</span>
              </div>
              <Progress value={acc} className="h-2 bg-white/10" />
            </div>
          </div>

          <p className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-300">{message}</p>

          <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t.miniPath}</p>
                <p className="mt-1 text-xs text-slate-500">{t.miniPathNote}</p>
              </div>
              <Badge variant="outline" className="border-white/15 font-mono text-xs text-slate-300">
                {isEn ? meta.name : meta.cn}
              </Badge>
            </div>
            <div className="h-36 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <LivePredictorDiagram meta={meta} sim={sim} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{t.history}</p>
              <div className="flex flex-wrap gap-1.5">
                {sim.history.map((b, i) => (
                  <span
                    key={`${i}-${b}`}
                    className={`history-bit ${i === 0 ? 'history-new' : ''}`}
                    style={{ borderColor: `${meta.accent}55`, color: b ? '#6ee7b7' : '#fda4af' }}
                  >
                    {b}
                  </span>
                ))}
              </div>
              <Separator className="my-4 bg-white/10" />
              <p className="text-xs leading-5 text-slate-500">{t.historyNote}</p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{t.counters}</p>
              <div className="grid grid-cols-4 gap-2">
                {hotCounters.map((c, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 text-center transition ${i === sim.lastIndex % 16 ? 'scale-105 border-white/50 bg-white/10' : 'border-white/10 bg-black/20'}`}
                  >
                    <span className="block font-mono text-sm text-white">{c}</span>
                    <span className="block text-[10px] text-slate-500">{counterText(c)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selected === 'tage' && (
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {sim.tage.map((table, ti) => (
                <div key={ti} className="rounded-2xl border border-white/10 p-3">
                  <p className="mb-2 text-xs text-slate-400">T{ti} · {t.tageTables}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {table.map((e, i) => (
                      <span key={i} className={`rounded border px-1 py-1 text-center font-mono text-[10px] ${e.tag >= 0 ? 'border-fuchsia-300/40 text-fuchsia-200' : 'border-white/10 text-slate-600'}`}>
                        {e.tag >= 0 ? `${e.tag}:${e.ctr}` : '—'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected === 'perceptron' && (
            <div className="mt-4 rounded-2xl border border-white/10 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{t.weights}</p>
              <div className="flex flex-wrap gap-2">
                {sim.weights.map((w, i) => (
                  <span key={i} className="rounded-lg border border-sky-300/30 bg-sky-400/10 px-2 py-1 font-mono text-xs text-sky-200">
                    w{i}={w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selected === 'indirect' && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">BTB</p>
                {sim.btb.map((e) => (
                  <div key={`${e.tag}-${e.target}`} className="mb-1 flex justify-between rounded bg-black/30 px-2 py-1 font-mono text-xs text-slate-300">
                    <span>tag {e.tag}</span><span>{e.target}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">RAS</p>
                <div className="flex flex-col-reverse gap-1">
                  {sim.ras.map((r, i) => (
                    <span key={`${r}-${i}`} className="rounded bg-rose-400/10 px-2 py-1 font-mono text-xs text-rose-200">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(['one-bit', 'two-bit', 'tage', 'perceptron', 'indirect'] as PredictorId[]).map((id) => (
              <Button key={id} size="sm" variant={id === selected ? 'default' : 'outline'} onClick={() => onSelect(id)} className={id === selected ? 'bg-white text-slate-950' : 'border-white/15 text-slate-300'}>
                {t.switchTo} {isEn ? predictorById(id).name : predictorById(id).cn}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
