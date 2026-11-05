import type { SastFinding, Severity } from '../types/security';

const LEVEL: Record<string, Severity> = { error: 'High', warning: 'Medium', note: 'Low' };

/** SARIF 2.1.0 */
export function parseSarif(j: any): SastFinding[] {
  const out: SastFinding[] = [];
  for (const run of j?.runs ?? []) {
    const rules: Record<string, any> = {};
    for (const q of run.tool?.driver?.rules ?? []) rules[q.id] = q;
    for (const x of run.results ?? []) {
      const q = rules[x.ruleId] ?? {};
      const loc = x.locations?.[0]?.physicalLocation;
      out.push({
        file: loc?.artifactLocation?.uri ?? '',
        line: loc?.region?.startLine ?? '',
        rule: q.name ?? x.ruleId ?? '',
        severity: LEVEL[x.level] ?? 'Medium',
        cwe: (q.properties?.tags ?? []).find((t: string) => /CWE/.test(t)) ?? '',
        message: x.message?.text ?? '',
        snippet: loc?.region?.snippet?.text ?? '',
      });
    }
  }
  return out;
}
