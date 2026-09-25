import type { PredictorMeta } from '@/data/predictors'

const bit = (v: string, accent: string, delay = 0) => (
  <span
    className="bit-cell"
    style={{ borderColor: `${accent}66`, animationDelay: `${delay}ms` }}
  >
    {v}
  </span>
)

const Node = ({ label, accent, hot = false }: { label: string; accent: string; hot?: boolean }) => (
  <div
    className={`diagram-node ${hot ? 'node-hot' : ''}`}
    style={{ borderColor: `${accent}88`, boxShadow: hot ? `0 0 24px ${accent}55` : undefined }}
  >
    {label}
  </div>
)

const Wire = ({ accent, vertical = false }: { accent: string; vertical?: boolean }) => (
  <div
    className={vertical ? 'wire-v' : 'wire-h'}
    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
  />
)

export default function PredictorDiagram({ meta }: { meta: PredictorMeta }) {
  const a = meta.accent
  const bits = ['1', '0', '1', '1', '0', '1']

  if (meta.diagram === 'flipflop') {
    return (
      <div className="diagram-wrap">
        <Node label="PC" accent={a} />
        <Wire accent={a} />
        <div className="flipflop" style={{ borderColor: `${a}aa` }}>
          <span className="ff-q" style={{ background: a }}>Q</span>
          <span className="ff-d">D</span>
        </div>
        <Wire accent={a} />
        <Node label="T / NT" accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'counter') {
    return (
      <div className="diagram-wrap">
        {['SNT', 'WNT', 'WT', 'ST'].map((s, i) => (
          <div key={s} className="counter-state" style={{ animationDelay: `${i * 260}ms`, borderColor: `${a}88` }}>
            <span>{s}</span>
            <i style={{ background: a }} />
          </div>
        ))}
      </div>
    )
  }

  if (meta.diagram === 'table') {
    return (
      <div className="diagram-wrap table-wrap">
        <Node label="PC low" accent={a} />
        <Wire accent={a} />
        <div className="mini-table">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={i === 5 ? 'cell-hot' : ''} style={i === 5 ? { borderColor: a, boxShadow: `0 0 18px ${a}66` } : undefined}>
              {i === 5 ? '11' : '01'}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (meta.diagram === 'local-history') {
    return (
      <div className="diagram-col">
        <div className="diagram-wrap">
          <Node label="Branch A" accent={a} hot />
          <div className="shift-reg">{bits.map((v, i) => bit(v, a, i * 90))}</div>
        </div>
        <div className="diagram-wrap">
          <Node label="Branch B" accent={a} />
          <div className="shift-reg dim">{['0', '1', '0', '0', '1', '0'].map((v, i) => bit(v, a, i * 90))}</div>
        </div>
      </div>
    )
  }

  if (meta.diagram === 'global-history') {
    return (
      <div className="diagram-col">
        <div className="shift-reg global">{['1', '1', '0', '1', '0', '0', '1', '1'].map((v, i) => bit(v, a, i * 70))}</div>
        <div className="diagram-wrap">
          <Node label="GHR" accent={a} hot />
          <Wire accent={a} />
          <Node label="shared PHT" accent={a} />
        </div>
      </div>
    )
  }

  if (meta.diagram === 'xor') {
    return (
      <div className="diagram-wrap">
        <div className="diagram-col tight">
          <Node label="PC" accent={a} />
          <Node label="GHR" accent={a} />
        </div>
        <div className="xor-gate" style={{ borderColor: `${a}aa`, color: a }}>⊕</div>
        <Node label="index" accent={a} hot />
      </div>
    )
  }

  if (meta.diagram === 'tournament') {
    return (
      <div className="diagram-col">
        <div className="diagram-wrap">
          <Node label="Local" accent={a} />
          <Node label="Global" accent={a} />
        </div>
        <div className="diagram-wrap">
          <Wire accent={a} />
          <div className="chooser" style={{ borderColor: `${a}aa` }}>Chooser</div>
          <Wire accent={a} />
          <Node label="predict" accent={a} hot />
        </div>
      </div>
    )
  }

  if (meta.diagram === 'tage') {
    return (
      <div className="diagram-col">
        {[2, 4, 8].map((n, i) => (
          <div key={n} className="tage-row" style={{ animationDelay: `${i * 180}ms` }}>
            <span style={{ color: a }}>H{n}</span>
            <div className="mini-table grow">
              {Array.from({ length: 6 }, (_, j) => (
                <span key={j} className={j === i + 1 ? 'cell-hot' : ''} style={j === i + 1 ? { borderColor: a } : undefined}>
                  tag
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (meta.diagram === 'perceptron') {
    return (
      <div className="diagram-wrap">
        <div className="diagram-col tight">
          {['h0', 'h1', 'h2'].map((h, i) => (
            <span key={h} className="weight-chip" style={{ borderColor: `${a}77`, animationDelay: `${i * 140}ms` }}>
              {h}×w{i}
            </span>
          ))}
        </div>
        <div className="sum-node" style={{ borderColor: `${a}aa`, color: a }}>Σ</div>
        <Node label="sign(y)" accent={a} hot />
      </div>
    )
  }

  return (
    <div className="diagram-wrap">
      <div className="diagram-col tight">
        <Node label="BTB" accent={a} />
        <Node label="ITTAGE" accent={a} />
      </div>
      <div className="ras-stack" style={{ borderColor: `${a}88` }}>
        {['ret', 'call', 'call'].map((x, i) => (
          <span key={`${x}-${i}`} style={{ animationDelay: `${i * 160}ms` }}>{x}</span>
        ))}
      </div>
      <Node label="target PC" accent={a} hot />
    </div>
  )
}
