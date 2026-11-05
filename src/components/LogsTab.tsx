import { useState } from 'react';
import type { PipelineReport } from '../types/security';

const isErr = (l: string) => /ERROR|FATAL|FAIL/i.test(l);

export function LogsTab({ r }: { r: PipelineReport }) {
  const [q, setQ] = useState('');
  const [lvl, setLvl] = useState('');
  const [sel, setSel] = useState('');
  const key = q.toLowerCase();
  const cur = r.logs.find((l) => l.path === sel) ?? r.logs[0];
  const count = (t: string) => (key ? t.split('\n').filter((l) => l.toLowerCase().includes(key)).length : '');
  const lines = cur
    ? cur.text.split('\n').map((l, i) => [l, i + 1] as const)
        .filter(([l]) => (!key || l.toLowerCase().includes(key)) && (!lvl || (lvl === 'e' ? isErr(l) : isErr(l) || /WARN/i.test(l))))
        .slice(0, 3000)
    : [];
  return (
    <>
      <div className="bar">
        <input type="search" placeholder="Keyword（全ログを検索）" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={lvl} onChange={(e) => setLvl(e.target.value)} aria-label="レベル">
          <option value="">全レベル</option><option value="e">ERRORのみ</option><option value="w">WARN以上</option>
        </select>
      </div>
      <div className="logs">
        <div className="lf">
          {r.logs.map((l) => (
            <button key={l.path} className={l.path === cur?.path ? 'b' : 'g'} onClick={() => setSel(l.path)}>
              {l.path} <small>{count(l.text)}</small>
            </button>
          ))}
          {r.logs.length === 0 && <span className="mu">job.logがありません</span>}
        </div>
        <div className="wrap lg">
          {lines.map(([l, i]) => (
            <div key={i} className={`ln ${isErr(l) ? 'e' : /WARN/i.test(l) ? 'w' : ''}`}><i>{i}</i><pre>{l}</pre></div>
          ))}
        </div>
      </div>
    </>
  );
}
