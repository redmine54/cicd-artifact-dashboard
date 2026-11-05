import type { Severity, Vulnerability } from '../types/security';

export const toSeverity = (s?: string): Severity => {
  const v = s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : 'Unknown';
  return (['Critical', 'High', 'Medium', 'Low'].includes(v) ? v : 'Unknown') as Severity;
};

/** Trivy JSON (Results[].Vulnerabilities[]) */
export function parseTrivy(j: any): Vulnerability[] {
  const out: Vulnerability[] = [];
  for (const r of j?.Results ?? []) {
    for (const v of r.Vulnerabilities ?? []) {
      out.push({
        component: v.PkgName ?? '',
        current: v.InstalledVersion ?? '',
        fixed: v.FixedVersion ?? '-',
        cve: v.VulnerabilityID ?? '',
        severity: toSeverity(v.Severity),
        cvss: Object.values<any>(v.CVSS ?? {}).map((c) => c.V3Score ?? c.V2Score).find(Boolean) ?? '',
        published: String(v.PublishedDate ?? '').slice(0, 10),
        title: v.Title ?? '',
        description: v.Description ?? '',
        cwe: (v.CweIDs ?? []).join(', '),
        url: v.PrimaryURL ?? '',
      });
    }
  }
  return out;
}
