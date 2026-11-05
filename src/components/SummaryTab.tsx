import type { PipelineReport } from '../types/security';
import { Chip } from './DataTable';

export function SummaryTab({ r }: { r: PipelineReport }) {
  const s = r.summary;
  const rows: [string, number, 'NG' | 'WARN' | 'OK'][] = [
    ['Critical CVE', s.criticalCve, s.criticalCve ? 'NG' : 'OK'],
    ['High CVE', s.highCve, s.highCve ? 'NG' : 'OK'],
    ['Copyleft License', s.copyleft, s.copyleft ? 'WARN' : 'OK'],
    ['SAST High', s.sastHigh, s.sastHigh ? 'NG' : 'OK'],
    ['Secret', s.secrets, s.secrets ? 'NG' : 'OK'],
    ['Failed Test', s.failedTests, s.failedTests ? 'NG' : 'OK'],
  ];
  const e2e = r.e2e.filter((t) => t.kind === 'E2E');
  const n = (st: string) => e2e.filter((t) => t.status === st).length;
  return (
    <>
      {r.warnings.length > 0 && <div className="warn">{r.warnings.map((w) => <div key={w}>{w}</div>)}</div>}
      <div className="wrap">
        <table>
          <thead><tr><th>Category</th><th className="n">Count</th><th>Status</th></tr></thead>
          <tbody>{rows.map(([c, k, st]) => <tr key={c}><td>{c}</td><td className="n">{k}</td><td><Chip v={st} /></td></tr>)}</tbody>
        </table>
      </div>
      <h3>E2E</h3>
      <p>Total {e2e.length} / Pass {n('PASS')} / Fail {n('FAIL')} / Skip {n('SKIP')}　<span className="mu">Unit: {r.e2e.length - e2e.length}件</span></p>
      {(r.meta.pipeline || r.meta.commit) && <><h3>Pipeline</h3><pre>{JSON.stringify({ ...r.meta, jobs: undefined }, null, 1)}</pre></>}
    </>
  );
}
