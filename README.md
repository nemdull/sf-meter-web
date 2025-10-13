# SF Meter

Chakra UI v3 を利用した SF テーマのメーターアプリです。  
現在はフロントエンドの UI 領域のみを構築しており、トップにサイトタイトルを表示し、その下にテクノロジーごとのカードを並べる構成になっています。

## 画面構成 (2025-02 時点)

- 画面上部に `SF Meter` のヘッダーを固定表示。
- 中央に技術カード (`TechCard`) を 1 件表示。  
  - カードには名前・説明・実現度スコアを表示し、Chakra UI の `Progress` コンポーネント (namespace API) でメーターを描画。
- 全体を暗色系の背景 & 角丸カードで統一。

## 開発環境

- React 19 + TypeScript + Vite
- Chakra UI v3 (`@chakra-ui/react`), Emotion, Framer Motion

### セットアップ

```bash
npm install
```

### 開発サーバー

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

*Node.js 22.11.0 でビルドすると Vite から警告が出るため、22.12 以上または 20.19 以上を推奨。*

## ディレクトリ構成 (主要部分)

```
src/
├─ app/
│  └─ App.tsx              # グローバルなエントリーポイント
├─ pages/
│  └─ home/
│     └─ HomePage.tsx      # トップページの UI とデータ
├─ shared/
│  └─ ui/
│     └─ molecules/
│        └─ tech-card/
│           ├─ TechCard.tsx
│           └─ index.ts
└─ main.tsx                 # ReactDOM ルート & プロバイダー
```

Atomic Design の考え方に合わせて UI コンポーネントは `shared/ui/molecules` 配下に配置し、ページ単位の構造は `pages/home` にまとめています。`app` ディレクトリはアプリケーションの初期化やグローバルレイアウトを担当する層です。

TypeScript / Vite のパスエイリアスとして `@/` を `src/` に割り当てています。（例: `import TechCard from '@/shared/ui/molecules/tech-card'`）

## 主なコンポーネント

- `src/app/App.tsx`  
  アプリ全体のエントリーポイントとして、ページを切り替える役割を担います。
- `src/pages/home/HomePage.tsx`  
  ヘッダーとメインエリアを構築し、ピックアップ技術カードを表示。
- `src/shared/ui/molecules/tech-card/TechCard.tsx`  
  テクノロジー情報を表示するカード。Progress コンポーネントの namespace API (`Progress.Root`, `Progress.Track`, `Progress.Range`) を使用。

## 今後の TODO

- 複数カードの一覧表示やデータ管理。
- スコアのバリエーションや色分け設定。
- Node.js バージョンの更新とビルドサイズ最適化。
