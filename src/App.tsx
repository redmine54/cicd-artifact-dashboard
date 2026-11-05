import { useState } from 'react';
import type JSZip from 'jszip';
import type { PipelineReport } from './types/security';
import { parseZip } from './parser/zipParser';
import { createSampleZip } from './sample';
import { DropZone } from './components/DropZone';
import { SummaryTab } from './components/SummaryTab';
import { ComponentsTab, CveTab, JobsTab, LicenseTab, SastTab, SbomTab, SecretTab } from './components/TableTabs';
import { E2ETab } from './components/E2ETab';
import { LogsTab } from './components/LogsTab';
import { SearchTab } from './components/SearchTab';

const TABS = ['Summary', 'Jobs', 'Components', 'CVE', 'License', 'SBOM', 'SAST', 'Secret', 'E2E', 'Logs', 'Search'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [data, setData] = useState<{ report: PipelineReport; zip: JSZip; name: string } | null>(null);
  const [tab, setTab] = useState<Tab>('Summary');
  const [error, setError] = useState('');

  const load = async (file: File) => {
    try {
      setError('');
      setData({ ...(await parseZip(file)), name: file.name });
      setTab('Summary');
    } catch (e) {
      setError(`ZIPを読み込めませんでした: ${(e as Error).message}`);
    }
  };

  const r = data?.report;
  return (
    <>
      <header>
        <h1>CI/CD Artifact Dashboard</h1>
        {data && <div className="bar"><span className="mu">{data.name}</span><button className="g" onClick={() => setData(null)}>別のZIPを読み込む</button></div>}
      </header>
      <main>
        {error && <div className="warn">{error}</div>}
        {!r || !data ? (
          <DropZone onFile={load} onSample={async () => load(await createSampleZip())} />
        ) : (
          <>
            <nav>{TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</nav>
            {tab === 'Summary' && <SummaryTab r={r} />}
            {tab === 'Jobs' && <JobsTab r={r} />}
            {tab === 'Components' && <ComponentsTab r={r} />}
            {tab === 'CVE' && <CveTab r={r} />}
            {tab === 'License' && <LicenseTab r={r} />}
            {tab === 'SBOM' && <SbomTab r={r} />}
            {tab === 'SAST' && <SastTab r={r} />}
            {tab === 'Secret' && <SecretTab r={r} />}
            {tab === 'E2E' && <E2ETab r={r} zip={data.zip} />}
            {tab === 'Logs' && <LogsTab r={r} />}
            {tab === 'Search' && <SearchTab r={r} />}
          </>
        )}
      </main>
    </>
  );
}
