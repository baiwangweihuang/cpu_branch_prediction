import { useRef, useState } from 'react'
import { ArrowDown, Cpu, ExternalLink, GitBranch, Languages, Radar, ShieldAlert } from 'lucide-react'
import FrontierDiagram from '@/components/FrontierDiagram'
import PredictorDiagram from '@/components/PredictorDiagram'
import SimulatorStage from '@/components/SimulatorStage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FRONTIER_WORKS } from '@/data/frontier'
import { FAMILY_EN, FRONTIER_EN, FRONTIER_HARDWARE_EN, PREDICTOR_EN, PREDICTOR_HARDWARE_EN, UI, type Lang } from '@/data/i18n-content'
import { PREDICTORS, predictorById, type PredictorId } from '@/data/predictors'

const familyColor: Record<string, string> = {
  经典奠基: 'bg-sky-400/15 text-sky-200 border-sky-300/30',
  相关历史: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
  现代高性能: 'bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/30',
  目标预测: 'bg-rose-400/15 text-rose-200 border-rose-300/30',
}

export default function Home() {
  const [selected, setSelected] = useState<PredictorId>('tage')
  const [lang, setLang] = useState<Lang>('zh')
  const stageRef = useRef<HTMLDivElement | null>(null)
  const selectedMeta = predictorById(selected)
  const isEn = lang === 'en'
  const t = UI[lang]
  const selectedEn = PREDICTOR_EN[selected]

  const jumpToStage = (id: PredictorId) => {
    setSelected(id)
    window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0,#020617_42%,#000_100%)] text-slate-100">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-200" variant="outline">
              <Cpu className="mr-1 h-3.5 w-3.5" /> CPU Front-end Visual Lab
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-slate-300" variant="outline">{t.badge}</Badge>
          </div>
          <Button variant="outline" onClick={() => setLang(isEn ? 'zh' : 'en')} className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
            <Languages className="mr-2 h-4 w-4" /> {isEn ? '中文' : 'English'}
          </Button>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
              {isEn ? 'Branch Predictors' : '分支预测器'}
              <span className="block bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">
                {isEn ? 'Animated Implementation Museum' : '动画实现博物馆'}
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{t.heroLine}</p>
          </div>
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Radar className="h-5 w-5 text-cyan-300" /> {t.intuition}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p><GitBranch className="mr-2 inline h-4 w-4 text-emerald-300" />{t.intuition1}</p>
              <p><ShieldAlert className="mr-2 inline h-4 w-4 text-rose-300" />{t.intuition2}</p>
              <Button onClick={() => jumpToStage(selected)} className="mt-2 w-full bg-white text-slate-950 hover:bg-slate-200">
                {t.enter} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t.topKicker}</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{t.topTitle}</h2>
          </div>
          <p className="hidden max-w-md text-right text-sm text-slate-500 md:block">{t.topNote}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PREDICTORS.map((p) => {
            const en = PREDICTOR_EN[p.id]
            return (
              <button
                key={p.id}
                onClick={() => jumpToStage(p.id)}
                className={`group rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-white/30 ${selected === p.id ? 'border-white/40 bg-white/[0.08]' : 'border-white/10 bg-white/[0.035]'}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">#{p.rank}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${familyColor[p.family]}`}>{isEn ? FAMILY_EN[p.family] : p.family}</span>
                </div>
                <div className="h-28 rounded-2xl border border-white/10 bg-black/30 p-3">
                  <PredictorDiagram meta={p} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{isEn ? p.name : p.cn}</h3>
                <p className="text-xs text-slate-500">{isEn ? p.cn : p.name} · {p.era}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{isEn ? en.tagline : p.tagline}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t.frontierKicker}</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{t.frontierTitle}</h2>
          </div>
          <p className="hidden max-w-md text-right text-sm text-slate-500 md:block">{t.frontierNote}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FRONTIER_WORKS.map((w) => {
            const en = FRONTIER_EN[w.id]
            return (
              <Card key={w.id} className="border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/25">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant="outline" className="border-white/15 text-slate-300">{w.year}</Badge>
                    <span className="text-right text-xs text-slate-500">{w.venue}</span>
                  </div>
                  <CardTitle className="text-xl text-white">{isEn ? w.name : w.cn}</CardTitle>
                  <p className="text-sm text-slate-500">{isEn ? w.cn : w.name}</p>
                  <div className="mt-3 h-24 rounded-2xl border border-white/10 bg-black/30 p-3">
                    <FrontierDiagram work={w} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
                  <p>{isEn ? en.idea : w.idea}</p>
                  <p className="text-slate-400"><span style={{ color: w.accent }}>{t.why}</span>{isEn ? en.why : w.why}</p>
                  <div className="flex flex-wrap gap-2">
                    {(isEn ? FRONTIER_HARDWARE_EN[w.id] : w.hardware).map((h) => (
                      <Badge key={h} variant="outline" className="border-white/15 text-slate-300">{h}</Badge>
                    ))}
                  </div>
                  <a href={w.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
                    {t.source} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section ref={stageRef} className="mx-auto max-w-7xl scroll-mt-6 px-6 pb-12">
        <SimulatorStage selected={selected} onSelect={setSelected} lang={lang} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-white">{t.current}{isEn ? selectedMeta.name : selectedMeta.cn}</CardTitle>
              <p className="text-sm text-slate-500">{isEn ? selectedMeta.cn : selectedMeta.name} · {selectedMeta.era}</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <p>{isEn ? selectedEn.idea : selectedMeta.idea}</p>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{t.keyHw}</p>
                <div className="flex flex-wrap gap-2">
                  {(isEn ? PREDICTOR_HARDWARE_EN[selected] : selectedMeta.hardware).map((h) => (
                    <Badge key={h} variant="outline" className="border-white/15 text-slate-300">{h}</Badge>
                  ))}
                </div>
              </div>
              <Separator className="bg-white/10" />
              <p><span className="text-emerald-300">{t.goodAt}</span>{isEn ? selectedEn.goodAt : selectedMeta.goodAt}</p>
              <p><span className="text-rose-300">{t.blindSpot}</span>{isEn ? selectedEn.blindSpot : selectedMeta.blindSpot}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-white">{t.readTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-slate-300 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-cyan-200">{t.read1t}</p>
                <p className="mt-1 text-slate-400">{t.read1}</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-fuchsia-200">{t.read2t}</p>
                <p className="mt-1 text-slate-400">{t.read2}</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-emerald-200">{t.read3t}</p>
                <p className="mt-1 text-slate-400">{t.read3}</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-rose-200">{t.read4t}</p>
                <p className="mt-1 text-slate-400">{t.read4}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
