import type { E2ETest } from '../types/security';

/** JUnit XML(単体テスト) */
export function parseJunit(xml: string): E2ETest[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return Array.from(doc.querySelectorAll('testcase')).map((c) => {
    const f = c.querySelector('failure, error');
    return {
      kind: 'Unit' as const,
      feature: c.getAttribute('classname') ?? '',
      name: c.getAttribute('name') ?? '',
      status: f ? ('FAIL' as const) : c.querySelector('skipped') ? ('SKIP' as const) : ('PASS' as const),
      duration: parseFloat(c.getAttribute('time') ?? '0') || 0,
      error: f?.textContent ?? '',
      attachments: [],
    };
  });
}
