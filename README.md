# SHIBUYA SLOPE WALK

渋谷区の坂道や裏路地をモチーフにした、手描きアニメ風・セルシェーディング風の3D探索Webサイトです。

このプロジェクトは、実在の渋谷区を完全再現したものではありません。渋谷にありそうな坂道、裏路地、住宅街、雑居ビル、小さな看板、生活感のある小物を組み合わせた、オリジナルの架空都市として制作しています。

## 特徴

- Vite + React + TypeScript
- React Three Fiber / Three.js
- 手描きアニメ風、トゥーン調、濃いグレーのアウトライン
- 三人称視点のプレイヤー操作
- 奥へ向かって下る曲がった坂道
- 自販機、カラーコーン、標識、ガードレール、電柱、室外機、配管などの小物
- 画像テクスチャ、GLBモデル、実在ロゴ、実在店舗名は不使用
- Vercel公開を想定した構成

## 操作方法

- `W`：前進
- `S`：後退
- `A`：左移動
- `D`：右移動
- `Shift`：少し速く歩く
- `Mouse`：視点移動
- `Click`：探索開始 / マウスロック
- `Esc`：マウスロック解除

## 開発方法

```bash
npm install
npm run dev
```

ローカルサーバーが起動したら、表示されたURLをブラウザで開いてください。

## 型チェック

```bash
npm run typecheck
```

## ビルド

```bash
npm run build
```

`dist/` フォルダが生成されます。

## プレビュー

```bash
npm run preview
```

## Vercelで公開する場合

Vercelでこのリポジトリを読み込み、以下の設定でデプロイできます。

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Install Command：`npm install`

特別な設定が不要なため、`vercel.json` は作成していません。

## 制作方針

このサイトは、フォトリアルな都市再現ではなく、ブラウザで歩ける小さな手描きアニメ風の街を目指しています。

以下は意図的に避けています。

- フォトリアル表現
- 夜景ネオン、サイバーパンク表現
- 大型ビジョン中心のスクランブル交差点
- 実在店舗名、企業ロゴ、実在看板
- Googleマップやストリートビュー画像の使用
- 外部画像テクスチャ、GLBモデル
- 重いポストプロセス

## 主なファイル構成

```text
src/
  App.tsx
  main.tsx
  styles/global.css
  components/
    scene/
    player/
    world/
    props/
    toon/
    ui/
  hooks/
  data/
  utils/
```
