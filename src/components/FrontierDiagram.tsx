import type { FrontierWork } from '@/data/frontier'

const Node = ({ label, accent, hot = false }: { label: string; accent: string; hot?: boolean }) => (
  <div
    className={`diagram-node ${hot ? 'node-hot' : ''}`}
    style={{ borderColor: `${accent}88`, boxShadow: hot ? `0 0 24px ${accent}55` : undefined }}
  >
    {label}
  </div>
)

const Wire = ({ accent }: { accent: string }) => (
  <div className="wire-h" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
)

export default function FrontierDiagram({ work }: { work: FrontierWork }) {
  const a = work.accent

  if (work.id === 'tage-sc-l') {
    return (
      <div className="diagram-wrap" data-frontier-diagram={work.id}>
        <div className="diagram-col tight">
          <Node label="TAGE" accent={a} hot />
          <Node label="SC" accent={a} />
        </div>
        <Wire accent={a} />
        <div className="loop-dial" style={{ borderColor: `${a}aa` }}>
          <i style={{ background: a }} />
        </div>
        <Node label="T/NT" accent={a} hot />
      </div>
    )
  }

  if (work.id === 'imli') {
    return (
      <div className="diagram-wrap" data-frontier-diagram={work.id}>
        <div className="loop-dial big" style={{ borderColor: `${a}aa` }}>
          <span style={{ color: a }}>i</span>
          <i style={{ background: a }} />
        </div>
        <Wire accent={a} />
        <div className="shift-reg">
          {['0', '1', '1', '0', '1'].map((v, idx) => (
            <span key={idx} className="bit-cell" style={{ borderColor: `${a}66`, animationDelay: `${idx * 90}ms` }}>{v}</span>
          ))}
        </div>
      </div>
    )
  }

  if (work.id === 'branchnet') {
    return (
      <div className="diagram-wrap" data-frontier-diagram={work.id}>
        {[3, 5, 4, 2].map((n, layer) => (
          <div key={layer} className="conv-col" style={{ animationDelay: `${layer * 160}ms` }}>
            {Array.from({ length: n }, (_, i) => (
              <span key={i} style={{ borderColor: `${a}77`, background: layer === 3 ? `${a}33` : undefined }} />
            ))}
          </div>
        ))}
        <Node label="H2P" accent={a} hot />
      </div>
    )
  }

  if (work.id === 'realistic-tage-sc') {
    return (
      <div className="diagram-col" data-frontier-diagram={work.id}>
        <div className="diagram-wrap">
          {['L0', 'L1', 'L2'].map((x, i) => (
            <span key={x} className="weight-chip" style={{ borderColor: `${a}77`, animationDelay: `${i * 120}ms` }}>{x}</span>
          ))}
        </div>
        <div className="share-link" style={{ background: `linear-gradient(90deg, transparent, ${a}, transparent)` }} />
        <div className="diagram-wrap">
          <Node label="物理表共享" accent={a} hot />
          <Node label="低延迟" accent={a} />
        </div>
      </div>
    )
  }

  if (work.id === 'bullseye') {
    return (
      <div className="diagram-wrap" data-frontier-diagram={work.id}>
        <div className="target" style={{ borderColor: `${a}aa` }}>
          <span style={{ borderColor: `${a}99` }} />
          <i style={{ background: a }} />
        </div>
        <div className="diagram-col tight">
          <Node label="HIT" accent={a} />
          <Node label="perceptron" accent={a} hot />
        </div>
      </div>
    )
  }

  return (
    <div className="diagram-wrap" data-frontier-diagram={work.id}>
      <div className="diagram-col tight">
        <span className="value-chip" style={{ borderColor: `${a}77` }}>load addr</span>
        <span className="value-chip" style={{ borderColor: `${a}77`, animationDelay: '160ms' }}>load value</span>
      </div>
      <Wire accent={a} />
      <Node label="ctx" accent={a} />
      <Wire accent={a} />
      <Node label="TAGE-SC-L" accent={a} hot />
    </div>
  )
}
