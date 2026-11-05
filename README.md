# CI/CD Artifact Dashboard (PoC)

GitLab CI/CD が出力した統合 Artifact ZIP をブラウザにドラッグ＆ドロップするだけで、
CVE・ライセンス・SBOM・SAST・Secret・E2E・ログなどの検査結果を一覧できるダッシュボードです。

- React + TypeScript + Vite(サーバ不要のPoC)
- ZIPの解凍と解析はすべてブラウザ内で完結(ファイルは外部に送信されません)
- 検索、ソート、絞り込み、色分け、E2Eのスクリーンショット/動画表示、ログ検索、横断検索

設計の詳細は `cicd_viewer_spec.md`(設計書)を参照してください。

## 必要環境

- Node.js 18 以上(20 以上を推奨)
- npm

## セットアップと起動

```bash
npm install
npm run dev      
```
 http://localhost:5173 で起動

その他のコマンド:

```bash
npm run build    # 型チェック + 本番ビルド(dist/ に出力)
npm run preview  # ビルド結果の確認
```

`dist/` は静的ファイルのみなので、任意のWebサーバや社内の静的ホスティングに置けます。

## 使い方

1. 画面に Artifact ZIP をドロップ(またはクリックして選択)
2. タブで結果を切り替える
   - **Summary**: 全体の合否
   - **Jobs / Components / CVE / License / SBOM / SAST / Secret / E2E**: 表形式。見出しクリックでソート、上部の入力欄で絞り込み、行クリックで詳細(CVEの説明、SASTのメッセージ、E2Eのエラーと証跡など)
   - **Logs**: `job.log` を行番号つきで表示。キーワード検索、ERROR/WARNの絞り込み
   - **Search**: Component、CVE、License、SBOM、Logs を横断検索
3. ZIPが手元にない場合は「サンプルデータで試す」で動作を確認できます

## 入力ZIPの構成

```text
pipeline.zip
├─ metadata.json            (任意。jobs: [{name, status, duration}] を入れるとJobs画面に反映)
├─ build/        job.log, build.json
├─ unit-test/    junit.xml, job.log
├─ sbom/         sbom.json (CycloneDX)
├─ cve/          trivy.json
├─ license/      license.json
├─ sast/         results.sarif
├─ secret/       gitleaks.json
└─ e2e/          playwright.json, screenshots/, videos/, trace/, job.log
```

ファイルは名前のパターンで探します(例: `trivy.json`、`*.sarif`、`gitleaks*.json`、`playwright*.json`、`junit*.xml`、`sbom*.json`、`license*.json`、`job.log`)。
フォルダ階層が少し違っていても読み込めます。読めないJSONは Summary に警告として表示されます。

## ディレクトリ構成

```text
src/
├─ parser/        zipParser.ts を入口に、形式ごとのパーサ(trivy / license / sbom / sarif / gitleaks / playwright / junit)
├─ components/    DropZone, DataTable(共通テーブル), SummaryTab, TableTabs(Jobs〜Secret), E2ETab, LogsTab, SearchTab
├─ types/         security.ts(PipelineReport などのモデル)
├─ styles/        dashboard.css
├─ sample.ts      動作確認用のサンプルZIP生成
└─ App.tsx
```

新しい検査ツールに対応するときは、`parser/` にパーサを追加し、`zipParser.ts` で呼び出し、`types/security.ts` にモデルを足します。

## セキュリティ上の注意

- Gitleaks の結果は秘密値(`Secret` / `Match`)を読み取らず、常に `********************` で表示します。
- ZIP内のJSON、ログ、エラーメッセージはHTMLとして解釈せず、テキストとして描画します。
- ZIPには機密情報(ログ、ソース抜粋、スクリーンショット)が含まれる場合があります。共有の際は取り扱いに注意してください。

## Git で管理する

```bash
git init
git add .
git commit -m "Initial commit: CI/CD Artifact Dashboard PoC"
```

`node_modules/` と `dist/` は `.gitignore` で除外済みです。`package-lock.json` はコミットしてください。

## 既知の制限(PoC)

- Playwright の trace は、ファイル名の表示のみです(Trace Viewer 連携は未対応)。
- SBOMの依存関係ツリー表示は未対応です。
- Components画面のSAST/Secret件数は、ファイルパスにコンポーネント名が含まれるものを数える簡易集計です。
- 非常に大きなZIP(数百MB)は、ブラウザのメモリを多く使います。
- Jobsの状態は、`metadata.json` がない場合はログとテスト結果からの推測です。
- 設計書にある `recharts` / `lucide-react` は、現時点では使っていません(グラフやアイコンを足すときに追加してください)。

## 今後(Phase 2)

Spring Boot連携、Artifact保存、日次履歴、差分比較、Trend表示、GitLab API連携、認証、レポートエクスポート。
