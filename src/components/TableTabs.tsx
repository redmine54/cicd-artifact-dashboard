import type { ComponentInfo, JobInfo, LicenseInfo, PipelineReport, SastFinding, SbomComponent, SecretFinding, Vulnerability } from '../types/security';
import { Col, DataTable } from './DataTable';

const jobCols: Col<JobInfo>[] = [{ key: 'job', label: 'Job' }, { key: 'status', label: 'Status', chip: true }, { key: 'duration', label: 'Duration' }, { key: 'size', label: 'Artifact Size' }];
const compCols: Col<ComponentInfo>[] = [
  { key: 'component', label: 'Component' }, { key: 'version', label: 'Version' }, { key: 'license', label: 'License' },
  { key: 'critical', label: 'Critical', numeric: true }, { key: 'high', label: 'High', numeric: true },
  { key: 'sast', label: 'SAST', numeric: true }, { key: 'secret', label: 'Secret', numeric: true }, { key: 'fixed', label: 'Fixed Version' },
];
const cveCols: Col<Vulnerability>[] = [
  { key: 'component', label: 'Component' }, { key: 'current', label: 'Current' }, { key: 'fixed', label: 'Fixed' }, { key: 'cve', label: 'CVE' },
  { key: 'severity', label: 'Severity', chip: true }, { key: 'cvss', label: 'CVSS', numeric: true }, { key: 'published', label: 'Published' },
];
const licCols: Col<LicenseInfo>[] = [
  { key: 'component', label: 'Component' }, { key: 'version', label: 'Version' }, { key: 'license', label: 'License' },
  { key: 'category', label: 'Category', chip: true }, { key: 'approved', label: 'Approved', chip: true },
];
const sbomCols: Col<SbomComponent>[] = [
  { key: 'component', label: 'Component' }, { key: 'version', label: 'Version' }, { key: 'type', label: 'Type' },
  { key: 'supplier', label: 'Supplier' }, { key: 'purl', label: 'PURL' },
];
const sastCols: Col<SastFinding>[] = [
  { key: 'file', label: 'File' }, { key: 'line', label: 'Line', numeric: true }, { key: 'rule', label: 'Rule' },
  { key: 'severity', label: 'Severity', chip: true }, { key: 'cwe', label: 'CWE' },
];
const secretCols: Col<SecretFinding>[] = [
  { key: 'file', label: 'File' }, { key: 'line', label: 'Line', numeric: true }, { key: 'type', label: 'Secret Type' },
  { key: 'status', label: 'Status', chip: true }, { key: 'value', label: 'Value' },
];

type P = { r: PipelineReport };
export const JobsTab = ({ r }: P) => <DataTable rows={r.jobs} cols={jobCols} detail={(j) => <pre>{j.errors || '(ERROR / WARNINGの行はありません)'}</pre>} />;
export const ComponentsTab = ({ r }: P) => <DataTable rows={r.components} cols={compCols} />;
export const CveTab = ({ r }: P) => (
  <DataTable rows={r.cves} cols={cveCols} detail={(v) => (
    <><b>{v.title}</b><p>{v.description}</p><p className="mu">{v.cwe} {v.url}</p></>
  )} />
);
export const LicenseTab = ({ r }: P) => <DataTable rows={r.licenses} cols={licCols} />;
export const SbomTab = ({ r }: P) => <DataTable rows={r.sboms} cols={sbomCols} />;
export const SastTab = ({ r }: P) => (
  <DataTable rows={r.sasts} cols={sastCols} detail={(s) => <><p>{s.file}:{s.line}</p><p>{s.message}</p>{s.snippet && <pre>{s.snippet}</pre>}</>} />
);
export const SecretTab = ({ r }: P) => (
  <>
    <p className="mu">秘密値は読み取らず、常にマスク表示します。</p>
    <DataTable rows={r.secrets} cols={secretCols} />
  </>
);
