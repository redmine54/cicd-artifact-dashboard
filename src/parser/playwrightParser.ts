import type { E2ETest } from '../types/security';

function walk(s: any, feature: string, out: E2ETest[]) {
  for (const sp of s.specs ?? []) {
    const t = sp.tests?.[0];
    const res = t?.results?.[0] ?? {};
    const skipped = t?.status === 'skipped';
    out.push({
      kind: 'E2E',
      feature: feature || s.title || '',
      name: sp.title ?? '',
      status: skipped ? 'SKIP' : sp.ok ? 'PASS' : 'FAIL',
      duration: (res.duration ?? 0) / 1000,
      error: String(res.error?.message ?? '').replace(/\x1b\[[0-9;]*m/g, ''),
      attachments: (res.attachments ?? []).map((a: any) => ({ name: a.name ?? '', path: a.path ?? '', contentType: a.contentType ?? '' })),
    });
  }
  for (const c of s.suites ?? []) walk(c, feature || s.title, out);
}

/** Playwright JSON reporter */
export function parsePlaywright(j: any): E2ETest[] {
  const out: E2ETest[] = [];
  for (const s of j?.suites ?? []) walk(s, '', out);
  return out;
}
