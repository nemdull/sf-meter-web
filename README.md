# sf-meter-web

SF 作品に出てくるテクノロジーが、いまどれくらい現実に近いか。それを 0〜100 の「実現度」で見せる、[sf-meter-api](https://github.com/nemdull/sf-meter-api) の画面です。

- 動いているもの: [nemdull.github.io/sf-meter-web](https://nemdull.github.io/sf-meter-web/)（API は置いていないので、同梱のサンプルデータで動きます）
- API: [sf-meter-api](https://github.com/nemdull/sf-meter-api)（Go）
- 全体の入り口: [sf-meter](https://github.com/nemdull/sf-meter)
- 作った人: [nemdull.com](https://www.nemdull.com/)

## できること

- 大きな計器が、選んだ技術の実現度を針で指す。「ほかの技術を引く」で、どれか 1 件を引ける
- 名前や説明で探す、段階（まだ SF／研究中／ほぼ現実）で絞る、並び順を変える。カードは、新しい場所まで動いて並び直す
- 絞り込んだ状態は URL に残るので、そのまま人に渡せる（例: `?level=reality&sort=name`）
- **API につながらなくても止まらない。** 同梱のサンプルデータに切り替えて、同じ条件で同じ結果を出す。画面の右上に、いまどちらのデータかが出る
- 端末の「動きを減らす」設定がオンなら、針やカードの動きを止める

## 動かす

```bash
npm install
npm run dev        # http://localhost:5173
```

API も一緒に動かすと、本物のデータになります。別のターミナルで:

```bash
# sf-meter-api のフォルダで
go run .           # http://localhost:8080
```

開発サーバーは、`/api` へのリクエストを `http://localhost:8080` へ中継します（`vite.config.ts`）。API を起こしていなければ、自動でサンプルデータになります。

| コマンド | すること |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm test` | テスト（Vitest） |
| `npm run lint` | ESLint |
| `npm run build` | 型チェックとビルド |
| `npm run preview` | ビルド結果の確認 |

Node.js は 22.12 以上、または 20.19 以上。

## API とのつなぎ方

| 画面がやること | 呼ぶ API |
| --- | --- |
| 一覧（検索・絞り込み・並べ替え） | `GET /api/v1/techs?q=&min_score=&max_score=&sort=` |
| 件数・平均・段階ごとの内訳 | `GET /api/v1/stats` |
| ほかの技術を引く | `GET /api/v1/techs/random` |

画面と API を別の場所に置くときは、`.env.example` を `.env.local` にコピーして `VITE_API_BASE_URL` を書きます。API 側の `CORS_ALLOWED_ORIGINS` に、画面の URL を足してください。

画面だけを静的なホスティングに置いても動きます（その場合は、ずっとサンプルデータです）。

## コンテナで動かす

```bash
docker build -t sf-meter-web .
docker run --rm -p 5173:80 sf-meter-web      # http://localhost:5173
```

中身は nginx で、ビルドした静的ファイルを配り、`/api` だけを `API_UPSTREAM`（既定は `http://api:8080`）へ中継します。API と DB も一緒に立ち上げるなら、[sf-meter](https://github.com/nemdull/sf-meter) の `docker compose up` が早いです。

## 公開している画面

main が進むたびに、GitHub Actions が画面を組み立てて `gh-pages` ブランチへ置き、GitHub Pages が [nemdull.github.io/sf-meter-web](https://nemdull.github.io/sf-meter-web/) で配ります（[.github/workflows/pages.yml](.github/workflows/pages.yml)）。

そこには API を置いていません。画面は `/api` に届かないことを確かめてから、同梱のサンプルデータに切り替えます。右上の表示が「サンプルデータ」になっていれば、その状態です。

## 構成

```
src/
├─ app/
│  ├─ App.tsx              # 入り口
│  └─ theme.ts             # 色と書体（Chakra UI の system）
├─ pages/
│  └─ home/
│     ├─ HomePage.tsx      # 画面の組み立てと、条件・選んだ技術の状態
│     └─ useBoard.ts       # 一覧と集計の読み込み（入力の待ち合わせ・取り消し・つなぎ直し）
├─ shared/
│  ├─ api/techs.ts         # API の呼び出し。つながらなければサンプルデータに切り替える
│  ├─ data/sample.ts       # サンプルデータ（API の初期データと同じ 15 件）
│  ├─ lib/tech.ts          # 型と決まりごと（段階の区切り、絞り込み、並べ替え、集計、URL との行き来）
│  └─ ui/molecules/
│     ├─ meter/            # 針で示す計器（SVG）
│     ├─ tech-card/        # 技術 1 件のカード
│     ├─ level-bar/        # 段階ごとの件数の帯
│     └─ source-badge/     # いまのデータが API かサンプルかの表示
└─ main.tsx
nginx/default.conf.template   # コンテナで配るときの nginx の設定
Dockerfile                    # ビルド → nginx
```

`@/` は `src/` を指します（例: `import Meter from '@/shared/ui/molecules/meter'`）。

## テスト

`src/shared/lib/tech.test.ts` で、絞り込み・並べ替え・集計・URL との行き来を確かめています。

期待値は、API 側のテスト（sf-meter-api の `presentation/handler_test.go`）と同じにしてあります。API につながらないときにサンプルデータへ切り替えても、同じ条件なら同じ結果になる、というのを両方のリポジトリで確かめるためです。

## 使っているもの

React 19、TypeScript、Vite、Chakra UI v3、Framer Motion（カードの並び直しと、数字の動き）、Vitest。

## ライセンス

[MIT License](LICENSE)
