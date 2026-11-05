import JSZip from 'jszip';
import type { ComponentInfo, E2ETest, JobInfo, LogEntry, PipelineReport } from '../types/security';
import { parseTrivy } from './trivyParser';
import { parseLicense } from './licenseParser';
import { parseSbom } from './sbomParser';
import { parseSarif } from './sarifParser';
import { parseGitleaks } from './gitleaksParser';
import { parsePlaywright } from './playwrightParser';
import { parseJunit } from './junitParser';

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)}MB` : b > 1e3 ? `${(b / 1e3).toFixed(0)}KB` : b ? `${b}B` : '-');

/** Artifact ZIPをブラウザ内で解凍し、PipelineReportを組み立てる */
export async function parseZip(file: Blob): Promise<{ report: PipelineReport; zip: JSZip }> {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const warnings: string[] = [];
  const text = (n: string) => zip.file(n)!.async('string');
  const jsons = async (re: RegExp) => {
    const out: any[] = [];
    for (const n of names.filter((x) => re.test(x))) {
      try { out.push(JSON.parse(await text(n))); } catch { warnings.push(`${n} をJSONとして読めませんでした`); }
    }
    return out;
  };

  const cves = (await jsons(/trivy\.json$/)).flatMap(parseTrivy);
  const licenses = (await jsons(/license[^/]*\.json$/)).flatMap(parseLicense);
  const sboms = (await jsons(/sbom[^/]*\.json$/)).flatMap(parseSbom);
  const sasts = (await jsons(/\.sarif$/)).flatMap(parseSarif);
  const secrets = (await jsons(/gitleaks[^/]*\.json$/)).flatMap(parseGitleaks);
  const e2e: E2ETest[] = (await jsons(/playwright[^/]*\.json$/)).flatMap(parsePlaywright);
  for (const n of names.filter((x) => /junit[^/]*\.xml$/.test(x))) e2e.push(...parseJunit(await text(n)));

  let meta: Record<string, any> = {};
  if (names.includes('metadata.json')) {
    try { meta = JSON.parse(await text('metadata.json')); } catch { warnings.push('metadata.json を読めませんでした'); }
  }

  const logs: LogEntry[] = [];
  for (const n of names.filter((x) => /job\.log$/.test(x))) logs.push({ path: n, text: await text(n) });

  const jobs: JobInfo[] = [...new Set(logs.map((l) => l.path.split('/').slice(-2)[0]))].map((d) => {
    const m = (Array.isArray(meta.jobs) ? meta.jobs : []).find((x: any) => String(x.name).toLowerCase() === d.toLowerCase()) ?? {};
    const log = logs.find((l) => l.path.split('/').slice(-2)[0] === d)?.text ?? '';
    const size = names.filter((n) => n.split('/').includes(d)).reduce((a, n) => a + ((zip.files[n] as any)._data?.uncompressedSize ?? 0), 0);
    const testFailed = e2e.some((t) => t.status === 'FAIL' && ((d === 'e2e' && t.kind === 'E2E') || (/unit/.test(d) && t.kind === 'Unit')));
    return {
      job: d,
      status: m.status ?? (testFailed || /Job failed|ERROR: Job/.test(log) ? 'Failed' : 'Success'),
      duration: m.duration ?? '-',
      size: fmtSize(size),
      errors: log.split('\n').filter((l) => /ERROR|WARN|FAIL/i.test(l)).slice(0, 50).join('\n'),
    };
  });

  const map = new Map<string, ComponentInfo>();
  const get = (n: string, v: string) => {
    const k = `${n}@${v}`;
    if (!map.has(k)) map.set(k, { component: n, version: v, license: '', critical: 0, high: 0, sast: 0, secret: 0, fixed: '' });
    return map.get(k)!;
  };
  sboms.forEach((s) => { const c = get(s.component, s.version); c.license ||= s.license; });
  licenses.forEach((l) => { get(l.component, l.version).license = l.license; });
  cves.forEach((v) => {
    const c = get(v.component, v.current);
    if (v.severity === 'Critical') c.critical++;
    if (v.severity === 'High') c.high++;
    if (!c.fixed && v.fixed !== '-') c.fixed = v.fixed;
  });
  const components = [...map.values()].filter((c) => c.component);
  components.forEach((c) => {
    c.sast = sasts.filter((s) => s.file.includes(c.component)).length;
    c.secret = secrets.filter((s) => s.file.includes(c.component)).length;
  });

  const report: PipelineReport = {
    summary: {
      criticalCve: cves.filter((v) => v.severity === 'Critical').length,
      highCve: cves.filter((v) => v.severity === 'High').length,
      copyleft: licenses.filter((l) => l.category === 'Copyleft').length,
      sastHigh: sasts.filter((s) => s.severity === 'High').length,
      secrets: secrets.length,
      failedTests: e2e.filter((t) => t.status === 'FAIL').length,
    },
    jobs, components, cves, licenses, sboms, sasts, secrets, e2e, logs, warnings, meta,
  };
  return { report, zip };
}
