import type { SecretFinding } from '../types/security';

/**
 * Gitleaks JSON。秘密値(Secret / Match)は意図的に読み取らず、常にマスクして保持する。
 */
export function parseGitleaks(j: any): SecretFinding[] {
  if (!Array.isArray(j)) return [];
  return j.map((x) => ({
    file: x.File ?? '',
    line: x.StartLine ?? '',
    type: x.RuleID ?? x.Description ?? '',
    status: 'DETECTED' as const,
    value: '********************',
  }));
}
