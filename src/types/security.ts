export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown';
export type TestStatus = 'PASS' | 'FAIL' | 'SKIP';

export interface Summary { criticalCve: number; highCve: number; copyleft: number; sastHigh: number; secrets: number; failedTests: number }
export interface JobInfo { job: string; status: string; duration: string; size: string; errors: string }
export interface ComponentInfo { component: string; version: string; license: string; critical: number; high: number; sast: number; secret: number; fixed: string }
export interface Vulnerability { component: string; current: string; fixed: string; cve: string; severity: Severity; cvss: number | ''; published: string; title: string; description: string; cwe: string; url: string }
export interface LicenseInfo { component: string; version: string; license: string; category: string; approved: 'Yes' | 'No' }
export interface SbomComponent { component: string; version: string; type: string; supplier: string; purl: string; license: string }
export interface SastFinding { file: string; line: number | ''; rule: string; severity: Severity; cwe: string; message: string; snippet: string }
export interface SecretFinding { file: string; line: number | ''; type: string; status: 'DETECTED'; value: string }
export interface Attachment { name: string; path: string; contentType: string }
export interface E2ETest { kind: 'E2E' | 'Unit'; feature: string; name: string; status: TestStatus; duration: number; error: string; attachments: Attachment[] }
export interface LogEntry { path: string; text: string }

export interface PipelineReport {
  summary: Summary;
  jobs: JobInfo[];
  components: ComponentInfo[];
  cves: Vulnerability[];
  licenses: LicenseInfo[];
  sboms: SbomComponent[];
  sasts: SastFinding[];
  secrets: SecretFinding[];
  e2e: E2ETest[];
  logs: LogEntry[];
  warnings: string[];
  meta: Record<string, unknown>;
}
