import type { LicenseInfo } from '../types/security';

/** CycloneDX形式・単純な文字列形式のどちらのライセンス表記も文字列にする */
export function licenseOf(x: any): string {
  let l = x?.license ?? x?.licenses;
  if (Array.isArray(l)) {
    l = l.map((e: any) => (typeof e === 'string' ? e : e.license?.id ?? e.license?.name ?? e.id ?? e.name ?? e.expression)).join(', ');
  } else if (l && typeof l === 'object') {
    l = l.id ?? l.name;
  }
  return l || 'Unknown';
}

export const categoryOf = (l: string) =>
  /LGPL|MPL|EPL/.test(l) ? 'Weak Copyleft' : /GPL/.test(l) ? 'Copyleft' : l === 'Unknown' ? 'Unknown' : 'Permissive';

/** 配列、または components / licenses / dependencies を持つJSON */
export function parseLicense(j: any): LicenseInfo[] {
  const list: any[] = Array.isArray(j) ? j : j?.components ?? j?.licenses ?? j?.dependencies ?? [];
  return list.map((x) => {
    const license = licenseOf(x);
    const category = categoryOf(license);
    return {
      component: x.name ?? x.component ?? '',
      version: x.version ?? '',
      license,
      category,
      approved: category === 'Copyleft' || category === 'Unknown' ? 'No' : 'Yes',
    };
  });
}
