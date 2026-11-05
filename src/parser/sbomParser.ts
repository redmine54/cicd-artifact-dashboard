import type { SbomComponent } from '../types/security';
import { licenseOf } from './licenseParser';

/** CycloneDX JSON */
export function parseSbom(j: any): SbomComponent[] {
  return (j?.components ?? []).map((x: any) => ({
    component: x.name ?? '',
    version: x.version ?? '',
    type: x.type ?? '',
    supplier: x.supplier?.name ?? x.publisher ?? '',
    purl: x.purl ?? '',
    license: x.licenses ? licenseOf(x) : '',
  }));
}
