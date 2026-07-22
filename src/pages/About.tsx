import { Dna, Brain } from 'lucide-react'

const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-14">
    <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
      <span className="h-1 w-5 rounded-full bg-brand-500 inline-block" />
      {title}
    </h2>
    {children}
  </section>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[14px] text-gray-600 leading-[1.75] mb-3">{children}</p>
)

const SourceTable = () => (
  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-200">
          {['Database', 'Sites', 'Species', 'Notes'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {[
          ['PhosphoSitePlus', '~250,000', 'Multi-species', 'Curated, literature-based'],
          ['Phospho.ELM',     '~42,000',  'Multi-species', 'Experimental, MS/MS + literature'],
          ['PTMS Dataset',    '~190,672', 'Multi-species', 'High-throughput MS/MS'],
          ['DbPAF / SysPTM',  'Included', 'Multi-species', 'Aggregated via PMID overlap'],
        ].map(row => (
          <tr key={row[0]} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 font-semibold text-gray-800">{row[0]}</td>
            <td className="px-4 py-3 text-gray-600 font-mono text-xs">{row[1]}</td>
            <td className="px-4 py-3 text-gray-500">{row[2]}</td>
            <td className="px-4 py-3 text-gray-500">{row[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const About = () => (
  <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

    {/* Page header */}
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm">
          <Dna className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">About DeepPhos</h1>
          <p className="text-sm text-gray-400">Phosphorylation Meta-Database</p>
        </div>
      </div>
      <p className="text-gray-500 text-[15px] leading-relaxed max-w-2xl mt-3">
        A unified, consensus-scored resource for serine, threonine and tyrosine phosphorylation,
        integrating five major databases with ML-guided novel site rescue.
      </p>
    </div>

    <Section title="Background">
      <P>
        Phosphorylation is the most prevalent post-translational modification in eukaryotic
        signalling. Despite the availability of several specialist databases
        (PhosphoSitePlus, Phospho.ELM, HPRD, DbPAF, SysPTM), each resource captures a
        different subset of the experimentally verified landscape. DeepPhos integrates these
        sources into a single, confidence-scored database.
      </P>
      <P>
        A key challenge is that no single raw file captures all sources simultaneously.
        DeepPhos documents this as a provenance limitation: DAS=0 sites are those that appear
        only in one aggregated file and cannot be unambiguously attributed to a single
        upstream database.
      </P>
    </Section>

    <Section title="Pipeline Overview">
      <P>
        The schematic below illustrates the full DeepPhos data integration and scoring
        pipeline &mdash; from raw source databases through consensus scoring, evidence tiering,
        and ML-guided novel site rescue.
      </P>
      <div className="mt-5 card overflow-hidden">
        <img
          src="/pipeline_flowchart.png"
          alt="DeepPhos pipeline flowchart"
          className="w-full"
          style={{ maxHeight: 640, objectFit: 'contain' }}
        />
      </div>
    </Section>

    <Section title="Data Sources">
      <P>
        The following primary databases were integrated into DeepPhos:
      </P>
      <div className="card overflow-hidden">
        <SourceTable />
      </div>
    </Section>

    <Section title="Scoring System">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-2">Database Agreement Score (DAS)</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Counts how many distinct source databases report a given (UniProt ID,
            residue type, position) triplet.
          </p>
          <p className="mt-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg inline-block">
            Range: 0 &ndash; 3
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-2">Publication Depth Score (PDS)</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Number of unique PubMed IDs that report a given site, reflecting
            independent experimental validation.
          </p>
          <p className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
            Range: 0 &ndash; n
          </p>
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h3 className="font-bold text-gray-800 text-sm mb-2">Confidence Score</h3>
        <code className="block bg-gray-900 text-brand-300 rounded-xl px-4 py-3 text-sm font-mono mb-3">
          confidence = DAS &times; log(1 + PDS)
        </code>
        <p className="text-[13px] text-gray-500">
          A composite metric combining database agreement and publication depth.
        </p>
      </div>

      <div className="card p-5 mt-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">Evidence Tiers</h3>
        <div className="space-y-2">
          {[
            { tier: 'GOLD',   rule: 'DAS \u2265 2 OR PDS \u2265 5',    bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500', text: 'text-amber-800' },
            { tier: 'SILVER', rule: 'DAS \u2265 1 AND PDS \u2265 2',   bg: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-400',  text: 'text-gray-700' },
            { tier: 'BRONZE', rule: 'All remaining sites',             bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500', text: 'text-orange-800' },
          ].map(t => (
            <div key={t.tier} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${t.bg}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${t.dot} shrink-0`} />
              <span className={`text-sm font-bold ${t.text} w-16`}>{t.tier}</span>
              <span className="text-[13px] text-gray-600">{t.rule}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>

    <Section title="ML Prediction">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">PhosConsensus-Predict</h3>
            <P>
              A multi-layer perceptron trained on ESM-2 (650M) residue
              embeddings. Only serine, threonine and tyrosine positions are embedded, reducing
              storage by approximately 20x compared to full-sequence embeddings.
            </P>
            <P>
              Training uses evidence-weighted binary cross-entropy loss to handle class imbalance,
              GroupKFold cross-validation at the protein level (no data leakage), and
              CosineAnnealingLR scheduling. The model is exported as ONNX for production serving.
            </P>
          </div>
        </div>
      </div>
    </Section>

  </div>
)
