import { useRef, useState } from 'react'
import { ArrowDown, Cpu, GitBranch, Radar, ShieldAlert } from 'lucide-react'
import PredictorDiagram from '@/components/PredictorDiagram'
import SimulatorStage from '@/components/SimulatorStage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PREDICTORS, predictorById, type PredictorId } from '@/data/predictors'

const familyColor: Record<string, string> = {
  经典奠基: 'bg-sky-400/15 text-sky-200 border-sky-300/30',
  相关历史: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
  现代高性能: 'bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/30',
  目标预测: 'bg-rose-400/15 text-rose-200 border-rose-300/30',
}

export default function Home() {
  const [selected, setSelected] = useState<PredictorId>('tage')
  const stageRef = useRef<HTMLDivElement | null>(null)
  const selectedMeta = predictorById(selected)

  const jumpToStage = (id: PredictorId) => {
    setSelected(id)
    window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0,#020617_42%,#000_100%)] text-slate-100">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-200" variant="outline">
            <Cpu className="mr-1 h-3.5 w-3.5" /> CPU Front-end Visual Lab
          </Badge>
          <Badge className="border-white/10 bg-white/5 text-slate-300" variant="outline">10 个经典 / 现代分支预测器</Badge>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
              分支预测器
              <span className="block bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">动画实现博物馆</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              从 1 位记忆到 TAGE、感知机与 BTB/RAS：把“猜方向、猜目标、猜错冲刷”做成看得见的硬件状态机。点击任意卡片，下方实验台会切换到对应实现并持续跑分支流。
            </p>
          </div>
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Radar className="h-5 w-5 text-cyan-300" /> 一句话直觉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p><GitBranch className="mr-2 inline h-4 w-4 text-emerald-300" />预测器不是在“算对错”，而是在冒险提前 steering 取指。</p>
              <p><ShieldAlert className="mr-2 inline h-4 w-4 text-rose-300" />误预测代价 = 冲刷深度 × 前端重新填充时间；投机痕迹还可能变成侧信道。</p>
              <Button onClick={() => jumpToStage(selected)} className="mt-2 w-full bg-white text-slate-950 hover:bg-slate-200">
                进入动画实验台 <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top 10 timeline</p>
            <h2 className="mt-2 text-3xl font-bold text-white">最经典到目前主流思想</h2>
          </div>
          <p className="hidden max-w-md text-right text-sm text-slate-500 md:block">每张卡都是一个可动的微缩数据通路：亮点表示当前被数据流击中的部件。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PREDICTORS.map((p) => (
            <button
              key={p.id}
              onClick={() => jumpToStage(p.id)}
              className={`group rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-white/30 ${selected === p.id ? 'border-white/40 bg-white/[0.08]' : 'border-white/10 bg-white/[0.035]'}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">#{p.rank}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${familyColor[p.family]}`}>{p.family}</span>
              </div>
              <div className="h-28 rounded-2xl border border-white/10 bg-black/30 p-3">
                <PredictorDiagram meta={p} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{p.cn}</h3>
              <p className="text-xs text-slate-500">{p.name} · {p.era}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{p.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      <section ref={stageRef} className="mx-auto max-w-7xl scroll-mt-6 px-6 pb-12">
        <SimulatorStage selected={selected} onSelect={setSelected} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-white">当前选中：{selectedMeta.cn}</CardTitle>
              <p className="text-sm text-slate-500">{selectedMeta.name} · {selectedMeta.era}</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <p>{selectedMeta.idea}</p>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">关键硬件</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMeta.hardware.map((h) => (
                    <Badge key={h} variant="outline" className="border-white/15 text-slate-300">{h}</Badge>
                  ))}
                </div>
              </div>
              <Separator className="bg-white/10" />
              <p><span className="text-emerald-300">擅长：</span>{selectedMeta.goodAt}</p>
              <p><span className="text-rose-300">盲区：</span>{selectedMeta.blindSpot}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-white">读图方法</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-slate-300 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-cyan-200">1. 先看输入</p>
                <p className="mt-1 text-slate-400">PC、GHR、局部历史、BTB/RAS 分别回答“我在哪、我刚怎么走、要跳去哪”。</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-fuchsia-200">2. 再看状态</p>
                <p className="mt-1 text-slate-400">计数器、tag、权重、选择器都是可学习状态；动画里发亮的是本次被读写的项。</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-emerald-200">3. 命中继续</p>
                <p className="mt-1 text-slate-400">预测正确时，取指像没有分支一样连续推进，前端带宽被保住。</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-rose-200">4. 错了冲刷</p>
                <p className="mt-1 text-slate-400">红色抖动代表 wrong-path 被丢弃，PC 被重新 steering 到正确路径。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
