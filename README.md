# 盾閃（Junsen）Web Prototype

GitHub Pagesでそのまま遊べる、依存ライブラリなしのHTML5ゲームです。

## 遊び方
- 上盾 / 中盾: 盾の高さを変更し、その位置を維持
- ←← / →→: ステップバック / ステップイン
- 小攻撃 / 大攻撃: タップで通常攻撃
- 攻撃ボタンを約0.4秒以上長押しして離す: ゲージ100%ならガード不能の必殺
- 通常攻撃を正しい高さで防ぐとゲージ増加
- CPUの必殺はタイミングの合ったジャストガードだけで防御可能

PC: 矢印キー、X=小攻撃、C=大攻撃。

## GitHub Pages
1. ZIPを展開
2. 中身をGitHubリポジトリのルートへアップロード
3. Settings → Pages → Deploy from a branch
4. main / root を選択
5. 公開されたURLをスマホで開く

## ファイル
- index.html
- game.js
