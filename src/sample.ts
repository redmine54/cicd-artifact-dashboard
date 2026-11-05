import JSZip from 'jszip';

/** 動作確認用のサンプルArtifact ZIPをブラウザ内で生成する */
export async function createSampleZip(): Promise<File> {
  const z = new JSZip();
  const J = JSON.stringify;
  z.file('metadata.json', J({ pipeline: '#1024', commit: 'a1b2c3d', jobs: [{ name: 'build', status: 'Success', duration: '1m32s' }, { name: 'e2e', status: 'Failed', duration: '15m' }] }));
  z.file('build/job.log', 'Compiling...\nWARN deprecated API\nBUILD SUCCESS');
  z.file('unit-test/junit.xml', '<testsuite><testcase classname="UserTest" name="create" time="0.2"/><testcase classname="UserTest" name="delete" time="0.1"><failure>expected 1 but was 0</failure></testcase></testsuite>');
  z.file('unit-test/job.log', 'Running tests\nERROR 1 test failed');
  z.file('cve/trivy.json', J({ Results: [{ Vulnerabilities: [
    { PkgName: 'log4j-core', InstalledVersion: '2.14.1', FixedVersion: '2.17.2', VulnerabilityID: 'CVE-2021-44228', Severity: 'CRITICAL', CVSS: { nvd: { V3Score: 10 } }, PublishedDate: '2021-12-10T00:00:00Z', Title: 'Log4Shell', Description: 'JNDI lookupによるリモートコード実行', CweIDs: ['CWE-502'] },
    { PkgName: 'spring-web', InstalledVersion: '5.3.10', FixedVersion: '5.3.39', VulnerabilityID: 'CVE-2024-38809', Severity: 'HIGH', CVSS: { nvd: { V3Score: 7.5 } }, PublishedDate: '2024-09-27T00:00:00Z', Title: 'DoS' }] }] }));
  z.file('cve/job.log', 'trivy scan done');
  z.file('license/license.json', J([{ name: 'log4j-core', version: '2.14.1', license: 'Apache-2.0' }, { name: 'sample-lib', version: '1.0.0', license: 'GPL-3.0' }]));
  z.file('sbom/sbom.json', J({ components: [{ name: 'log4j-core', version: '2.14.1', type: 'library', supplier: { name: 'Apache' }, purl: 'pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1' }, { name: 'spring-web', version: '5.3.10', type: 'library', purl: 'pkg:maven/org.springframework/spring-web@5.3.10' }] }));
  z.file('sast/results.sarif', J({ runs: [{ tool: { driver: { rules: [{ id: 'S1', name: 'SQL Injection', properties: { tags: ['CWE-89'] } }] } }, results: [{ ruleId: 'S1', level: 'error', message: { text: '入力値がSQLに連結されています' }, locations: [{ physicalLocation: { artifactLocation: { uri: 'src/LoginServlet.java' }, region: { startLine: 142 } } }] }] }] }));
  z.file('secret/gitleaks.json', J([{ File: 'application.yml', StartLine: 12, RuleID: 'aws-access-key', Secret: 'AKIAXXXXXXXXXXXXXXXX' }]));
  z.file('e2e/playwright.json', J({ suites: [
    { title: 'Login', specs: [{ title: 'Login', ok: true, tests: [{ status: 'expected', results: [{ duration: 2100 }] }] }] },
    { title: 'User', specs: [{ title: 'Search User', ok: false, tests: [{ status: 'unexpected', results: [{ duration: 12300, error: { message: 'Timeout 10000ms exceeded.' } }] }] }] }] }));
  z.file('e2e/job.log', 'Running 2 tests\nERROR Search User failed');
  return new File([await z.generateAsync({ type: 'blob' })], 'sample-pipeline.zip');
}
