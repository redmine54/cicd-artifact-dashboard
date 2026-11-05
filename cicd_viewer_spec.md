
# CI/CD Artifact Explorer & Security Dashboard PoC 設計書

## 1. 概要

### 1.1 目的

GitLab CI/CDで生成された統合Artifact ZIPをブラウザへドラッグ＆ドロップし、各種検査結果を可視化するダッシュボードを提供する。

対象データ

- CVE
- License
- SBOM
- SAST
- Secret Scan
- E2E
- Build
- Unit Test
- Job Log

### 1.2 特徴

- React + Vite構成
- SpringBoot不要（PoC）
- ZIPをブラウザ内で解凍
- サーバレスで動作
- 検索可能
- ソート可能
- フィルタ可能
- 色分け表示
- E2E証跡表示
- Jobログ検索

---

# 2. システム構成

```text
+---------------------------------------------------+
| Browser                                           |
|                                                   |
| React(Vite)                                       |
|                                                   |
| Drag & Drop Artifact ZIP                          |
|                 ↓                                 |
|            JSZip解凍                              |
|                 ↓                                 |
|           Artifact解析                            |
|                 ↓                                 |
|         SecurityReport生成                        |
|                 ↓                                 |
|         Dashboard表示                             |
+---------------------------------------------------+
```

---

# 3. アーキテクチャ

```text
Artifact ZIP

    ↓

Zip Loader

    ↓

Artifact Parser

    ↓

Security Report Model

    ↓

Dashboard Renderer
```

---

# 4. 利用技術

## フロントエンド

- React
- TypeScript
- Vite

## ライブラリ

```bash
npm install jszip
npm install react-dropzone
npm install @tanstack/react-table
npm install lucide-react
npm install recharts
```

---

# 5. 入力Artifact構成

対象ZIP

```text
pipeline.zip

├─ metadata.json

├─ build/
│   ├─ job.log
│   └─ build.json

├─ unit-test/
│   ├─ junit.xml
│   └─ job.log

├─ sbom/
│   ├─ sbom.json
│   └─ job.log

├─ cve/
│   ├─ trivy.json
│   └─ job.log

├─ license/
│   ├─ license.json
│   └─ job.log

├─ sast/
│   ├─ results.sarif
│   └─ job.log

├─ secret/
│   ├─ gitleaks.json
│   └─ job.log

└─ e2e/
    ├─ playwright.json
    ├─ screenshots/
    ├─ videos/
    ├─ trace/
    └─ job.log
```

---

# 6. 機能一覧

| 機能 | 内容 |
|--------|------|
| ZIP読込 | Drag & Drop |
| Artifact解析 | 自動 |
| CVE表示 | 表形式 |
| License表示 | 表形式 |
| SBOM表示 | 表形式 |
| SAST表示 | 表形式 |
| Secret表示 | 表形式 |
| E2E表示 | 表＋画像 |
| Job表示 | 実行結果 |
| Log表示 | 全文検索 |
| Search | 横断検索 |
| Trend | 将来実装 |

---

# 7. 画面構成

```text
+---------------------------------------------------------------+
| CI/CD Artifact Dashboard                                      |
+---------------------------------------------------------------+

 Summary | Jobs | Components | CVE | License | SBOM

 SAST | Secret | E2E | Logs | Search
```

---

# 8. Summary画面

## 目的

全体状況把握

## 表示

| Category | Count | Status |
|-----------|-------:|--------|
| Critical CVE | 3 | NG |
| High CVE | 12 | NG |
| GPL License | 1 | WARN |
| Secret | 2 | NG |
| Failed Test | 4 | NG |

---

# 9. Jobs画面

## 目的

Pipeline全体確認

## 表示

| Job | Status | Duration | Artifact Size |
|------|---------|------------|------------|
| Build | Success | 1m32s | 30MB |
| CVE | Success | 12s | 1.2MB |
| License | Success | 3s | 200KB |
| E2E | Failed | 15m | 500MB |

## 詳細表示

クリックで

- Job Log
- 深刻なエラー
- Warning

を表示

---

# 10. Components画面

## 目的

コンポーネント横断管理

## 表示

| Component | Version | License | Critical | High | SAST | Secret | Fixed Version |
|------------|------------|------------|---------:|------:|------:|------:|------------|
| log4j-core | 2.14.1 | Apache-2.0 | 1 | 3 | 0 | 0 | 2.17.2 |
| spring-web | 5.3.10 | Apache-2.0 | 0 | 2 | 1 | 0 | 5.3.39 |

---

# 11. CVE画面

## 表示

| Component | Current | Fixed | CVE | Severity | CVSS | Published |
|------------|------------|------------|------------|------------|------:|------------|
| log4j-core | 2.14.1 | 2.17.2 | CVE-2021-44228 | Critical | 10.0 | 2021-12-10 |

## 詳細情報

- Description
- CVSS
- CWE
- Fixed Version
- Reference URL

---

# 12. License画面

## 表示

| Component | Version | License | Category | Approved |
|------------|------------|------------|------------|------------|
| log4j-core | 2.14.1 | Apache-2.0 | Permissive | Yes |
| sample-lib | 1.0.0 | GPL-3.0 | Copyleft | No |

---

# 13. SBOM画面

## 表示

| Component | Version | Type | Supplier | PURL |
|------------|------------|------------|------------|------------|
| log4j-core | 2.14.1 | Maven | Apache | pkg:maven/... |

## 依存関係

```text
spring-web

├─ spring-core
├─ spring-context
└─ spring-beans
```

---

# 14. SAST画面

## 表示

| File | Line | Rule | Severity | CWE |
|--------|------:|--------|--------|--------|
| LoginServlet.java | 142 | SQL Injection | High | CWE-89 |

## 詳細

- ファイルパス
- ソース抜粋
- メッセージ
- 推奨対応

---

# 15. Secret画面

## 表示

| File | Line | Secret Type | Status |
|--------|------:|------------|------------|
| application.yml | 12 | AWS Key | DETECTED |

## セキュリティ要件

秘密値は絶対に表示しない

表示例

```text
********************
```

---

# 16. E2E画面

## サマリー

| Item | Count |
|--------|------:|
| Total | 120 |
| Pass | 117 |
| Fail | 3 |
| Skip | 0 |

---

## テストケース

| Feature | Test Case | Status | Duration |
|------------|------------|------------|------------|
| Login | Login | PASS | 2.1s |
| User | Search User | FAIL | 12.3s |

---

## 詳細表示

- Error Message
- Screenshot
- Video
- Trace

---

# 17. Logs画面

## 検索

```text
Keyword

[ ERROR________________ ]
```

## 結果

```text
build/job.log

sast/job.log

e2e/job.log
```

## ログビューア

```text
行番号表示

色分け

フィルタ
```

---

# 18. Search画面

## 目的

横断検索

## 入力

```text
log4j
```

## 出力

### Component

```text
log4j-core
```

### CVE

```text
CVE-2021-44228
```

### License

```text
Apache-2.0
```

### SBOM

```text
pkg:maven/...
```

### Logs

```text
build/job.log
```

---

# 19. 型設計

## ルートモデル

```typescript
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
}
```

---

# 20. Parser構成

```text
src/parser

zipParser.ts

trivyParser.ts

licenseParser.ts

sbomParser.ts

sarifParser.ts

gitleaksParser.ts

playwrightParser.ts

junitParser.ts
```

---

# 21. ディレクトリ構成

```text
src/

├─ parser/
│   ├─ zipParser.ts
│   ├─ trivyParser.ts
│   ├─ sbomParser.ts
│   ├─ licenseParser.ts
│   ├─ sarifParser.ts
│   ├─ gitleaksParser.ts
│   └─ playwrightParser.ts
│
├─ components/
│   ├─ DropZone.tsx
│   ├─ SummaryTab.tsx
│   ├─ JobsTab.tsx
│   ├─ ComponentsTab.tsx
│   ├─ CveTab.tsx
│   ├─ LicenseTab.tsx
│   ├─ SbomTab.tsx
│   ├─ SastTab.tsx
│   ├─ SecretTab.tsx
│   ├─ E2ETab.tsx
│   ├─ LogsTab.tsx
│   └─ SearchTab.tsx
│
├─ types/
│   └─ security.ts
│
├─ App.tsx
│
└─ styles/
    └─ dashboard.css
```

---

# 22. Phase1 完成条件

以下が動作すること

- ZIPドラッグ＆ドロップ
- JSZip解凍
- Artifact解析
- Summary表示
- Jobs表示
- Components表示
- CVE表示
- License表示
- SBOM表示
- SAST表示
- Secret表示
- E2E表示
- ログ検索
- 横断検索
- 色分け
- ソート
- フィルタ

---

# 23. Phase2（将来）

- SpringBoot
- Artifact保存
- 日次履歴
- Diff比較
- Trend表示
- GitLab API連携
- 認証
- 複数ユーザー対応
- レポートエクスポート
