import { useState } from 'react';
import type { PipelineReport } from '../types/security';
import { Chip } from './DataTable';

const hit = (o: object, q: string) => Object.values(o).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));

export function SearchTab({ r }: { r: PipelineReport }) {
  const [text, setText] = useState('');
  const q = text.toLowerCase();
  const logs: string[] = [];
  if (q) for (const l of r.logs) l.text.split('\n').forEach((ln, i) => { if (logs.length < 15 && ln.toLowerCase().includes(q)) logs.push(`${l.path}:${i + 1}　${ln.slice(0, 160)}`); });
  const comps = q ? r.components.filter((x) => hit(x, q)).slice(0, 15) : [];
  const cves = q ? r.cves.filter((x) => hit(x, q)).slice(0, 15) : [];
  const lics = q ? r.licenses.filter((x) => hit(x, q)).slice(0, 15) : [];
  const sboms = q ? r.sboms.filter((x) => hit(x, q)).slice(0, 15) : [];
  const none = q && !comps.length && !cves.length && !lics.length && !sboms.length && !logs.length;
  return (
    <>
      <div className="bar"><input type="search" placeholder="例: log4j" value={text} onChange={(e) => setText(e.target.value)} autoFocus /></div>
      {comps.length > 0 && <><h3>Component</h3>{comps.map((x, i) => <div key={i}>{x.component} {x.version}</div>)}</>}
      {cves.length > 0 && <><h3>CVE</h3>{cves.map((x, i) => <div key={i}>{x.cve} <Chip v={x.severity} /> {x.component}</div>)}</>}
      {lics.length > 0 && <><h3>License</h3>{lics.map((x, i) => <div key={i}>{x.component}: {x.license}</div>)}</>}
      {sboms.length > 0 && <><h3>SBOM</h3>{sboms.map((x, i) => <div key={i}>{x.purl || x.component}</div>)}</>}
      {logs.length > 0 && <><h3>Logs</h3>{logs.map((x, i) => <div key={i}>{x}</div>)}</>}
      {none && <p className="mu">該当なし</p>}
    </>
  );
}
