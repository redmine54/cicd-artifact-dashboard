import { useEffect, useState } from 'react';
import type JSZip from 'jszip';
import type { Attachment, E2ETest, PipelineReport } from '../types/security';
import { Col, DataTable } from './DataTable';

const cols: Col<E2ETest>[] = [
  { key: 'kind', label: 'Kind' }, { key: 'feature', label: 'Feature' }, { key: 'name', label: 'Test Case' },
  { key: 'status', label: 'Status', chip: true }, { key: 'duration', label: 'Duration(s)', numeric: true },
];

/** ZIP内のスクリーンショット・動画をファイル名で探して表示する */
function Media({ zip, att }: { zip: JSZip; att: Attachment }) {
  const [src, setSrc] = useState<string>();
  const base = (att.path || att.name).split(/[\\/]/).pop() ?? '';
  const entry = Object.keys(zip.files).find((k) => k === base || k.endsWith('/' + base));
  useEffect(() => {
    if (!entry) return;
    let url: string | undefined;
    let dead = false;
    zip.file(entry)!.async('blob').then((b) => { if (!dead) { url = URL.createObjectURL(b); setSrc(url); } });
    return () => { dead = true; if (url) URL.revokeObjectURL(url); };
  }, [zip, entry]);

  if (!entry) return <div className="mu">ZIP内に見つかりません: {base}</div>;
  if (/image/.test(att.contentType)) return src ? <img src={src} alt={att.name} /> : null;
  if (/video/.test(att.contentType)) return src ? <video src={src} controls /> : null;
  return <div className="mu">{att.name} ({att.path})</div>;
}

export function E2ETab({ r, zip }: { r: PipelineReport; zip: JSZip }) {
  return (
    <DataTable rows={r.e2e} cols={cols} placeholder="絞り込み（行クリックで詳細・スクリーンショット）"
      detail={(t) => (t.error || t.attachments.length ? (
        <>
          {t.error && <pre>{t.error}</pre>}
          {t.attachments.map((a, i) => <Media key={i} zip={zip} att={a} />)}
        </>
      ) : null)} />
  );
}
