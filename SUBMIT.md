# Base Score: Institutional Credit Protocol

> The first ZK-proven credit scoring layer for undercollateralized lending on Base.

## 概要

Base Scoreは、**機関投資家やDAOのための「信用スコア」プロトコル**です。
従来のDeFiは「過剰担保」が前提で資金効率が悪く、法人融資には不向きでした。本プロダクトは、オンチェーン履歴とオフチェーン財務状況を**ゼロ知識証明(ZK)**を用いてプライバシーを守りつつスコアリングし、**「信用に基づく無担保/低担保融資」**を実現可能にします。

## デモ

- **アプリURL**: [Localhost Demo]
- **スライド**: [View Slides (Markdown)](./SLIDES.md)
- **デモ動画**: [Watch Demo (WebP)](./demo.webp) <!-- TODO: Upload this video to YouTube/Loom/Drive for final submission -->

## 推しポイント

1.  **脱・過剰担保 (Capital Efficiency)**
    - 従来のDeFiは100万円借りるのに150万円預ける必要がありました。Base Scoreは「財務健全性(Treasury)」と「収益力(CashFlow)」を評価することで、**信用力に応じたクレジットライン（融資枠）**を提供します。

2.  **ZKプライバシー保護 (Privacy Preserving)**
    - 「銀行残高や取引先は見せたくないが、信用力は証明したい」。この矛盾を**Noir (ZK Circuit)**で解決。具体的な財務データの中身は隠したまま、「健全であること」だけをオンチェーンで証明します。

3.  **機関グレードの信頼性 (Institutional Trust)**
    - 単なる取引履歴だけでなく、KYC/KYB（本人確認・法人確認）済みのウォレットを前提とした**Prime, High Growth, Speculative**の格付けロジックを実装。実社会の金融基準に即したスコアリングを提供します。

## 使用技術

- **フロントエンド**: HTML5, Vanilla JS, CSS3 (No Framework for Lightweight MVP)
- **ブロックチェーン**: Base (Coinbase L2)
- **ライブラリ**: Viem (Wallet Connect), Ethers.js (ENS Resolution)
- **暗号技術**: Noir (ZK Proof Logic - *Concept*)

## チームメンバー

- **Lead Developer**: @kouki3fujita-alt

---

*このプロジェクトは「12/13-20 大喜利.hack vibecoding mini hackathon」で作成されました*
